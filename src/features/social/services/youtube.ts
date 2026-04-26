import { supabaseAdmin } from '@/lib/supabase/admin';
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";


interface YouTubeTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number | null;
}

async function getRefreshedTokens(userId: string): Promise<YouTubeTokens> {
  const { data: account } = await supabaseAdmin
    .from("social_accounts")
    .select("access_token, refresh_token, token_expires_at")
    .eq("user_id", userId)
    .eq("platform", "youtube")
    .single();

  if (!account) throw new Error("YouTube account not connected");

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

  // Refresh if expired
  if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await supabaseAdmin
      .from("social_accounts")
      .update({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || account.refresh_token,
        token_expires_at: credentials.expiry_date
          ? new Date(credentials.expiry_date).toISOString()
          : null,
      })
      .eq("user_id", userId)
      .eq("platform", "youtube");
    return {
      access_token: credentials.access_token!,
      refresh_token: credentials.refresh_token || account.refresh_token,
      expiry_date: credentials.expiry_date,
    };
  }

  return {
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.token_expires_at ? new Date(account.token_expires_at).getTime() : null,
  };
}

export async function getYouTubeChannel(userId: string) {
  const tokens = await getRefreshedTokens(userId);
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: tokens.access_token });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });
  const response = await youtube.channels.list({ part: ["snippet"], mine: true });
  const channel = response.data.items?.[0];
  return {
    channelId: channel?.id,
    channelTitle: channel?.snippet?.title,
    thumbnail: channel?.snippet?.thumbnails?.default?.url,
  };
}

export async function publishToYouTube(
  userId: string,
  videoUrl: string,
  title: string,
  description: string,
  tags: string[] = ["faceless", "ai generated"],
  privacyStatus: "private" | "public" | "unlisted" = "private"
): Promise<{ videoId: string }> {
  const tokens = await getRefreshedTokens(userId);
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: tokens.access_token });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  // Fetch video file
  const response = await fetch(videoUrl);
  if (!response.ok) throw new Error(`Failed to fetch video: ${response.status}`);
  const videoBuffer = Buffer.from(await response.arrayBuffer());

  const uploadResponse = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: { title, description, tags, categoryId: "22" },
      status: { privacyStatus, selfDeclaredMadeForKids: false },
    },
    media: { body: videoBuffer },
  });

  return { videoId: uploadResponse.data.id! };
}