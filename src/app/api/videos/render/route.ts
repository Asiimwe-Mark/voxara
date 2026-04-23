import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { inngest } from "@/inngest/client";
import { ratelimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success } = await ratelimit.limit(`videos:render:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Too many render requests. Please try again later." }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let videoId: string;
  try {
    const body = await request.json();
    videoId = body.videoId;
    if (!videoId) throw new Error("Missing videoId");
  } catch {
    return NextResponse.json({ error: "videoId is required in the request body" }, { status: 400 });
  }

  const { data: video, error: fetchError } = await supabase
    .from("videos")
    .select("id, user_id, title, script, status, avatar_id, voice_id")
    .eq("id", videoId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !video) {
    return NextResponse.json({ error: "Video not found or access denied" }, { status: 404 });
  }

  if (video.status !== "pending" && video.status !== "failed") {
    return NextResponse.json(
      { error: `Video cannot be rendered in its current status: ${video.status}` },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from("videos")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", videoId);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update video status" }, { status: 500 });
  }

  try {
    await inngest.send({
      name: "video/generate",
      data: {
        videoId: video.id,
        userId: user.id,
        title: video.title,
        script: video.script,
        avatarId: video.avatar_id,
        voiceId: video.voice_id,
      },
    });
  } catch {
    await supabase
      .from("videos")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", videoId);
    return NextResponse.json({ error: "Failed to queue video generation job" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Video rendering started", videoId });
}
