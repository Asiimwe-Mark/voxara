export async function generateSynthesiaVideo(avatarId: string, script: string) {
  const response = await fetch('https://api.synthesia.io/v2/videos', {
    method: 'POST',
    headers: {
      'Authorization': process.env.SYNTHESIA_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      test: false,
      input: [{ scriptText: script, avatar: avatarId }],
      visibility: 'private',
    }),
  });

  const data = await response.json();
  return { videoUrl: data.download, taskId: data.id };
}