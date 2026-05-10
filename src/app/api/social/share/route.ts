import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CREDITS_CONFIG } from "@/lib/constants";

// Map API-facing platform names → SHARING_BONUS keys
const PLATFORM_TO_BONUS_KEY: Record<
  string,
  keyof typeof CREDITS_CONFIG.SHARING_BONUS
> = {
  twitter:   "X",
  facebook:  "FACEBOOK",
  instagram: "INSTAGRAM",
  tiktok:    "TIKTOK",
  youtube:   "YOUTUBE",
};

const VALID_PLATFORMS = Object.keys(PLATFORM_TO_BONUS_KEY);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { videoId: string; platform: string; shareUrl?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { videoId, platform } = body;

    if (!videoId || !platform) {
      return NextResponse.json(
        { error: "videoId and platform are required" },
        { status: 400 }
      );
    }

    const normalizedPlatform = platform.toLowerCase();

    if (!VALID_PLATFORMS.includes(normalizedPlatform)) {
      return NextResponse.json(
        {
          error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Credits earned for this specific platform
    const bonusKey = PLATFORM_TO_BONUS_KEY[normalizedPlatform];
    const creditsEarned = CREDITS_CONFIG.SHARING_BONUS[bonusKey];

    // Verify user owns the video
    const { data: video, error: videoError } = await supabase
      .from("videos")
      .select("id, user_id, title")
      .eq("id", videoId)
      .eq("user_id", user.id)
      .single();

    if (videoError || !video) {
      return NextResponse.json(
        { error: "Video not found or access denied" },
        { status: 404 }
      );
    }

    // Call the database function to award credits
    const { data: result, error: rpcError } = await supabase.rpc(
      "award_social_share_credits",
      {
        p_user_id:  user.id,
        p_video_id: videoId,
        p_platform: normalizedPlatform,
      }
    );

    if (rpcError) {
      console.error("Social share RPC error:", rpcError);
      return NextResponse.json(
        { error: "Failed to record social share" },
        { status: 500 }
      );
    }

    if (result === true) {
      return NextResponse.json({
        success:      true,
        message:      `Successfully recorded share on ${platform}! You earned ${creditsEarned} credits.`,
        creditsEarned,
      });
    }

    // Share already recorded or monthly cap reached
    const { data: remaining } = await supabase.rpc(
      "get_remaining_social_share_credits",
      { p_user_id: user.id }
    );

    return NextResponse.json({
      success:          false,
      message:
        "You've already shared this video on this platform or reached your monthly limit",
      remainingCredits: remaining ?? 0,
    });
  } catch (err) {
    console.error("Social share error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: remaining, error } = await supabase.rpc(
    "get_remaining_social_share_credits",
    { p_user_id: user.id }
  );

  if (error) {
    console.error("Get remaining credits error:", error);
    return NextResponse.json(
      { error: "Failed to get credit status" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    remainingCredits:   remaining ?? 0,
    maxCreditsPerMonth: CREDITS_CONFIG.MAX_SHARING_CREDITS_PER_MONTH, // was SOCIAL_SHARE_MAX_PER_MONTH
    bonusByPlatform:    CREDITS_CONFIG.SHARING_BONUS,                  // expose full breakdown for UI
  });
}