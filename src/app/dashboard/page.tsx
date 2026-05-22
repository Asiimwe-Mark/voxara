import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  PlusCircle,
  Sparkles,
  TrendingUp,
  Video,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { VideoCard } from '@/components/dashboard/video-card'
import { ShareForCredits } from '@/components/credits/ShareForCredits'
import { ReferralCard } from '@/components/credits/ReferralCard'
import { CheckoutNotifier } from '@/components/dashboard/checkout-notifier'
import { DashboardStatsCard } from '@/components/dashboard/stats-card'

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

  const readyCount      = videos?.filter((v) => v.status === 'ready').length ?? 0
  const processingCount = videos?.filter((v) => v.status === 'processing').length ?? 0
  const hasVideos       = (videos?.length ?? 0) > 0
  const credits         = profile?.credits ?? 0
  const firstName       = profile?.full_name?.split(' ')[0]

  return (
    <div className="space-y-5 sm:space-y-7 overflow-x-hidden w-full">
      <Suspense fallback={null}>
        <CheckoutNotifier />
      </Suspense>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            {firstName ? (
              <>
                Welcome back,{' '}
                <em className="font-display italic not-italic text-primary">
                  {firstName}
                </em>
                <Sparkles className="inline-block ml-2 h-5 w-5 text-primary animate-[float_3s_ease-in-out_infinite]" />
              </>
            ) : (
              'My Videos'
            )}
          </h1>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {hasVideos
              ? `${videos!.length} video${videos!.length === 1 ? '' : 's'} · ${credits} credit${credits === 1 ? '' : 's'} available`
              : 'Create your first AI video — no camera needed'}
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="group h-10 w-full rounded-xl text-sm font-medium transition-all hover:scale-[1.015] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-11 sm:w-auto"
        >
          <Link href="/dashboard/create">
            <PlusCircle className="mr-2 h-4 w-4 shrink-0" />
            New Video
            <ArrowRight className="ml-2 h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>

      {/* ── Low-credit alert ─────────────────────────────────────────────── */}
      {credits <= 2 && profile?.plan === 'free' && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200/60 bg-amber-50/60 px-4 py-3.5 dark:border-amber-800/40 dark:bg-amber-950/20 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300 sm:text-sm">
            ⚠️ Only {credits} credit{credits === 1 ? '' : 's'} remaining — top up to keep creating.
          </p>
          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-9 w-full shrink-0 rounded-lg border-amber-300/60 text-xs font-medium hover:bg-amber-100/60 dark:border-amber-700/50 dark:hover:bg-amber-900/20 sm:w-auto sm:text-sm"
          >
            <Link href="/dashboard/billing">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Buy Credits
            </Link>
          </Button>
        </div>
      )}

      {/* ── Stats grid ───────────────────────────────────────────────────── */}
      {hasVideos && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 stagger-children">
          <DashboardStatsCard
            label="Total"
            value={videos?.length ?? 0}
            icon={Video}
            iconBgClass="bg-primary/10"
            iconColorClass="text-primary"
            index={0}
          />
          <DashboardStatsCard
            label="Ready"
            value={readyCount}
            icon={TrendingUp}
            iconBgClass="bg-emerald-100 dark:bg-emerald-950/30"
            iconColorClass="text-emerald-600 dark:text-emerald-400"
            index={1}
          />
          <DashboardStatsCard
            label="In Progress"
            value={processingCount}
            icon={Zap}
            iconBgClass="bg-amber-100 dark:bg-amber-950/30"
            iconColorClass="text-amber-600 dark:text-amber-400"
            index={2}
          />
        </div>
      )}

      {/* ── Videos grid / empty state ─────────────────────────────────────── */}
      {hasVideos ? (
        <section aria-label="Your videos">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight sm:mb-5 sm:text-base">
            <Video className="h-4 w-4 text-primary" />
            Your Videos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 stagger-children">
            {videos!.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 px-4 py-10 text-center sm:px-6 sm:py-14 bg-gradient-to-b from-primary/[0.02] to-transparent relative overflow-hidden">
          {/* Radial glow behind illustration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/[0.06] blur-3xl pointer-events-none" />

          {/* Video camera illustration */}
          <div className="relative mb-4 sm:mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 sm:h-16 sm:w-16 relative z-10">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                className="h-6 w-6 sm:h-8 sm:w-8 text-primary"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="12" width="28" height="24" rx="4" />
                <path d="M32 20l12-6v20l-12-6" />
                {/* Radiating lines */}
                <line x1="4" y1="24" x2="0" y2="24" opacity="0.4" />
                <line x1="4" y1="18" x2="0" y2="15" opacity="0.3" />
                <line x1="4" y1="30" x2="0" y2="33" opacity="0.3" />
              </svg>
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-primary/40 animate-[float_3s_ease-in-out_infinite] z-20" />
          </div>

          <h3 className="relative z-10 mb-2 text-base font-semibold tracking-tight sm:text-lg">
            No videos yet
          </h3>
          <p className="relative z-10 mb-5 max-w-xs text-xs leading-relaxed text-muted-foreground sm:mb-7 sm:text-sm sm:max-w-sm">
            Create your first faceless video — enter a topic and we'll handle
            the script, voiceover, footage, and editing.
          </p>

          <div className="relative z-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Button
              asChild
              size="lg"
              className="group h-10 w-full rounded-xl text-sm font-medium transition-all hover:scale-[1.015] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-11 sm:w-auto"
            >
              <Link href="/dashboard/create">
                <PlusCircle className="mr-2 h-4 w-4 shrink-0" />
                Create Your First Video
                <ArrowRight className="ml-2 h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>

            {profile?.plan === 'free' && (
              <p className="text-center text-xs leading-relaxed text-muted-foreground sm:text-left">
                Free plan includes {credits || 1} credit.{' '}
                <Link
                  href="/pricing"
                  className="font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Upgrade or share to earn more.
                </Link>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Growth widgets (free plan) ────────────────────────────────────── */}
      {profile?.plan === 'free' && (
        <div className="border-t border-border/50 pt-5 sm:pt-7">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground sm:text-[11px]">
            Grow your credits
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <div className="space-y-2.5">
              <p className="text-xs font-medium sm:text-sm">Refer a friend</p>
              <ReferralCard />
            </div>

            {hasVideos && (
              <div className="space-y-2.5">
                <p className="text-xs font-medium sm:text-sm">Share to earn</p>
                <ShareForCredits
                  videoId={videos![0].id}
                  videoUrl={videos![0].video_url ?? videos![0].youtube_id ?? ''}
                  videoTitle={videos![0].title}
                  currentCredits={credits}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
