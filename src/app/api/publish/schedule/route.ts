import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/inngest/client';
import { z } from 'zod';

const scheduleSchema = z.object({
  videoId: z.string().uuid(),
  platform: z.enum(['youtube', 'tiktok', 'instagram', 'linkedin']),
  scheduledAt: z.string().datetime(),
  title: z.string().max(100).optional(),
  caption: z.string().max(2200).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = scheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { videoId, platform, scheduledAt, title, caption } = parsed.data;

  // Verify ownership
  const { data: video } = await supabase
    .from('videos')
    .select('id, title, status')
    .eq('id', videoId)
    .eq('user_id', user.id)
    .single();

  if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  if (video.status !== 'ready') {
    return NextResponse.json({ error: 'Video must be ready to schedule publishing' }, { status: 400 });
  }

  const scheduledDate = new Date(scheduledAt);
  if (scheduledDate <= new Date()) {
    return NextResponse.json({ error: 'Scheduled time must be in the future' }, { status: 400 });
  }

  const { data: schedule, error } = await supabase
    .from('publishing_schedules')
    .insert({
      user_id: user.id,
      video_id: videoId,
      platform,
      scheduled_at: scheduledAt,
      title: title ?? video.title,
      caption: caption ?? null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Schedule the Inngest function to fire at the right time
  await inngest.send({
    name: 'social/publish-scheduled',
    data: { scheduleId: schedule.id },
    ts: scheduledDate.getDate(),
  });

  return NextResponse.json({ success: true, schedule }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('publishing_schedules')
    .select('*, videos(title, status)')
    .eq('user_id', user.id)
    .order('scheduled_at', { ascending: true });

  return NextResponse.json({ schedules: data ?? [] });
}
