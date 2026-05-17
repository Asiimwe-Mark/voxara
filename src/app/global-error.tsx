'use client'

/**
 * Global Error Boundary — required by Next.js App Router + Sentry
 * Catches errors in the root layout.
 */

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
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
    <html>
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 sm:gap-6 p-4 sm:p-8 text-center">
          {/* Error Icon (optional visual cue) */}
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-destructive/10 flex items-center justify-center mb-1 sm:mb-2">
            <svg 
              className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Something went wrong
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
              An unexpected error occurred. Our team has been notified.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => reset()}
            className="h-11 sm:h-12 px-5 sm:px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-smooth hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}