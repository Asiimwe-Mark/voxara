import { getAdminClient } from '@/lib/supabase/admin';
import { inngest } from '@/inngest/client';
import { cron } from 'inngest';


export const aggregateVideoMetrics = inngest.createFunction(
  { id: 'aggregate-metrics', name: 'Aggregate Video Metrics', triggers: [cron('0 0 * * *')] },
  async ({ step, event }: { step: any; event: any }) => {
    const supabaseAdmin = getAdminClient();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    const { data: videos } = await step.run('get-videos', async () => {
      const { data } = await supabaseAdmin
        .from('viewer_sessions')
        .select('video_id, videos(user_id)')
        .gte('start_time', `${dateStr}T00:00:00Z`)
        .lte('start_time', `${dateStr}T23:59:59Z`);
      return [...new Set(data?.map((d: { video_id: string }) => d.video_id))];
    });

    for (const videoId of videos || []) {
      await step.run(`aggregate-${videoId}`, async () => {
        const { data: video } = await supabaseAdmin.from('videos').select('user_id').eq('id', videoId).single();
        if (!video) return;

        const { data: sessions } = await supabaseAdmin
          .from('viewer_sessions')
          .select('*')
          .eq('video_id', videoId)
          .gte('start_time', `${dateStr}T00:00:00Z`)
          .lte('start_time', `${dateStr}T23:59:59Z`);

        if (!sessions?.length) return;

        const views = sessions.length;
        const totalWatchTime = sessions.reduce((sum, s) => sum + (s.watch_duration ?? 0), 0);
        const avgPercentage = sessions.reduce((sum, s) => sum + (s.watch_percentage ?? 0), 0) / views;
        const clicks = sessions.filter((s: { playback_events: unknown }) => {
          const events = s.playback_events as Array<{ type: string }> | undefined;
          return events?.some((e) => e.type === 'click');
        }).length;
        const ctr = views > 0 ? (clicks / views) * 100 : 0;

        await supabaseAdmin.from('video_metrics').upsert({
          video_id: videoId,
          user_id: video.user_id,
          date: dateStr,
          views,
          watch_time_seconds: totalWatchTime,
          average_view_percentage: avgPercentage,
          clicks,
          ctr,
          retention_30s: sessions.filter((s: { watch_duration: number | null }) => (s.watch_duration ?? 0) >= 30).length,
          retention_60s: sessions.filter((s: { watch_duration: number | null }) => (s.watch_duration ?? 0) >= 60).length,
          retention_complete: sessions.filter((s: { watch_percentage: number | null }) => (s.watch_percentage ?? 0) >= 95).length,
        }, { onConflict: 'video_id,date' });
      });
    }
    return { processed: videos?.length || 0 };
  }
);