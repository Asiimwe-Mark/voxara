'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 p-4 sm:p-8 text-center">
      {/* Error Icon with radial glow */}
      <div className="relative">
        <div className="absolute inset-0 -m-4 rounded-full bg-destructive/[0.06] blur-2xl pointer-events-none" />
        <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
          <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" />
        </div>
      </div>

      {/* Error Message */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
          Dashboard failed to load
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-sm leading-relaxed">
          We couldn't load your dashboard. Please try refreshing the page.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={() => reset()}
          className="group h-11 sm:h-12 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <Button
          asChild
          className="group h-11 sm:h-12 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Link href="/dashboard">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
