import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, Sparkles, TrendingUp, Video, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { VideoCard } from '@/components/dashboard/video-card'
import { ShareForCredits } from '@/components/credits/ShareForCredits'
import { ReferralCard } from '@/components/credits/ReferralCard'

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            {profile?.full_name
              ? `Welcome back, ${profile.full_name.split(' ')[0]}`
              : 'My Videos'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {videos?.length
              ? `${videos.length} video${videos.length === 1 ? '' : 's'} created · ${profile?.credits ?? 0} credits available`
              : 'Create your first AI video — no camera needed'}
          </p>
        </div>
        <Button 
          asChild 
          size="lg" 
          className="w-full sm:w-auto h-11 sm:h-12 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Link href="/dashboard/create">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Video
          </Link>
        </Button>
      </div>

      {/* Low-credit Alert */}
      {(profile?.credits ?? 0) <= 2 && profile?.plan === 'free' && (
        <div className="rounded-xl border border-amber-200/50 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
            ⚠️ Low credits: You have only {profile?.credits ?? 0} credit
            {(profile?.credits ?? 0) === 1 ? '' : 's'} remaining.
          </p>
          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-9 sm:h-10 border-amber-300/50 dark:border-amber-700/50 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 w-full sm:w-auto rounded-lg text-xs sm:text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            <Link href="/dashboard/billing">
              <Sparkles className="mr-2 h-4 w-4" />
              Buy Credits
            </Link>
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      {(videos?.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Videos */}
          <Card className="card-premium">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-2">
                    Total Videos
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums">
                    {videos?.length ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Video className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ready to Share */}
          <Card className="card-premium">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-2">
                    Ready to Share
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
                    {readyCount}
                  </p>
                </div>
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing */}
          <Card className="card-premium">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-2">
                    Processing
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-amber-600 dark:text-amber-400">
                    {processingCount}
                  </p>
                </div>
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Videos Section */}
      {(videos?.length ?? 0) > 0 ? (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2 tracking-tight">
            <Video className="h-5 w-5 text-primary" />
            Your Videos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {videos!.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state border-2 border-dashed border-border/50 rounded-xl">
          <div className="empty-state-icon">
            <Sparkles className="h-full w-full" />
          </div>
          <h3 className="empty-state-title">No videos yet</h3>
          <p className="empty-state-description leading-relaxed">
            Create your first faceless video with AI — enter a topic and we'll
            handle the script, voiceover, footage, and editing.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button asChild size="lg" className="h-11 sm:h-12 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <Link href="/dashboard/create">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Video
              </Link>
            </Button>
            {profile?.plan === 'free' && (
              <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left leading-relaxed">
                Free plan includes {profile?.credits ?? 1} credit.{' '}
                <span className="hidden sm:inline"> </span>
                <br className="sm:hidden" />
                <Link
                  href="/pricing"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Upgrade for unlimited or share to earn more.
                </Link>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Growth Widgets for Free Users */}
      {profile?.plan === 'free' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 sm:pt-8 border-t border-border/50">
          <div>
            <h3 className="text-sm font-semibold mb-4 tracking-tight">Earn Free Credits</h3>
            <ReferralCard />
          </div>
          {videos && videos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-4 tracking-tight">Share to Earn</h3>
              <ShareForCredits
                videoId={videos[0].id}
                videoUrl={videos[0].video_url ?? videos[0].youtube_id ?? ''}
                videoTitle={videos[0].title}
                currentCredits={profile?.credits ?? 0}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}