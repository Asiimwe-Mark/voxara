import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from "@supabase/supabase-js";


interface InstagramTokens {
  access_token: string;
  instagram_account_id: string;
}

async function getRefreshedTokens(userId: string): Promise<InstagramTokens> {
  const { data: account } = await supabaseAdmin
    .from("social_accounts")
    .select("access_token, account_id")
    .eq("user_id", userId)
    .eq("platform", "instagram")
    .single();

  if (!account) throw new Error("Instagram account not connected");

  // Instagram Basic Display tokens are short-lived. For Graph API,
  // you need a Facebook Page connected. This assumes Basic Display.
  // For production, use long-lived tokens and refresh via Facebook Graph API.

  return {
    access_token: account.access_token ?? '',
    instagram_account_id: account.account_id ?? '',
  };
}

export async function getInstagramUserInfo(userId: string) {
  const tokens = await getRefreshedTokens(userId);
  const response = await fetch(
    `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${tokens.access_token}`
  );
  return response.json();
}

export async function publishToInstagram(
  userId: string,
  videoUrl: string,
  caption: string
): Promise<{ mediaId: string }> {
  const tokens = await getRefreshedTokens(userId);

  // Step 1: Create media container
  const createRes = await fetch(
    `https://graph.instagram.com/${tokens.instagram_account_id}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "REELS",
        video_url: videoUrl,
        caption,
        share_to_feed: true,
        access_token: tokens.access_token,
      }),
    }
  );

  const createData = await createRes.json();
  if (!createData.id) throw new Error(createData.error?.message || "Failed to create media");

  const mediaId = createData.id;

  // Step 2: Poll for status and publish
  let attempts = 0;
  while (attempts < 30) {
    const statusRes = await fetch(
      `https://graph.instagram.com/${mediaId}?fields=status,permalink&access_token=${tokens.access_token}`
    );
    const statusData = await statusRes.json();

    if (statusData.status === "FINISHED") {
      return { mediaId };
    }
    if (statusData.status === "ERROR") {
      throw new Error("Media processing failed");
    }
    await new Promise((r) => setTimeout(r, 5000));
    attempts++;
  }
  throw new Error("Media processing timeout");
}