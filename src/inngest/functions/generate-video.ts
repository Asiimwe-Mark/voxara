import { inngest } from "@/inngest/client";
import { createClient } from "@supabase/supabase-js";
import Mux from "@mux/mux-node";
import { generateVoiceover, extractKeywords } from "@/features/video/services/voiceover";
import { fetchStockFootage } from "@/features/video/services/visuals";
import { renderVideo } from "@/features/video/services/renderer";
import { generateHeyGenVideo } from "@/features/avatar/services/heygen";
import { generateDIDVideo } from "@/features/avatar/services/d-id";
import { generateSynthesiaVideo } from "@/features/avatar/services/synthesia";
import { deliverWebhook } from "@/lib/webhooks/deliver";
import type { PlanType } from "@/types/billing";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export const generateVideo = inngest.createFunction(
  {
    id: "generate-video",
    name: "Generate Video",
    retries: 3,
    timeouts: { finish: "10m" },
    onFailure: async ({ event, error }) => {
      const videoId = event.data.event?.data?.videoId;
      const userId = event.data.event?.data?.userId;
      if (videoId) {
        await supabaseAdmin
          .from("videos")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", videoId);

        if (userId) {
          await deliverWebhook("video.failed", { videoId, error: error.message }, userId);
        }
      }
    },
  },
  { event: "video/generate" },
  async ({ event, step }) => {
    const { videoId, userId, script, title } = event.data;

    // 1. Fetch full video record
    const video = await step.run("fetch-video", async () => {
      const { data, error } = await supabaseAdmin
        .from("videos")
        .select("*, user_avatars(*), user_voices(*)")
        .eq("id", videoId)
        .single();
      if (error || !data) throw new Error(`Video ${videoId} not found`);
      return data;
    });

    // 2. Mark as processing
    await step.run("mark-processing", async () => {
      await supabaseAdmin
        .from("videos")
        .update({ status: "processing", updated_at: new Date().toISOString() })
        .eq("id", videoId);
    });

    let finalVideoUrl: string;

    // 3. Avatar vs Faceless pipeline
    if (video.avatar_id && video.user_avatars?.avatar_model_id) {
      const avatarModelId = video.user_avatars.avatar_model_id;
      
      // Check user tier to determine voice provider
      // Free tier uses Edge-TTS (free), paid tiers use ElevenLabs (paid)
      const userTier = await step.run("check-user-tier", async () => {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("plan")
          .eq("id", userId)
          .single();
        return profile?.plan ?? "free";
      });

      // Use Edge-TTS for free tier (no voice cost), ElevenLabs for paid tiers
      const voiceId = userTier === "free" ? undefined : (video.voice_id ?? undefined);

      // Try HeyGen first
      let avatarResult = await step.run("generate-heygen", async () => {
        try {
          return await generateHeyGenVideo(avatarModelId, script, voiceId);
        } catch (err) {
          console.warn("HeyGen failed:", err);
          return null;
        }
      });

      // Fallback to D-ID
      if (!avatarResult?.videoUrl && video.user_avatars?.image_url) {
        avatarResult = await step.run("generate-did", async () => {
          try {
            return await generateDIDVideo(video.user_avatars.image_url, script);
          } catch (err) {
            console.warn("D-ID failed:", err);
            return null;
          }
        });
      }

      // Fallback to Synthesia
      if (!avatarResult?.videoUrl && avatarModelId.startsWith("synth_")) {
        avatarResult = await step.run("generate-synthesia", async () => {
          try {
            return await generateSynthesiaVideo(avatarModelId, script);
          } catch (err) {
            console.warn("Synthesia failed:", err);
            return null;
          }
        });
      }

      if (!avatarResult?.videoUrl) {
        throw new Error("All avatar providers failed to generate video");
      }
      finalVideoUrl = avatarResult.videoUrl;
    } else {
      // Faceless pipeline: voiceover + stock footage + Remotion render
      
      // Check user tier - faceless pipeline already uses Edge-TTS (free for all)
      // This check is here for future enhancement if we want to offer ElevenLabs for paid tiers
      const userTier = await step.run("check-user-tier", async () => {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("plan")
          .eq("id", userId)
          .single();
        return profile?.plan ?? "free";
      });

      // Faceless pipeline uses Edge-TTS which is free for all tiers
      const audioUrl = await step.run("generate-voiceover", async () => {
        return await generateVoiceover(script, userId, videoId);
      });

      const footageUrls = await step.run("fetch-footage", async () => {
        const keywords = extractKeywords(script, 5);
        return await fetchStockFootage(keywords, { count: 5 });
      });

      if (footageUrls.length === 0) {
        throw new Error("No stock footage found for the given script keywords");
      }

      const outputPath = await step.run("render-video", async () => {
        return await renderVideo({ script, audioUrl, footageUrls, videoId, title });
      });

      // The renderer returns a local /renders/<id>.mp4 path; resolve to full URL for Mux
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      finalVideoUrl = outputPath.startsWith("http") ? outputPath : `${appUrl}${outputPath}`;
    }

    // 4. Upload to Mux for adaptive streaming
    const muxAsset = await step.run("upload-to-mux", async () => {
      const upload = await mux.video.uploads.create({
        new_asset_settings: { playback_policy: ["public"], mp4_support: "standard" },
        cors_origin: "*",
      });

      const response = await fetch(finalVideoUrl);
      if (!response.ok) throw new Error(`Failed to fetch video for Mux upload: ${response.status}`);
      const blob = await response.blob();
      const buffer = Buffer.from(await blob.arrayBuffer());

      await fetch(upload.url, {
        method: "PUT",
        body: buffer,
        headers: { "Content-Type": blob.type || "video/mp4" },
      });

      // Poll until Mux asset is ready (max 60s)
      for (let i = 0; i < 30; i++) {
        const asset = await mux.video.assets.retrieve(upload.asset_id!);
        if (asset.status === "ready") {
          return { assetId: asset.id, playbackId: asset.playback_ids?.[0]?.id };
        }
        if (asset.status === "errored") throw new Error("Mux asset processing failed");
        await new Promise((r) => setTimeout(r, 2000));
      }
      throw new Error("Mux asset timed out");
    });

    // 5. Persist final result
    await step.run("update-database", async () => {
      await supabaseAdmin
        .from("videos")
        .update({
          status: "ready",
          mux_asset_id: muxAsset.assetId,
          mux_playback_id: muxAsset.playbackId ?? null,
          video_url: muxAsset.playbackId
            ? `https://stream.mux.com/${muxAsset.playbackId}.mp4`
            : finalVideoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", videoId);
    });

    // 6. Fire webhook if the video record has one
    await step.run("deliver-webhook", async () => {
      if (video.webhook_url) {
        const { deliverAdHocWebhook } = await import("@/lib/webhooks/deliver");
        await deliverAdHocWebhook(video.webhook_url, process.env.INNGEST_SIGNING_KEY ?? "secret", "video.ready", {
          videoId,
          playbackId: muxAsset.playbackId,
          videoUrl: `https://stream.mux.com/${muxAsset.playbackId}.mp4`,
        });
      }
      // Also deliver to registered webhook endpoints
      await deliverWebhook("video.ready", {
        videoId,
        playbackId: muxAsset.playbackId,
      }, userId);
    });

    return { success: true, videoId, playbackId: muxAsset.playbackId };
  }
);
