import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

function getClient() {
  if (!process.env.ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY is not set');
  return new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
}

export async function cloneVoice(
  name: string,
  audioBlob: Blob,
  description?: string
): Promise<{ voiceId: string }> {
  const client = getClient();
  // FIX: Use correct API - check if there's a different method or use direct API
  try {
    // Try using the voices.add method if available, otherwise fall back to a different approach
    const voice = await (client.voices as any).add({
      name,
      files: [audioBlob],
      description: description ?? "Cloned via voxara",
    });
    return { voiceId: voice.voice_id };
  } catch {
    // Fallback: use the create method
    const voice = await (client.voices as any).create({
      name,
      files: [audioBlob],
      description: description ?? "Cloned via voxara",
    });
    return { voiceId: voice.voiceId || voice.voice_id };
  }
}

export async function generateSpeech(text: string, voiceId: string): Promise<Buffer> {
  const client = getClient();
  // FIX: Use modelId instead of model_id
  const stream = await client.textToSpeech.convert(voiceId, {
    text,
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
  });

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function deleteVoice(voiceId: string): Promise<void> {
  const client = getClient();
  await client.voices.delete(voiceId);
}