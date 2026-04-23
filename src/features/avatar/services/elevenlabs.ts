import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

function getClient() {
  return new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });
}

export async function cloneVoice(
  name: string,
  audioBlob: Blob,
  description?: string
): Promise<{ voiceId: string }> {
  const client = getClient();
  const voice = await client.voices.add({
    name,
    files: [audioBlob],
    description: description ?? "Cloned via voxara",
  });
  return { voiceId: voice.voice_id };
}

export async function generateSpeech(text: string, voiceId: string): Promise<Buffer> {
  const client = getClient();
  const stream = await client.textToSpeech.convert(voiceId, {
    text,
    model_id: "eleven_multilingual_v2",
    output_format: "mp3_44100_128",
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
