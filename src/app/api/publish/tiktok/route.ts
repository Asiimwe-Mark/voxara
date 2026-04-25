import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("SUPABASE_URL or SUPABASE_ANON_KEY is not set");
      return NextResponse.json(
        { error: "Supabase integration is not configured" },
        { status: 500 }
      );
    }
  
    const supabase = await createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { videoId } = await request.json();
  if (!videoId) return NextResponse.json({ error: "videoId is required" }, { status: 400 });

  // Fetch video and verify ownership
  const { data: video } = await supabase
    .from("videos")
    .select("id, title, video_url, status")
    .eq("id", videoId)
    .eq("user_id", user.id)
    .single();

  if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
  if (video.status !== "ready") return NextResponse.json({ error: "Video is not ready" }, { status: 400 });

  // Fetch connected TikTok account
  const { data: account } = await supabase
    .from("social_accounts")
    .select("access_token, account_name")
    .eq("user_id", user.id)
    .eq("platform", "tiktok")
    .single();

  if (!account) {
    return NextResponse.json(
      { error: "No TikTok account connected. Please connect your account in Settings." },
      { status: 400 }
    );
  }

  try {
    // TikTok Content Posting API v2
    // Step 1: Initialize upload
    const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${account.access_token}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: video.title?.slice(0, 150) ?? "My Video",
          privacy_level: "SELF_ONLY", // safe default; user can change in TikTok
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: video.video_url,
        },
      }),
    });

    if (!initRes.ok) {
      const err = await initRes.json();
      throw new Error(err.error?.message ?? "TikTok API error");
    }

    const initData = await initRes.json();
    const publishId = initData.data?.publish_id;

    // Record the publish attempt in DB
    await supabase.from("video_publishes").upsert({
      video_id: videoId,
      user_id: user.id,
      platform: "tiktok",
      external_id: publishId ?? null,
      status: "published",
      published_at: new Date().toISOString(),
    }, { onConflict: "video_id,platform" });

    return NextResponse.json({ success: true, publishId });
  } catch (error) {
    console.error("TikTok publish error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish to TikTok" },
      { status: 500 }
    );
  }
}
