import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, Sparkles, TrendingUp, Video, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { VideoCard } from '@/components/dashboard/video-card'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: videos }, { data: profile }] = await Promise.all([
    supabase
      .from('videos')
      .select(
        'id, title, status, mux_playback_id, video_url, youtube_id, created_at'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('credits, plan, full_name')
      .eq('id', user.id)
      .single(),
  ])

  const readyCount = videos?.filter((v) => v.status === 'ready').length ?? 0
  const processingCount =
    videos?.filter((v) => v.status === 'processing').length ?? 0

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {profile?.full_name
              ? `Welcome back, ${profile.full_name.split(' ')[0]}`
              : 'My Videos'}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1 sm:mt-0.5">
            {videos?.length
              ? `${videos.length} video${videos.length === 1 ? '' : 's'} · ${profile?.credits ?? 0} credits remaining`
              : 'Create your first AI video — no camera needed'}
          </p>
        </div>
        <Button asChild size="sm" className="w-full sm:w-auto">
          <Link href="/dashboard/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Video
          </Link>
        </Button>
      </div>

      {/* Stats bar */}
      {(videos?.length ?? 0) > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Card className="border-none shadow-none bg-slate-50 dark:bg-slate-900">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Video className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Total Videos</span>
                <span className="xs:hidden">Total</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold tabular-nums">
                {videos?.length ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-none bg-emerald-50 dark:bg-emerald-950/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 text-emerald-600 text-xs mb-1">
                <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Ready
              </div>
              <p className="text-xl sm:text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                {readyCount}
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-none bg-amber-50 dark:bg-amber-950/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 text-amber-600 text-xs mb-1">
                <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Processing</span>
                <span className="xs:hidden">Proc</span>
              </div>
              <p className="text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
                {processingCount}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Low-credit alert */}
      {(profile?.credits ?? 0) <= 2 && profile?.plan === 'free' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 px-3 sm:px-4 py-3 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4">
          <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 font-medium">
            ⚠️ You have only {profile?.credits ?? 0} credit
            {profile?.credits === 1 ? '' : 's'} left.
          </p>
          <Button
            size="sm"
            variant="outline"
            asChild
            className="w-full xs:w-auto border-amber-300 hover:bg-amber-100 dark:border-amber-700 text-xs sm:text-sm"
          >
            <Link href="/dashboard/billing">
              <Sparkles className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Buy Credits
            </Link>
          </Button>
        </div>
      )}

      {/* Video grid or empty state */}
      {videos && videos.length > 0 ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 text-center px-4">
            <div className="h-12 sm:h-16 w-12 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-5">
              <Sparkles className="h-6 sm:h-8 w-6 sm:w-8 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
              No videos yet
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-xs mb-4 sm:mb-6">
              Create your first faceless video with AI — enter a topic and we'll
              handle the script, voiceover, footage, and editing.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Video
              </Link>
            </Button>
            {profile?.plan === 'free' && (
              <p className="text-xs text-muted-foreground mt-4">
                Free plan includes {profile?.credits ?? 3} credits.{' '}
                <Link href="/pricing" className="underline hover:text-primary">
                  Upgrade for more.
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
