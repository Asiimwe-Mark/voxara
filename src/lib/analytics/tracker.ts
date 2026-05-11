import { getAdminClient } from '@/lib/supabase/admin';


export async function trackViewStart(videoId: string, sessionId: string, data: Record<string, unknown>) {
  const sb = getAdminClient();
  // FIX: Cast to any to bypass type issues with Supabase generated types
  await (sb.from('viewer_sessions') as any).upsert({
    video_id: videoId,
    session_id: sessionId,
    viewer_id: data.viewerId,
    start_time: new Date().toISOString(),
    device_type: data.deviceType,
    browser: data.browser,
    country: data.country,
    referrer: data.referrer,
    utm_source: data.utmSource,
    utm_medium: data.utmMedium,
    utm_campaign: data.utmCampaign,
  }, { onConflict: 'session_id' });
}

export async function trackViewProgress(sessionId: string, progress: number, currentTime: number) {
  const sb = getAdminClient();
  const { data: session } = await sb
    .from('viewer_sessions')
    .select('playback_events')
    .eq('session_id', sessionId)
    .single();

  if (session) {
    // FIX: Cast to proper array type
    const events = ((session.playback_events as unknown[]) || []) as Array<{ type: string; progress: number; time: number; timestamp: string }>;
    events.push({ type: 'progress', progress, time: currentTime, timestamp: new Date().toISOString() });
    await sb
      .from('viewer_sessions')
      .update({ playback_events: events as any, watch_duration: currentTime, watch_percentage: progress })
      .eq('session_id', sessionId);
  }
}

export async function trackViewComplete(sessionId: string, duration: number) {
  const sb = getAdminClient();
  await sb
    .from('viewer_sessions')
    .update({ end_time: new Date().toISOString(), watch_duration: duration, watch_percentage: 100 })
    .eq('session_id', sessionId);
}