import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  PlusCircle, Sparkles, TrendingUp, Video,
  Zap, ArrowRight, BarChart3, Clock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { VideoCard } from '@/components/dashboard/video-card'
import { ShareForCredits } from '@/components/credits/ShareForCredits'
import { ReferralCard } from '@/components/credits/ReferralCard'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: videos }, { data: profile }] = await Promise.all([
    supabase
      .from('videos')
      .select('id, title, status, mux_playback_id, video_url, youtube_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('credits, plan, full_name')
      .eq('id', user.id)
      .single(),
  ])

  const totalVideos     = videos?.length ?? 0
  const readyCount      = videos?.filter((v) => v.status === 'ready').length ?? 0
  const processingCount = videos?.filter((v) => v.status === 'processing').length ?? 0
  const firstName       = profile?.full_name?.split(' ')[0] ?? 'there'
  const credits         = profile?.credits ?? 0
  const plan            = profile?.plan ?? 'free'

  const stats = [
    {
      label: 'Total Videos', value: totalVideos,
      icon: Video, color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300',
    },
    {
      label: 'Ready', value: readyCount,
      icon: TrendingUp, color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300',
    },
    {
      label: 'Processing', value: processingCount,
      icon: Zap, color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300',
    },
    {
      label: 'Credits Left', value: credits,
      icon: Sparkles, color: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-700 dark:text-violet-300',
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">

      {/* ── Page header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {firstName} 👋
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {totalVideos > 0
              ? `${totalVideos} video${totalVideos === 1 ? '' : 's'} · ${credits} credits remaining`
              : 'Create your first AI video — no camera needed'}
          </p>
        </div>
        <Button
          asChild
          className="w-full sm:w-auto btn-shine bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 shadow-md shadow-violet-500/20"
        >
          <Link href="/dashboard/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Video
          </Link>
        </Button>
      </div>

      {/* ── Stats grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={cn(
              'card-premium rounded-2xl p-4 sm:p-5 animate-fade-up',
              `delay-${75 * i}`
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</span>
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', s.bg)}>
                <div className={cn('w-5 h-5 rounded-lg bg-gradient-to-br flex items-center justify-center', s.color)}>
                  <s.icon className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <p className={cn('text-2xl sm:text-3xl font-bold tabular-nums stat-value', s.text)}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Low credit warning ─────────────────────────────── */}
      {credits <= 2 && plan === 'free' && (
        <div className="animate-fade-up rounded-2xl border border-amber-200/70 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 px-4 sm:px-5 py-4 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
              Only {credits} credit{credits === 1 ? '' : 's'} remaining — upgrade to keep creating
            </p>
          </div>
          <Button
            size="sm"
            asChild
            className="btn-shine bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-sm flex-shrink-0"
          >
            <Link href="/dashboard/billing">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Get more credits
            </Link>
          </Button>
        </div>
      )}

      {/* ── Growth widgets for free users ──────────────────── */}
      {plan === 'free' && (
        <div className="grid gap-4 sm:grid-cols-2 animate-fade-up delay-150">
          <ReferralCard />
          {videos && videos.length > 0 && (
            <ShareForCredits
              videoId={videos[0].id}
              videoUrl={videos[0].video_url ?? ''}
              videoTitle={videos[0].title ?? 'My Video'}
              currentCredits={credits}
            />
          )}
        </div>
      )}

      {/* ── Recent activity header ──────────────────────────── */}
      {totalVideos > 0 && (
        <div className="flex items-center justify-between animate-fade-up delay-225">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-sm sm:text-base">Recent Videos</h3>
          </div>
          <Link
            href="/dashboard/analytics"
            className="text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1 hover:underline transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            View analytics
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* ── Video grid or empty state ───────────────────────── */}
      {videos && videos.length > 0 ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-up delay-300">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="animate-fade-up delay-150 relative rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-40" />
          <div className="relative flex flex-col items-center justify-center py-16 sm:py-24 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mb-5 shadow-xl shadow-violet-500/25 animate-float">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">No videos yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-6 leading-relaxed">
              Create your first AI video — type a topic and we&apos;ll handle the
              script, voice, footage, and editing in under 3 minutes.
            </p>
            <Button
              asChild
              size="lg"
              className="btn-shine bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-violet-500/25"
            >
              <Link href="/dashboard/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Video
              </Link>
            </Button>
            {plan === 'free' && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                Free plan includes {credits} credit
                {credits !== 1 ? 's' : ''}.{' '}
                <Link href="/pricing" className="underline hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  Upgrade for more.
                </Link>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
