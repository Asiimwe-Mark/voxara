import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkHeyGenAvatarStatus } from '@/features/avatar/services/heygen';

export async function GET(request: NextRequest) {
   const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const avatarId = searchParams.get('avatarId');
  if (!avatarId) return NextResponse.json({ error: 'Avatar ID required' }, { status: 400 });

  const { data: avatar } = await supabase
    .from('user_avatars')
    .select('heygen_task_id, status')
    .eq('id', avatarId)
    .eq('user_id', user.id)
    .single();

  if (!avatar) return NextResponse.json({ error: 'Avatar not found' }, { status: 404 });

  if (avatar.status === 'ready' || avatar.status === 'failed') {
    return NextResponse.json({ status: avatar.status });
  }

  try {
    const status = await checkHeyGenAvatarStatus(avatar.heygen_task_id);
    if (status === 'completed') {
      await supabase.from('user_avatars').update({ status: 'ready' }).eq('id', avatarId);
    } else if (status === 'failed') {
      await supabase.from('user_avatars').update({ status: 'failed' }).eq('id', avatarId);
    }
    return NextResponse.json({ status: status === 'completed' ? 'ready' : status });
  } catch (error) {
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }
}