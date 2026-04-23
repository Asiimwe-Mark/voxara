import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { inngest } from '@/inngest/client';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function validateApiKey(request: NextRequest): Promise<string | null> {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) return null;
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  const { data } = await supabaseAdmin
    .from('api_keys')
    .select('user_id, status, expires_at')
    .eq('key_hash', keyHash)
    .single();
  if (!data || data.status !== 'active') return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  await supabaseAdmin.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('key_hash', keyHash);
  return data.user_id;
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
    await supabaseAdmin.rpc('add_credits', { p_user_id: userId, p_credits: 1 }).catch(() => {});
    console.error('v1/videos POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}