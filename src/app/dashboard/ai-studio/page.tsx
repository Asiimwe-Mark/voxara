import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AvatarCreator } from '@/components/avatar/AvatarCreator';
import { VoiceCloner } from '@/components/avatar/VoiceCloner';
import { AvatarGallery } from '@/components/avatar/AvatarGallery';
import { VoiceGallery } from '@/components/avatar/VoiceGallery';

export default async function AIStudioPage() {
  const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: avatars } = await supabase.from('user_avatars').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  const { data: voices } = await supabase.from('user_voices').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Studio</h2>
          <p className="text-muted-foreground">Create and manage your digital avatars and voice clones</p>
        </div>
        <div className="flex gap-2">
          <AvatarCreator />
          <VoiceCloner />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Avatars</h3>
          <AvatarGallery avatars={avatars || []} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Voices</h3>
          <VoiceGallery voices={voices || []} />
        </div>
      </div>
    </div>
  );
}