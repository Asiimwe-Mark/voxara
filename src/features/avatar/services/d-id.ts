/**
 * D-ID Talking Avatar Service
 * Generates a talking-head video from a source image + script.
 * Docs: https://docs.d-id.com/
 */

function getDIDKey(): string {
  const key = process.env.DID_API_KEY;
  if (!key) throw new Error('DID_API_KEY is not set');
  return key;
}

export interface DIDVideoResult {
  videoUrl: string | null;
  taskId: string;
}

export async function generateDIDVideo(
  imageUrl: string,
  script: string,
): Promise<DIDVideoResult> {
  const response = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${getDIDKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      script: { type: 'text', input: script },
      source_url: imageUrl,
      config: { fluent: true },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`D-ID API error: ${response.status} — ${error}`);
  }

  const data = await response.json();
  return { videoUrl: data.result_url ?? null, taskId: data.id };
}

export async function checkDIDVideoStatus(talkId: string): Promise<{
  status: string;
  videoUrl: string | null;
}> {
  const response = await fetch(`https://api.d-id.com/talks/${talkId}`, {
    headers: { Authorization: `Basic ${getDIDKey()}` },
  });

  if (!response.ok) throw new Error(`D-ID status check failed: ${response.status}`);

  const data = await response.json();
  return {
    status: data.status,           // 'created', 'started', 'done', 'error'
    videoUrl: data.result_url ?? null,
  };
}
