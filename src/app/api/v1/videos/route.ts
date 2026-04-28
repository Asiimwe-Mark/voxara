import { supabaseAdmin } from '@/lib/supabase/admin';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';


async function validateApiKey(request: NextRequest): Promise<string | null> {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) return null;
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const { data: keyData } = await supabaseAdmin
    .from('api_keys')
    .select('user_id, status, expires_at')
    .eq('key_hash', keyHash)
    .single();
  if (!keyData || keyData.status !== 'active') return null;
  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) return null;
  await supabaseAdmin.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('key_hash', keyHash);
  return keyData.user_id;
}

export async function GET(request: NextRequest) {
  const userId = await validateApiKey(request);
  if (!userId) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  const { data: videos, error } = await supabaseAdmin
    .from('videos')
    .select('id, title, status, mux_playback_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ videos });
}

export async function POST(request: NextRequest) {
  const userId = await validateApiKey(request);
  if (!userId) return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });

  let body: { topic?: string; script?: string; webhook_url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { topic, script: providedScript, webhook_url } = body;

  if (!topic && !providedScript) {
    return NextResponse.json({ error: 'Either topic or script is required' }, { status: 400 });
  }

  // Check user credits atomically
  const { data: deducted } = await supabaseAdmin.rpc('deduct_credits', {
    p_user_id: userId,
    p_credits: 1,
  });

  if (!deducted) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
  }

  try {
    let finalScript = providedScript ?? '';

    // Generate script from topic if not provided
    if (!finalScript && topic) {
      const { generateScript } = await import('@/features/video/services/script-generator');
      finalScript = await generateScript(topic);
    }

    // Create video record
    const { data: video, error: insertError } = await supabaseAdmin
      .from('videos')
      .insert({
        user_id: userId,
        title: topic ?? finalScript.slice(0, 80),
        script: finalScript,
        status: 'pending',
        webhook_url: webhook_url ?? null,
      })
      .select('id, title, status, created_at')
      .single();

    if (insertError || !video) {
      // Refund credit on DB error
      await supabaseAdmin.rpc('add_credits', { p_user_id: userId, p_credits: 1 });
      return NextResponse.json({ error: 'Failed to create video record' }, { status: 500 });
    }

    // Trigger background generation
    await inngest.send({
      name: 'video/generate',
      data: {
        videoId: video.id,
        userId,
        title: video.title,
        script: finalScript,
      },
    });

    return NextResponse.json(
      {
        id: video.id,
        title: video.title,
        status: video.status,
        created_at: video.created_at,
      },
      { status: 202 }
    );
  } catch (err) {
    // Refund credit on unexpected error
    try {
      await supabaseAdmin.rpc('add_credits', { p_user_id: userId, p_credits: 1 });
    } catch { }
    logger.error('v1/videos POST error', { detail: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export { OPTIONS } from '@/lib/api/cors';
