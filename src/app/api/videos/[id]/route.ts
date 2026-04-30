import { supabaseAdmin } from '@/lib/supabase/admin';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";


type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: video, error } = await supabase
    .from("videos")
    .select(`id, title, script, audio_url, video_url, status, mux_playback_id, timeline, duration_frames, footage_urls, created_at`)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: "Video not found or access denied" }, { status: 404 });
  return NextResponse.json(video);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, script } = body;

  const { data, error } = await supabase
    .from("videos")
    .update({ title, script, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership before deleting
  const { data: video } = await supabase
    .from("videos")
    .select("id, mux_asset_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!video) return NextResponse.json({ error: "Video not found or access denied" }, { status: 404 });

  // Delete Mux asset if it exists
  if (video.mux_asset_id) {
    try {
      const Mux = (await import("@mux/mux-node")).default;
      const mux = new Mux({
        tokenId: (process.env.MUX_TOKEN_ID ?? (() => { throw new Error('MUX_TOKEN_ID is required for Mux video'); })()),
        tokenSecret: (process.env.MUX_TOKEN_SECRET ?? (() => { throw new Error('MUX_TOKEN_SECRET is required for Mux video'); })()),
      });
      await mux.video.assets.delete(video.mux_asset_id);
    } catch (err) {
      logger.error("Failed to delete Mux asset:", { detail: err });
      // Continue with DB deletion even if Mux fails
    }
  }

  // Delete storage files
  await supabaseAdmin.storage
    .from("videos")
    .remove([`${user.id}/${id}/voiceover.mp3`])
    .catch(() => {});

  // Delete DB record (cascades to related records via FK)
  const { error } = await supabase
    .from("videos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
