/**
 * Synthesia Avatar Service
 * Generates AI presenter videos from a script + avatar ID.
 * Docs: https://docs.synthesia.io/
 */

function getSynthesiaKey(): string {
  const key = process.env.SYNTHESIA_API_KEY;
  if (!key) throw new Error('SYNTHESIA_API_KEY is not set');
  return key;
}

export interface SynthesiaVideoResult {
  videoUrl: string | null;
  taskId: string;
}

export async function generateSynthesiaVideo(
  avatarId: string,
  script: string,
): Promise<SynthesiaVideoResult> {
  const response = await fetch('https://api.synthesia.io/v2/videos', {
    method: 'POST',
    headers: {
      Authorization: getSynthesiaKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      test: false,
      input: [{ scriptText: script, avatar: avatarId }],
      visibility: 'private',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Synthesia API error: ${response.status} — ${error}`);
  }

  const data = await response.json();
  return { videoUrl: data.download ?? null, taskId: data.id };
}

export async function checkSynthesiaVideoStatus(videoId: string): Promise<{
  status: string;
  videoUrl: string | null;
}> {
  const response = await fetch(`https://api.synthesia.io/v2/videos/${videoId}`, {
    headers: { Authorization: getSynthesiaKey() },
  });

  if (!response.ok) throw new Error(`Synthesia status check failed: ${response.status}`);

  const data = await response.json();
  return {
    status: data.status,           // 'in_progress', 'complete', 'failed'
    videoUrl: data.download ?? null,
  };
}
