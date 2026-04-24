import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CREDITS_CONFIG } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { videoId: string; platform: string; shareUrl?: string };
  try {
    body = await request.json();
    const { videoId, platform, shareUrl } = body;

    if (!videoId || !platform) {
      return NextResponse.json(
        { error: "videoId and platform are required" },
        { status: 400 }
      );
    }

    const validPlatforms = ["twitter", "facebook", "linkedin", "instagram", "tiktok"];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid platform. Must be one of: twitter, facebook, linkedin, instagram, tiktok" },
        { status: 400 }
      );
    }

    // Verify user owns the video
    const { data: video, error: videoError } = await supabase
      .from("videos")
      .select("id, user_id, title")
      .eq("id", videoId)
      .eq("user_id", user.id)
      .single();

    if (videoError || !video) {
      return NextResponse.json({ error: "Video not found or access denied" }, { status: 404 });
    }

    // Call the database function to award credits
    const { data: result, error: rpcError } = await supabase.rpc("award_social_share_credits", {
      p_user_id: user.id,
      p_video_id: videoId,
      p_platform: platform.toLowerCase(),
    });

    if (rpcError) {
      console.error("Social share RPC error:", rpcError);
      return NextResponse.json({ error: "Failed to record social share" }, { status: 500 });
    }

    if (result === true) {
      return NextResponse.json({
        success: true,
        message: `Successfully recorded share on ${platform}! You earned ${CREDITS_CONFIG.SOCIAL_SHARE_CREDITS} credits.`,
        creditsEarned: CREDITS_CONFIG.SOCIAL_SHARE_CREDITS,
      });
    } else {
      // Check remaining credits
      const { data: remaining } = await supabase.rpc("get_remaining_social_share_credits", {
        p_user_id: user.id,
      });

      return NextResponse.json({
        success: false,
        message: "You've already shared this video on this platform or reached your monthly limit",
        remainingCredits: remaining ?? 0,
      });
    }
  } catch (err) {
    console.error("Social share error:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get remaining social share credits for current month
  const { data: remaining, error } = await supabase.rpc("get_remaining_social_share_credits", {
    p_user_id: user.id,
  });

  if (error) {
    console.error("Get remaining credits error:", error);
    return NextResponse.json({ error: "Failed to get credit status" }, { status: 500 });
  }

  return NextResponse.json({
    remainingCredits: remaining ?? 0,
    maxCreditsPerMonth: CREDITS_CONFIG.SOCIAL_SHARE_MAX_PER_MONTH,
    creditsPerShare: CREDITS_CONFIG.SOCIAL_SHARE_CREDITS,
  });
}