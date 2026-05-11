import { getAdminClient } from '@/lib/supabase/admin';
import logger from '@/lib/logger';
import { inngest } from "@/inngest/client";
import Mux from "@mux/mux-node";
import { generateVoiceover, extractKeywords } from "@/features/video/services/voiceover";
import { fetchStockFootage } from "@/features/video/services/visuals";
import { renderVideo } from "@/features/video/services/renderer";
import { generateHeyGenVideo } from "@/features/avatar/services/heygen";
import { generateDIDVideo } from "@/features/avatar/services/d-id";
import { generateSynthesiaVideo } from "@/features/avatar/services/synthesia";
import { deliverWebhook } from "@/lib/webhooks/deliver";
import { resolveVoiceProvider, shouldUseMux, buildHeyGenVoiceConfig } from "@/lib/voice-router";
import type { PlanType } from "@/lib/voice-router";


function getMuxClient() {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error('MUX_TOKEN_ID and MUX_TOKEN_SECRET are required for Mux uploads');
  }
  return new Mux({ tokenId: process.env.MUX_TOKEN_ID, tokenSecret: process.env.MUX_TOKEN_SECRET });
}

export const generateVideo = inngest.createFunction(
  {
    id: "generate-video",
    name: "Generate Video",
    retries: 3,
    timeouts: { finish: "10m" },
    triggers: { event: "video/generate" },
    onFailure: async ({ event, error }: { event: any; error: Error }) => {
      const supabaseAdmin = getAdminClient();
      const videoId = event.data.event?.data?.videoId;
      const userId = event.data.event?.data?.userId;
      if (videoId) {
        await supabaseAdmin.from("videos")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", videoId);
        if (userId) {
          await deliverWebhook("video.failed", { videoId, error: error.message }, userId);
        }
      }
    },
  },
  async ({ event, step }: { event: any; step: any }) => {
    const supabaseAdmin = getAdminClient();
    const { videoId, userId, script, title } = event.data;
    const eventWatermark: boolean = event.data.watermark ?? false;
    const eventUserPlan: PlanType = (event.data.userPlan as PlanType) ?? "free";

    const video = await step.run("fetch-video", async () => {
      const { data, error } = await supabaseAdmin.from("videos")
        .select("*, user_avatars(*), user_voices(*)")
        .eq("id", videoId)
        .single();
      if (error || !data) throw new Error(`Video ${videoId} not found`);
      return data;
    });

    const userPlan = await step.run("fetch-user-plan", async () => {
      if (eventUserPlan && eventUserPlan !== "free") return eventUserPlan;
      const { data } = await supabaseAdmin.from("profiles")
        .select("plan")
        .eq("id", userId)
        .single();
      return (data?.plan ?? "free") as PlanType;
    });

    await step.run("mark-processing", async () => {
      // FIX: Use proper update call
      await supabaseAdmin.from("videos").update({ status: "processing", updated_at: new Date().toISOString() })
        .eq("id", videoId);
    });

    let finalVideoUrl: string;

    if (video.avatar_id && video.user_avatars?.avatar_model_id) {
      const avatarModelId = video.user_avatars.avatar_model_id;
      const heygenVoiceConfig = buildHeyGenVoiceConfig(userPlan, video.voice_id ?? null);

      let avatarResult = await step.run("generate-heygen", async () => {
        try { return await generateHeyGenVideo(avatarModelId, script, heygenVoiceConfig); }
        catch (err) { logger.warn("HeyGen failed", { error: err instanceof Error ? err.message : String(err) }); return null; }
      });

      if (!avatarResult?.videoUrl && video.user_avatars?.image_url) {
        avatarResult = await step.run("generate-did", async () => {
          try { return await generateDIDVideo(video.user_avatars.image_url, script); }
          catch (err) { logger.warn("D-ID failed", { error: err instanceof Error ? err.message : String(err) }); return null; }
        });
      }

      if (!avatarResult?.videoUrl && avatarModelId.startsWith("synth_")) {
        avatarResult = await step.run("generate-synthesia", async () => {
          try { return await generateSynthesiaVideo(avatarModelId, script); }
          catch (err) { logger.warn("Synthesia failed", { error: err instanceof Error ? err.message : String(err) }); return null; }
        });
      }

      if (!avatarResult?.videoUrl) throw new Error("All avatar providers failed");
      finalVideoUrl = avatarResult.videoUrl;

    } else {
      const audioUrl = await step.run("generate-voiceover", async () => {
        const voiceDecision = resolveVoiceProvider(userPlan, video.voice_id, "en");
        return await generateVoiceover(script, userId, videoId, { voice: voiceDecision.voiceId });
      });

      const footageUrls = await step.run("fetch-footage", async () => {
        const keywords = extractKeywords(script, 5);
        return await fetchStockFootage(keywords, { count: 5 });
      });

      if (footageUrls.length === 0) throw new Error("No stock footage found");

      const outputPath = await step.run("render-video", async () => {
        return await renderVideo({
          script,
          audioUrl,
          footageUrls,
          videoId,
          title,
          watermark: eventWatermark || userPlan === "free",
        });
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      finalVideoUrl = outputPath.startsWith("http") ? outputPath : `${appUrl}${outputPath}`;
    }

    const useMux = shouldUseMux(userPlan);

    if (useMux) {
      const muxAsset = await step.run("upload-to-mux", async () => {
        const mux = getMuxClient();
        const upload = await mux.video.uploads.create({
          new_asset_settings: { playback_policy: ["public"], mp4_support: "standard" },
          cors_origin: "*",
        });
        // FIX: Handle undefined finalVideoUrl
        if (!finalVideoUrl) throw new Error('No video URL to upload');
        if (!upload.url) throw new Error('Mux upload URL is missing');
        const response = await fetch(finalVideoUrl);
        if (!response.ok) throw new Error(`Failed to fetch video for Mux: ${response.status}`);
        const blob = await response.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        await fetch(upload.url, { method: "PUT", body: buffer, headers: { "Content-Type": blob.type || "video/mp4" } });
        for (let i = 0; i < 30; i++) {
          const asset = await mux.video.assets.retrieve(upload.asset_id!);
          if (asset.status === "ready") return { assetId: asset.id, playbackId: asset.playback_ids?.[0]?.id };
          if (asset.status === "errored") throw new Error("Mux asset failed");
          await new Promise((r) => setTimeout(r, 2000));
        }
        throw new Error("Mux asset timed out");
      });

      await step.run("update-database", async () => {
        await supabaseAdmin.from("videos").update({
          status: "ready",
          mux_asset_id: muxAsset.assetId,
          mux_playback_id: muxAsset.playbackId ?? null,
          video_url: muxAsset.playbackId ? `https://stream.mux.com/${muxAsset.playbackId}.mp4` : finalVideoUrl,
          updated_at: new Date().toISOString(),
        }).eq("id", videoId);
      });

      await step.run("deliver-webhook", async () => {
        if (video.webhook_url) {
          const { deliverAdHocWebhook } = await import("@/lib/webhooks/deliver");
          await deliverAdHocWebhook(video.webhook_url, process.env.INNGEST_SIGNING_KEY ?? "secret", "video.ready", {
            videoId, playbackId: muxAsset.playbackId, videoUrl: `https://stream.mux.com/${muxAsset.playbackId}.mp4`,
          });
        }
        await deliverWebhook("video.ready", { videoId, playbackId: muxAsset.playbackId }, userId);
      });

      return { success: true, videoId, playbackId: muxAsset.playbackId };

    } else {
      await step.run("update-database", async () => {
        await supabaseAdmin.from("videos").update({
          status: "ready",
          mux_asset_id: null,
          mux_playback_id: null,
          video_url: finalVideoUrl,
          updated_at: new Date().toISOString(),
        }).eq("id", videoId);
      });

      await step.run("deliver-webhook", async () => {
        await deliverWebhook("video.ready", { videoId, videoUrl: finalVideoUrl }, userId);
      });

      return { success: true, videoId, videoUrl: finalVideoUrl };
    }
  }
);