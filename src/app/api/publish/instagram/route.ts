import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { videoId } = await request.json();
  if (!videoId) return NextResponse.json({ error: "videoId is required" }, { status: 400 });

  const { data: video } = await supabase
    .from("videos")
    .select("id, title, video_url, status")
    .eq("id", videoId)
    .eq("user_id", user.id)
    .single();

  if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
  if (video.status !== "ready") return NextResponse.json({ error: "Video is not ready" }, { status: 400 });
  if (!video.video_url) return NextResponse.json({ error: "No video URL available" }, { status: 400 });

  const { data: account } = await supabase
    .from("social_accounts")
    .select("account_id, access_token")
    .eq("user_id", user.id)
    .eq("platform", "instagram")
    .single();

  if (!account) {
    return NextResponse.json(
      { error: "No Instagram account connected. Please connect your account in Settings." },
      { status: 400 }
    );
  }

  try {
    // Instagram Graph API: create media container
    const containerRes = await fetch(
      `https://graph.facebook.com/v21.0/${account.account_id}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "REELS",
          video_url: video.video_url,
          caption: video.title ?? "",
          access_token: account.access_token,
        }),
      }
    );

    if (!containerRes.ok) {
      const err = await containerRes.json();
      throw new Error(err.error?.message ?? "Instagram API error");
    }

    const { id: creationId } = await containerRes.json();

    // Publish the container
    const publishRes = await fetch(
      `https://graph.facebook.com/v21.0/${account.account_id}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: account.access_token,
        }),
      }
    );

    if (!publishRes.ok) {
      const err = await publishRes.json();
      throw new Error(err.error?.message ?? "Instagram publish error");
    }

    const { id: mediaId } = await publishRes.json();

    await supabase.from("video_publishes").upsert({
      video_id: videoId,
      user_id: user.id,
      platform: "instagram",
      external_id: mediaId,
      status: "published",
      published_at: new Date().toISOString(),
    }, { onConflict: "video_id,platform" });

    return NextResponse.json({ success: true, mediaId });
  } catch (error) {
    console.error("Instagram publish error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish to Instagram" },
      { status: 500 }
    );
  }
}
