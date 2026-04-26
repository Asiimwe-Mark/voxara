import { supabaseAdmin } from '@/lib/supabase/admin';
import { inngest } from '@/inngest/client';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';


async function publishToYouTubeFull(
  account: { access_token: string; refresh_token: string; token_expires_at: string | null },
  userId: string,
  videoBuffer: Buffer,
  title: string,
  caption: string
): Promise<{ success: boolean; videoId?: string; error?: string }> {
  const oauth2Client = new google.auth.OAuth2(
    (process.env.YOUTUBE_CLIENT_ID ?? (() => { throw new Error('YOUTUBE_CLIENT_ID is required for YouTube OAuth'); })()),
    (process.env.YOUTUBE_CLIENT_SECRET ?? (() => { throw new Error('YOUTUBE_CLIENT_SECRET is required for YouTube OAuth'); })()),
    `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/youtube/callback`
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.token_expires_at
      ? new Date(account.token_expires_at).getTime()
      : undefined,
  });

  // Proactively refresh token if within 5 minutes of expiry
  if (
    account.token_expires_at &&
    new Date(account.token_expires_at).getTime() - Date.now() < 5 * 60 * 1000
  ) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await supabaseAdmin
      .from('social_accounts')
      .update({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token ?? account.refresh_token,
        token_expires_at: credentials.expiry_date
          ? new Date(credentials.expiry_date).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('platform', 'youtube');
    oauth2Client.setCredentials(credentials);
  }

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const { Readable } = await import('stream');
  const videoStream = Readable.from(videoBuffer);

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: title.slice(0, 100),
        description: caption || title,
        tags: ['faceless', 'ai generated', 'voxara'],
        categoryId: '22',
      },
      status: { privacyStatus: 'private', selfDeclaredMadeForKids: false },
    },
    media: { body: videoStream },
  });

  return { success: true, videoId: response.data.id! };
}

export const publishScheduled = inngest.createFunction(
  { id: 'publish-scheduled', name: 'Publish Scheduled Video', retries: 3 },
  { event: 'social/publish-scheduled' },
  async ({ event, step }) => {
    const { scheduleId } = event.data;

    const schedule = await step.run('get-schedule', async () => {
      const { data } = await supabaseAdmin
        .from('publishing_schedules')
        .select('*, videos(*)')
        .eq('id', scheduleId)
        .single();
      return data;
    });

    if (!schedule || schedule.status !== 'pending') {
      return { skipped: true, reason: 'Schedule not found or not pending' };
    }

    // Bail if scheduled time hasn't arrived yet (Inngest may fire slightly early)
    if (schedule.scheduled_at && new Date(schedule.scheduled_at) > new Date()) {
      return { skipped: true, reason: 'Too early to publish' };
    }

    // Mark as processing
    await step.run('mark-processing', () =>
      supabaseAdmin
        .from('publishing_schedules')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', scheduleId)
    );

    const video = schedule.videos as any;
    if (!video?.video_url) {
      await supabaseAdmin
        .from('publishing_schedules')
        .update({ status: 'failed', error: 'Video URL not available' })
        .eq('id', scheduleId);
      throw new Error('Video URL not available');
    }

    // Fetch video buffer
    const videoBuffer = await step.run('fetch-video', async () => {
      const res = await fetch(video.video_url);
      if (!res.ok) throw new Error(`Failed to fetch video: ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    });

    let publishResult: { success: boolean; videoId?: string; error?: string } = {
      success: false,
    };

    if (schedule.platform === 'youtube') {
      const account = await step.run('get-youtube-account', async () => {
        const { data } = await supabaseAdmin
          .from('social_accounts')
          .select('access_token, refresh_token, token_expires_at')
          .eq('user_id', schedule.user_id)
          .eq('platform', 'youtube')
          .single();
        if (!data) throw new Error('YouTube account not connected');
        return data;
      });

      publishResult = await step.run('publish-youtube', () =>
        publishToYouTubeFull(account, schedule.user_id, videoBuffer, schedule.title ?? video.title, schedule.caption ?? '')
      );

      if (publishResult.success && publishResult.videoId) {
        await supabaseAdmin
          .from('videos')
          .update({ youtube_id: publishResult.videoId, updated_at: new Date().toISOString() })
          .eq('id', video.id);
      }
    } else {
      // Other platforms can be added here (TikTok, Instagram, LinkedIn)
      publishResult = { success: false, error: `Platform ${schedule.platform} not yet supported in scheduled publishing` };
    }

    // Update schedule status
    await step.run('update-status', () =>
      supabaseAdmin
        .from('publishing_schedules')
        .update({
          status: publishResult.success ? 'published' : 'failed',
          error: publishResult.error ?? null,
          published_at: publishResult.success ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', scheduleId)
    );

    if (!publishResult.success) {
      throw new Error(publishResult.error ?? 'Publish failed');
    }

    return { success: true, platform: schedule.platform, videoId: publishResult.videoId };
  }
);
