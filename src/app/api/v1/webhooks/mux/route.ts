import { supabaseAdmin } from '@/lib/supabase/admin';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Mux from "@mux/mux-node";


function getMux() {
  return new Mux({
    tokenId: process.env.MUX_TOKEN_ID ?? '',
    tokenSecret: process.env.MUX_TOKEN_SECRET ?? '',
  });
}

async function verifyMuxSignature(request: NextRequest, rawBody: string): Promise<boolean> {
  const signature = request.headers.get("mux-signature");
  if (!signature) return false;

  // Mux webhook verification requires the signing secret
  const secret = process.env.MUX_WEBHOOK_SECRET ?? process.env.MUX_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    logger.error("MUX_WEBHOOK_SECRET not set — rejecting webhook");
    return false;
  }

  try {
    // Manual HMAC verification - more reliable across SDK versions
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Mux sends timestamp as part of signature: t=<timestamp>,v1=<signature>
    const parts = signature.split(',');
    const sigPart = parts.find(p => p.startsWith('v1='));
    if (!sigPart) return false;

    const receivedSig = sigPart.slice(3);
    // Timing-safe comparison to prevent side-channel attacks
    if (receivedSig.length !== expectedSignature.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(receivedSig, 'utf8'),
      Buffer.from(expectedSignature, 'utf8'),
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!await verifyMuxSignature(request, rawBody)) {
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