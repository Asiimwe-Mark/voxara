import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendAvatarReadyEmail } from '@/lib/email/avatar-notification';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifySignature(request: NextRequest): boolean {
  const signature = request.headers.get("x-heygen-signature");
  const secret = process.env.HEYGEN_WEBHOOK_SECRET;

  // In development, allow missing secret
  if (process.env.NODE_ENV === "development" && !secret) return true;
  if (!signature || !secret) return false;

  // Simple string comparison (HeyGen uses a shared secret)
  return signature === secret;
}

export async function POST(request: NextRequest) {
  if (!verifySignature(request)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = await request.json();
  const { event_type, data } = body;

  console.log("HeyGen webhook received:", event_type);

  try {
    if (event_type === "avatar.training.completed" || event_type === "avatar.created") {
      const { task_id, avatar_id } = data;

      // Find the avatar by task_id
      const { data: avatar, error: findError } = await supabaseAdmin
        .from("user_avatars")
        .select("id, user_id, name")
        .eq("heygen_task_id", task_id)
        .single();

      if (findError || !avatar) {
        console.error("Avatar not found for task:", task_id);
        return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
      }

      // Update status to ready
      await supabaseAdmin
        .from("user_avatars")
        .update({
          status: "ready",
          avatar_model_id: avatar_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", avatar.id);

      // Send email notification
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(avatar.user_id);
      if (userData?.user?.email) {
        await sendAvatarReadyEmail(
          userData.user.email,
          userData.user.user_metadata?.full_name || "Creator",
          avatar.name
        );
      }

      return NextResponse.json({ success: true });
    }

    if (event_type === "avatar.training.failed") {
      const { task_id } = data;

      await supabaseAdmin
        .from("user_avatars")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("heygen_task_id", task_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("HeyGen webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}