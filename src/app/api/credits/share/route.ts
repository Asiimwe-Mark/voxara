/**
 * POST /api/credits/share
 *
 * Awards bonus credits to free-tier users who share a video on social media.
 * Free users get 1 extra credit per platform per month (capped at 5).
 * This turns free users into organic marketers at zero cost.
 *
 * Body: { platform: 'tiktok' | 'instagram' | 'facebook' | 'x' | 'youtube', videoId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { awardSharingCredits } from "@/lib/credits";
import { CREDITS_CONFIG } from "@/lib/constants";

const VALID_PLATFORMS = Object.keys(CREDITS_CONFIG.SHARING_BONUS) as Array<
  keyof typeof CREDITS_CONFIG.SHARING_BONUS
>;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { platform?: string; videoId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { platform, videoId } = body;

  if (!platform || !VALID_PLATFORMS.includes(platform as keyof typeof CREDITS_CONFIG.SHARING_BONUS)) {
    return NextResponse.json(
      { error: `platform must be one of: ${VALID_PLATFORMS.join(", ")}` },
      { status: 400 }
    );
  }

  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  // Confirm video belongs to this user
  const { data: video } = await supabase
    .from("videos")
    .select("id, status")
    .eq("id", videoId)
    .eq("user_id", user.id)
    .single();

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  if (video.status !== "ready") {
    return NextResponse.json(
      { error: "Video must be ready before sharing credits can be awarded" },
      { status: 400 }
    );
  }

  // Check this exact video hasn't already earned share credits for this platform
  const { data: alreadyClaimed } = await supabase
    .from("credit_transactions")
    .select("id")
    .eq("user_id", user.id)
    .eq("reason", "social_share")
    .contains("metadata", { platform, video_id: videoId })
    .maybeSingle();

  if (alreadyClaimed) {
    return NextResponse.json(
      { error: "Credits already awarded for sharing this video on this platform", credited: 0 },
      { status: 200 }
    );
  }

  const credited = await awardSharingCredits(
    user.id,
    platform as keyof typeof CREDITS_CONFIG.SHARING_BONUS
  );

  // Fetch updated balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    success: true,
    credited,
    newBalance: profile?.credits ?? 0,
    message:
      credited > 0
        ? `+${credited} credit${credited > 1 ? "s" : ""} awarded for sharing on ${platform}!`
        : "Monthly sharing credit cap reached. Keep sharing — cap resets next month.",
  });
}
