import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

/**
 * Premium loading spinner component
 * Use for indicating loading states throughout the app
 */
export function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

/**
 * Full-page loading state
 */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-background">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" className="text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  )
}

/**
 * Inline loading state for forms/buttons
 */
export function InlineLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" className="text-current" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  )
}
