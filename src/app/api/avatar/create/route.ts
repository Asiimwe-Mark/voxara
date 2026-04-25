import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createHeyGenAvatar } from '@/features/avatar/services/heygen';
import { inngest } from '@/inngest/client';

export async function POST(request: NextRequest) {
   const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check plan – Agency required for custom avatars
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
  if (profile?.plan !== 'agency') {
    return NextResponse.json({ error: 'Agency plan required for custom avatars' }, { status: 403 });
  }

  const { name, imageBase64, gender } = await request.json();
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  // Upload image to Supabase Storage if provided
  let imageUrl: string | undefined;
  if (imageBase64) {
    const buffer = Buffer.from(imageBase64, 'base64');
    const path = `${user.id}/avatars/${Date.now()}.png`;
    await supabase.storage.from('videos').upload(path, buffer, { contentType: 'image/png' });
    const { data } = supabase.storage.from('videos').getPublicUrl(path);
    imageUrl = data.publicUrl;
  }

  const { avatarId, taskId } = await createHeyGenAvatar({ name, imageUrl, gender });

  const { data: avatar, error } = await supabase
    .from('user_avatars')
    .insert({
      user_id: user.id,
      name,
      image_url: imageUrl,
      avatar_model_id: avatarId,
      heygen_task_id: taskId,
      status: 'processing',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Start polling for status
  await inngest.send({
    name: 'avatar/poll-status',
    data: { avatarId: avatar.id, retryCount: 0 },
    ts: Date.now() + 2 * 60 * 1000, // Start after 2 minutes
  });

  return NextResponse.json({ success: true, avatar });
}