import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';


export async function trackViewStart(videoId: string, sessionId: string, data: Record<string, unknown>) {
  await supabaseAdmin.from('viewer_sessions').upsert({
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
  const { data: session } = await supabaseAdmin
    .from('viewer_sessions')
    .select('playback_events')
    .eq('session_id', sessionId)
    .single();

  if (session) {
    const events = session.playback_events || [];
    events.push({ type: 'progress', progress, time: currentTime, timestamp: new Date().toISOString() });
    await supabaseAdmin
      .from('viewer_sessions')
      .update({ playback_events: events, watch_duration: currentTime, watch_percentage: progress })
      .eq('session_id', sessionId);
  }
}

export async function trackViewComplete(sessionId: string, duration: number) {
  await supabaseAdmin
    .from('viewer_sessions')
    .update({ end_time: new Date().toISOString(), watch_duration: duration, watch_percentage: 100 })
    .eq('session_id', sessionId);
}