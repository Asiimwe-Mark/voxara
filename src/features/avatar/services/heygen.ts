function getHeyGenKey(): string {
  if (!process.env.HEYGEN_API_KEY) throw new Error('HEYGEN_API_KEY is not set');
  return process.env.HEYGEN_API_KEY;
}

interface CreateAvatarParams {
  name: string;
  imageUrl?: string;
  gender?: 'male' | 'female' | 'neutral';
}

export async function createHeyGenAvatar({ name, imageUrl, gender = 'neutral' }: CreateAvatarParams) {
  const response = await fetch('https://api.heygen.com/v2/avatar', {
    method: 'POST',
    headers: {
      'X-Api-Key': getHeyGenKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      avatar_name: name,
      image_url: imageUrl,
      gender,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HeyGen API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    avatarId: data.data?.avatar_id,
    taskId: data.data?.task_id,
  };
}

export async function checkHeyGenAvatarStatus(taskId: string) {
  const response = await fetch(`https://api.heygen.com/v2/avatar/task/${taskId}`, {
    headers: { 'X-Api-Key': getHeyGenKey() },
  });

  if (!response.ok) throw new Error(`Failed to check status: ${response.status}`);
  const data = await response.json();
  return data.data?.status; // 'pending', 'processing', 'completed', 'failed'
}

export async function generateHeyGenVideo(
  avatarId: string,
  script: string,
  voiceConfig?: { type: string; voice_id?: string } | undefined
) {
  const response = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': getHeyGenKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      video_inputs: [{
        character: { type: 'avatar', avatar_id: avatarId },
        // voiceConfig is undefined for free users → HeyGen uses its built-in voice (free)
        // voiceConfig is { type: 'elevenlabs', voice_id: '...' } for Pro/Agency
        voice: voiceConfig,
        background: { type: 'color', value: '#00FF00' },
      }],
      script: { type: 'text', input: script },
      dimension: { width: 1920, height: 1080 },
    }),
  });

  const data = await response.json();
  return { videoUrl: data.data?.video_url, taskId: data.data?.task_id };
}