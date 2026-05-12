import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Form field wrapper for consistent styling and spacing
 */
export function FormField({
  label,
  description,
  error,
  required,
  children,
  className,
}: {
  label?: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

/**
 * Form group wrapper for grouping related fields
 */
export function FormGroup({
  title,
  description,
  children,
  className,
}: {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'space-y-4 pb-6 border-b border-slate-200 dark:border-slate-800 last:border-b-0 last:pb-0',
        className
      )}
    >
      {title && <h3 className="font-semibold text-foreground">{title}</h3>}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  )
}

/**
 * Form container for consistent form styling
 */
export function Form({
  children,
  onSubmit,
  className,
}: {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void | Promise<void>
  className?: string
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn('space-y-6 px-4 sm:px-6 md:px-8 py-6 sm:py-8', className)}
    >
      {children}
    </form>
  )
}
