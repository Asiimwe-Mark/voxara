import { supabaseAdmin } from '@/lib/supabase/admin';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";

export const runtime = 'nodejs';


function getMux() {
  return new Mux({
    tokenId: process.env.MUX_TOKEN_ID ?? '',
    tokenSecret: process.env.MUX_TOKEN_SECRET ?? '',
  });
}

function verifyMuxSignature(request: NextRequest, rawBody: string): boolean {
  const signature = request.headers.get("mux-signature");
  if (!signature) return false;

  // Mux webhook verification requires the signing secret
  const secret = process.env.MUX_WEBHOOK_SECRET ?? process.env.MUX_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    logger.warn("MUX_WEBHOOK_SECRET not set — skipping signature verification in development");
    return process.env.NODE_ENV === "development";
  }

  try {
    const mux = getMux();
    // Use the correct Mux webhook verification method
    mux.webhooks.verifyHeader(rawBody, signature, secret);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!verifyMuxSignature(request, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const { type, data } = body;

  logger.info("Mux webhook received", { type });

  try {
    if (type === "video.asset.ready") {
      const assetId = data.id;
      const playbackId = data.playback_ids?.[0]?.id;

      if (!playbackId) {
        return NextResponse.json({ error: "No playback ID found" }, { status: 400 });
      }

      // Find video by mux_asset_id
      const { data: video, error } = await supabaseAdmin
        .from("videos")
        .select("id")
        .eq("mux_asset_id", assetId)
        .single();

      if (error || !video) {
        logger.error("Video not found for asset:", { detail: assetId });
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }

      // Update video with playback ID and status
      await supabaseAdmin
        .from("videos")
        .update({
          status: "ready",
          mux_playback_id: playbackId,
          video_url: `https://stream.mux.com/${playbackId}.mp4`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", video.id);

      return NextResponse.json({ success: true });
    }

    if (type === "video.asset.errored") {
      const assetId = data.id;
      await supabaseAdmin
        .from("videos")
        .update({ status: "failed" })
        .eq("mux_asset_id", assetId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Mux webhook error:", { detail: error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}