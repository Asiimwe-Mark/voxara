import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

// Minimal clip schema — extend as your timeline editor evolves
const clipSchema = z.object({
  id: z.string(),
  trackId: z.string(),
  start: z.number().int().nonnegative(),
  end: z.number().int().positive(),
  type: z.enum(['video', 'audio', 'text', 'image']),
  url: z.string().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

const trackSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['video', 'audio', 'text']),
  volume: z.number().min(0).max(2).optional(),
  clips: z.array(clipSchema),
});

const timelineSchema = z.object({
  tracks: z.array(trackSchema),
  duration: z.number().int().positive().optional(),
});

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
   const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: video, error } = await supabase
    .from('videos')
    .select('id, timeline, duration_frames')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  return NextResponse.json({
    timeline: video.timeline ?? { tracks: [] },
    durationFrames: video.duration_frames ?? 900,
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
   const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership
  const { data: existing } = await supabase
    .from('videos')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  if (!existing) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = timelineSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('videos')
    .update({ timeline: parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, timeline')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
