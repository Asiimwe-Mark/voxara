import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AvatarCreator } from '@/components/avatar/AvatarCreator'
import { VoiceCloner } from '@/components/avatar/VoiceCloner'
import { AvatarGallery } from '@/components/avatar/AvatarGallery'
import { VoiceGallery } from '@/components/avatar/VoiceGallery'

export default async function AIStudioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: avatars } = await supabase
    .from('user_avatars')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: voices } = await supabase
    .from('user_voices')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Studio</h2>
          <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
            Create and manage your digital avatars and voice clones
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AvatarCreator />
          <VoiceCloner />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Avatars Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight">Your Avatars</h3>
          </div>
          <AvatarGallery avatars={avatars || []} />
        </div>

        {/* Voices Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight">Your Voices</h3>
          </div>
          <VoiceGallery voices={voices || []} />
        </div>
      </div>
    </div>
  )
}