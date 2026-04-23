export async function generateDIDVideo(imageUrl: string, script: string) {
  const response = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${process.env.DID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      script: { type: 'text', input: script },
      source_url: imageUrl,
      config: { fluent: true },
    }),
  });

  const data = await response.json();
  return { videoUrl: data.result_url, taskId: data.id };
}