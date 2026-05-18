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
import { Card, CardContent } from '@/components/ui/card'
import { VideoCard } from '@/components/dashboard/video-card'
import { ShareForCredits } from '@/components/credits/ShareForCredits'
import { ReferralCard } from '@/components/credits/ReferralCard'
import { CheckoutNotifier } from '@/components/dashboard/checkout-notifier'

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
            {firstName ? `Welcome back, ${firstName}` : 'My Videos'}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {/* Total videos */}
          <Card className="card-premium overflow-hidden">
            <CardContent className="p-3.5 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-medium text-muted-foreground sm:text-xs">
                    Total
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums tracking-tight sm:text-2xl lg:text-3xl">
                    {videos?.length ?? 0}
                  </p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-10 sm:w-10">
                  <Video className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ready */}
          <Card className="card-premium overflow-hidden">
            <CardContent className="p-3.5 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-medium text-muted-foreground sm:text-xs">
                    Ready
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-2xl lg:text-3xl">
                    {readyCount}
                  </p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/30 sm:h-10 sm:w-10">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing */}
          <Card className="card-premium overflow-hidden">
            <CardContent className="p-3.5 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-medium text-muted-foreground sm:text-xs">
                    In Progress
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-amber-600 dark:text-amber-400 sm:text-2xl lg:text-3xl">
                    {processingCount}
                  </p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/30 sm:h-10 sm:w-10">
                  <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Videos grid / empty state ─────────────────────────────────────── */}
      {hasVideos ? (
        <section aria-label="Your videos">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight sm:mb-5 sm:text-base">
            <Video className="h-4 w-4 text-primary" />
            Your Videos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {videos!.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 px-6 py-14 text-center sm:py-20">
          {/* Icon */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 sm:h-16 sm:w-16">
            <Sparkles className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
          </div>

          <h3 className="mb-2 text-base font-semibold tracking-tight sm:text-lg">
            No videos yet
          </h3>
          <p className="mb-7 max-w-sm text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Create your first faceless video — enter a topic and we'll handle
            the script, voiceover, footage, and editing.
          </p>

          {/* CTA row */}
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
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