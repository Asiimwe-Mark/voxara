interface CreateAvatarParams {
  name: string;
  imageUrl?: string;
  gender?: 'male' | 'female' | 'neutral';
}

export async function createHeyGenAvatar({ name, imageUrl, gender = 'neutral' }: CreateAvatarParams) {
  const response = await fetch('https://api.heygen.com/v2/avatar', {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.HEYGEN_API_KEY!,
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
    headers: { 'X-Api-Key': process.env.HEYGEN_API_KEY! },
  });

  if (!response.ok) throw new Error(`Failed to check status: ${response.status}`);
  const data = await response.json();
  return data.data?.status; // 'pending', 'processing', 'completed', 'failed'
}

export async function generateHeyGenVideo(avatarId: string, script: string, voiceId?: string) {
  const response = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.HEYGEN_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      video_inputs: [{
        character: { type: 'avatar', avatar_id: avatarId },
        voice: voiceId ? { type: 'elevenlabs', voice_id: voiceId } : undefined,
        background: { type: 'color', value: '#00FF00' },
      }],
      script: { type: 'text', input: script },
      dimension: { width: 1920, height: 1080 },
    }),
  });

  const data = await response.json();
  return { videoUrl: data.data?.video_url, taskId: data.data?.task_id };
}