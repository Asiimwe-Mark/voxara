'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function ErrorPage({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 sm:gap-6 p-4 sm:p-8 text-center">
      {/* Error Icon */}
      <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" />
      </div>

      {/* Error Message */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Something went wrong
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
          An error occurred while loading this page. Our team has been notified.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono break-all">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      {/* Action Button */}
      <Button 
        onClick={() => reset()}
        className="h-11 sm:h-12 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
      >
        Try again
      </Button>
    </div>
  )
}