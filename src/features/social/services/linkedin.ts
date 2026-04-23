import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface LinkedInTokens {
  access_token: string;
  person_urn: string;
}

async function getRefreshedTokens(userId: string): Promise<LinkedInTokens> {
  const { data: account } = await supabaseAdmin
    .from("social_accounts")
    .select("access_token, refresh_token, account_id, token_expires_at")
    .eq("user_id", userId)
    .eq("platform", "linkedin")
    .single();

  if (!account) throw new Error("LinkedIn account not connected");

  // Refresh if expired
  if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: account.refresh_token,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });

    const data = await response.json();
    if (!data.access_token) throw new Error("LinkedIn refresh failed");

    await supabaseAdmin
      .from("social_accounts")
      .update({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      })
      .eq("user_id", userId)
      .eq("platform", "linkedin");

    return { access_token: data.access_token, person_urn: account.account_id };
  }

  return { access_token: account.access_token, person_urn: account.account_id };
}

export async function getLinkedInUserInfo(userId: string) {
  const tokens = await getRefreshedTokens(userId);
  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  return response.json();
}

export async function publishToLinkedIn(
  userId: string,
  videoUrl: string,
  caption: string
): Promise<{ shareId: string }> {
  const tokens = await getRefreshedTokens(userId);

  // Step 1: Register video upload
  const registerRes = await fetch("https://api.linkedin.com/rest/videos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202503",
    },
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: tokens.person_urn,
        fileSizeBytes: 0,
        uploadCaptions: false,
        uploadThumbnail: false,
      },
    }),
  });

  const registerData = await registerRes.json();
  const uploadUrn = registerData.value?.uploadUrn;
  if (!uploadUrn) throw new Error("Failed to register video");

  // Step 2: Upload video
  const videoResponse = await fetch(videoUrl);
  const videoBlob = await videoResponse.blob();

  await fetch(uploadUrn, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "Content-Type": videoBlob.type,
    },
    body: videoBlob,
  });

  // Step 3: Create post
  const shareRes = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202503",
    },
    body: JSON.stringify({
      author: tokens.person_urn,
      commentary: caption,
      visibility: "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED" },
      content: { media: { id: uploadUrn } },
    }),
  });

  const shareData = await shareRes.json();
  if (!shareData.id) throw new Error(shareData.message || "Failed to create post");

  return { shareId: shareData.id };
}