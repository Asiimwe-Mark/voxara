import { EdgeTTS } from "@travisvn/edge-tts";
import { createClient } from "@supabase/supabase-js";

// Use the service-role admin client: this service is called from Inngest background
// jobs where there is no HTTP request / cookie context for the SSR client.
function getStorageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface VoiceoverOptions {
  voice?: string;
  rate?: string;
  pitch?: string;
}

const DEFAULT_VOICE = "en-US-AriaNeural";

export async function generateVoiceover(
  script: string,
  userId: string,
  videoId: string,
  options: VoiceoverOptions = {}
): Promise<string> {
  const supabase = getStorageClient();
  const { voice = DEFAULT_VOICE, rate = "+0%", pitch = "+0Hz" } = options;

  const tts = new EdgeTTS(script, voice, rate, pitch);
  const result = await tts.synthesize();
  const audioBuffer = Buffer.from(await result.audio.arrayBuffer());

  const storagePath = `${userId}/${videoId}/voiceover.mp3`;
  const { error } = await supabase.storage.from("videos").upload(storagePath, audioBuffer, {
    contentType: "audio/mpeg",
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    throw new Error(`Failed to upload voiceover: ${error.message}`);
  }

  const { data } = supabase.storage.from("videos").getPublicUrl(storagePath);
  return data.publicUrl;
}

export function extractKeywords(script: string, limit: number = 5): string {
  const words = script.toLowerCase().split(/\s+/);
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "from", "as", "into", "like", "through",
  ]);
  return words
    .filter((w) => w.length > 3 && !stopWords.has(w))
    .slice(0, limit)
    .join(" ") || "nature";
}