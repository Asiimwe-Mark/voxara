import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHeyGenAvatar } from "@/features/avatar/services/heygen";
import { inngest } from "@/inngest/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { avatarId } = body;

  if (!avatarId) {
    return NextResponse.json({ error: "Avatar ID is required" }, { status: 400 });
  }

  // Fetch the failed avatar and verify ownership
  const { data: avatar, error: fetchError } = await supabase
    .from("user_avatars")
    .select("id, name, image_url, status, user_id")
    .eq("id", avatarId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !avatar) {
    return NextResponse.json(
      { error: "Avatar not found or access denied" },
      { status: 404 }
    );
  }

  // Only allow regeneration of failed avatars
  if (avatar.status !== "failed") {
    return NextResponse.json(
      { error: `Avatar is not in failed state (current: ${avatar.status})` },
      { status: 400 }
    );
  }

  // Check if user has required plan (Agency for custom avatars)
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (profile?.plan !== "agency") {
    return NextResponse.json(
      { error: "Agency plan required for custom avatars" },
      { status: 403 }
    );
  }

  try {
    // Update status to processing before starting regeneration
    await supabase
      .from("user_avatars")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", avatarId);

    // Extract gender from metadata or default to neutral
    const gender = (avatar as any).gender || "neutral";

    // Trigger new avatar creation with HeyGen
    const { avatarId: newAvatarId, taskId } = await createHeyGenAvatar({
      name: `${avatar.name} (Retry)`,
      imageUrl: avatar.image_url,
      gender,
    });

    // Update the avatar record with the new task ID and model ID
    await supabase
      .from("user_avatars")
      .update({
        avatar_model_id: newAvatarId,
        heygen_task_id: taskId,
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", avatarId);

    // Schedule polling for the new task
    await inngest.send({
      name: "avatar/poll-status",
      data: { avatarId, retryCount: 0 },
      ts: Date.now() + 2 * 60 * 1000, // Start after 2 minutes
    });

    return NextResponse.json({
      success: true,
      avatarId,
      taskId,
      message: "Avatar regeneration started",
    });
  } catch (error) {
    console.error("Avatar regeneration error:", error);

    // Revert status to failed if regeneration fails to start
    await supabase
      .from("user_avatars")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", avatarId);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Regeneration failed" },
      { status: 500 }
    );
  }
}