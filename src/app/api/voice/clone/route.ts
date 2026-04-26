import logger from '@/lib/logger';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Voice cloning requires Pro or Agency
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (profile?.plan === "free") {
    return NextResponse.json(
      { error: "Voice cloning requires a Pro or Agency plan" },
      { status: 403 }
    );
  }

  const { name, audioUrl, description } = await request.json();
  if (!name || !audioUrl) {
    return NextResponse.json({ error: "Name and audioUrl are required" }, { status: 400 });
  }

  try {
    // Fetch audio from Supabase storage URL and convert to Blob for ElevenLabs
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) {
      return NextResponse.json({ error: "Failed to fetch audio sample" }, { status: 400 });
    }
    const audioBlob = await audioRes.blob();

    const { cloneVoice } = await import("@/features/avatar/services/elevenlabs");
    const { voiceId } = await cloneVoice(name, audioBlob, description);

    const { data: voice, error: insertError } = await supabase
      .from("user_voices")
      .insert({
        user_id: user.id,
        name,
        sample_audio_url: audioUrl,
        voice_id: voiceId,
        status: "ready",
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return NextResponse.json({ success: true, voice });
  } catch (error) {
    logger.error("Voice clone error:", { detail: error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Voice cloning failed" },
      { status: 500 }
    );
  }
}
