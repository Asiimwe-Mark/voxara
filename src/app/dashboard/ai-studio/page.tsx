import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AvatarCreator } from '@/components/avatar/AvatarCreator'
import { VoiceCloner } from '@/components/avatar/VoiceCloner'
import { AvatarGallery } from '@/components/avatar/AvatarGallery'
import { VoiceGallery } from '@/components/avatar/VoiceGallery'
import { User, Mic } from 'lucide-react'

export default async function AIStudioPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: avatars }, { data: voices }] = await Promise.all([
    supabase
      .from('user_avatars')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('user_voices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const avatarCount = avatars?.length ?? 0
  const voiceCount  = voices?.length ?? 0

  return (
    <div className="w-full max-w-5xl space-y-5 sm:space-y-7">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="pb-1">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            AI Studio
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Create and manage your digital avatars and voice clones
          </p>
        </div>

        {/* Action buttons — stack on mobile, row on desktop */}
        <div className="flex shrink-0 flex-col gap-2 xs:flex-row sm:flex-row">
          <AvatarCreator />
          <VoiceCloner />
        </div>
      </div>

      {/* ── Content grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">

        {/* Avatars */}
        <section aria-label="Your avatars" className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 shrink-0 text-primary" />
            <h3 className="text-sm font-semibold tracking-tight sm:text-base">
              Your Avatars
            </h3>
            {avatarCount > 0 && (
              <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                {avatarCount}
              </span>
            )}
          </div>
          <AvatarGallery avatars={avatars ?? []} />
        </section>

        {/* Voices */}
        <section aria-label="Your voices" className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 shrink-0 text-primary" />
            <h3 className="text-sm font-semibold tracking-tight sm:text-base">
              Your Voices
            </h3>
            {voiceCount > 0 && (
              <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                {voiceCount}
              </span>
            )}
          </div>
          <VoiceGallery voices={voices ?? []} />
        </section>

      </div>
    </div>
  )
}