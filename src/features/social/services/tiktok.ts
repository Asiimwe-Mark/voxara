import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from "@supabase/supabase-js";


interface TikTokTokens {
  access_token: string;
  refresh_token: string;
  open_id: string;
}

async function getRefreshedTokens(userId: string): Promise<TikTokTokens> {
  const { data: account } = await supabaseAdmin
    .from("social_accounts")
    .select("access_token, refresh_token, account_id, token_expires_at")
    .eq("user_id", userId)
    .eq("platform", "tiktok")
    .single();

  if (!account) throw new Error("TikTok account not connected");

  // Check if token is expired
  if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
    const response = await fetch("https://open-api.tiktok.com/v2/oauth/refresh_token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_key: (process.env.TIKTOK_CLIENT_KEY ?? (() => { throw new Error('TIKTOK_CLIENT_KEY is required for TikTok OAuth'); })()),
        client_secret: (process.env.TIKTOK_CLIENT_SECRET ?? (() => { throw new Error('TIKTOK_CLIENT_SECRET is required for TikTok OAuth'); })()),
        refresh_token: account.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    const data = await response.json();
    if (data.error_code !== "0") throw new Error(`TikTok refresh failed: ${data.error_message}`);

    await supabaseAdmin
      .from("social_accounts")
      .update({
        access_token: data.data.access_token,
        refresh_token: data.data.refresh_token,
        token_expires_at: new Date(Date.now() + data.data.expires_in * 1000).toISOString(),
      })
      .eq("user_id", userId)
      .eq("platform", "tiktok");

    return {
      access_token: data.data.access_token ?? '',
      refresh_token: data.data.refresh_token ?? '',
      open_id: data.data.open_id ?? '',
    };
  }

  return {
    access_token: account.access_token ?? '',
    refresh_token: account.refresh_token ?? '',
    open_id: account.account_id ?? '',
  };
}

export async function getTikTokUserInfo(userId: string) {
  const tokens = await getRefreshedTokens(userId);
  const response = await fetch("https://open-api.tiktok.com/v2/user/info/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: ["open_id", "display_name", "avatar_url"] }),
  });

  const data = await response.json();
  if (data.error_code !== "0") throw new Error(data.error_message);
  return data.data;
}

export async function publishToTikTok(
  userId: string,
  videoUrl: string,
  caption: string
): Promise<{ videoId: string; shareUrl: string }> {
  const tokens = await getRefreshedTokens(userId);

  // Step 1: Initialize upload
  const initRes = await fetch("https://open-api.tiktok.com/v2/video/init/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ source: "PULL_FROM_URL", video_url: videoUrl }),
  });

  const initData = await initRes.json();
  if (initData.error_code !== "0") throw new Error(initData.error_message);

  const uploadId = initData.data.upload_id;

  // Step 2: Publish
  const publishRes = await fetch("https://open-api.tiktok.com/v2/video/publish/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      upload_id: uploadId,
      caption,
      privacy_level: "PUBLIC",
      disable_comment: false,
      disable_duet: false,
      disable_stitch: false,
    }),
  });

  const publishData = await publishRes.json();
  if (publishData.error_code !== "0") throw new Error(publishData.error_message);

  return {
    videoId: publishData.data.video_id,
    shareUrl: publishData.data.share_url,
  };
}