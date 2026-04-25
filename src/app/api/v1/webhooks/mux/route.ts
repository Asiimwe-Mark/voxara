import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import  Webhook  from "@mux/mux-node";

// ✅ Supabase admin (server-only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Verify Mux webhook signature
function verifyMuxSignature(request: NextRequest, rawBody: string): boolean {
  const signature = request.headers.get("mux-signature");
  if (!signature) return false;

  const secret =
    process.env.MUX_WEBHOOK_SECRET ||
    process.env.MUX_WEBHOOK_SIGNING_SECRET;

  if (!secret) {
    console.warn(
      "MUX_WEBHOOK_SECRET not set — skipping verification in development"
    );
    return process.env.NODE_ENV === "development";
  }

  try {
    // ⚠️ Some versions have typing issues → cast fallback
    (Webhook as any).verifyHeader(rawBody, signature, secret);
    return true;
  } catch (err) {
    console.error("Mux signature verification failed:", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // ✅ Verify webhook signature
  if (!verifyMuxSignature(request, rawBody)) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { type, data } = body;

  console.log("🎬 Mux webhook received:", type);

  try {
    // =========================
    // 🎥 VIDEO READY
    // =========================
    if (type === "video.asset.ready") {
      const assetId = data?.id;
      const playbackId = data?.playback_ids?.[0]?.id;

      if (!assetId || !playbackId) {
        return NextResponse.json(
          { error: "Missing assetId or playbackId" },
          { status: 400 }
        );
      }

      // Find video by mux_asset_id
      const { data: video, error: findError } = await supabaseAdmin
        .from("videos")
        .select("id")
        .eq("mux_asset_id", assetId)
        .single();

      if (findError || !video) {
        console.error("❌ Video not found for asset:", assetId);
        return NextResponse.json(
          { error: "Video not found" },
          { status: 404 }
        );
      }

      // Update video record
      const { error: updateError } = await supabaseAdmin
        .from("videos")
        .update({
          status: "ready",
          mux_playback_id: playbackId,
          video_url: `https://stream.mux.com/${playbackId}.mp4`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", video.id);

      if (updateError) {
        console.error("❌ Failed to update video:", updateError);
        return NextResponse.json(
          { error: "Failed to update video" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // =========================
    // ❌ VIDEO FAILED
    // =========================
    if (type === "video.asset.errored") {
      const assetId = data?.id;

      if (!assetId) {
        return NextResponse.json(
          { error: "Missing assetId" },
          { status: 400 }
        );
      }

      await supabaseAdmin
        .from("videos")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("mux_asset_id", assetId);

      return NextResponse.json({ success: true });
    }

    // =========================
    // 🔄 DEFAULT HANDLER
    // =========================
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Mux webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}