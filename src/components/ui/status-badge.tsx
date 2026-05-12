import React from 'react'
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type StatusType = 'success' | 'pending' | 'processing' | 'error' | 'warning'

interface StatusBadgeProps {
  status: StatusType
  label?: string
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig = {
  success: {
    label: 'Success',
    icon: CheckCircle2,
    color:
      'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-900',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400',
    borderColor: 'border-slate-200 dark:border-slate-800',
  },
  processing: {
    label: 'Processing',
    icon: Loader2,
    color: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-900',
  },
  error: {
    label: 'Error',
    icon: XCircle,
    color: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-900',
  },
  warning: {
    label: 'Warning',
    icon: AlertCircle,
    color: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-900',
  },
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

/**
 * Status badge for displaying status across the app
 * Use for video status, processing states, etc.
 */
export function StatusBadge({
  status,
  label,
  className,
  showIcon = true,
  size = 'md',
}: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  const isAnimating = status === 'processing'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-smooth',
        sizeClasses[size],
        config.color,
        config.borderColor,
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(iconSizes[size], isAnimating && 'animate-spin')} />
      )}
      <span>{label || config.label}</span>
    </div>
  )
}

/**
 * Status indicator dot (for compact status display)
 */
export function StatusIndicator({
  status,
  className,
  animated = false,
}: {
  status: StatusType
  className?: string
  animated?: boolean
}) {
  const config = statusConfig[status]
  const baseColor = config.color.split(' ')[0]

  return (
    <div
      className={cn(
        'h-3 w-3 rounded-full',
        baseColor,
        animated && 'animate-pulse',
        className
      )}
    />
  )
}
