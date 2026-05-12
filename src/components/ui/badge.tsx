import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 whitespace-nowrap',
  {
    variants: {
      variant: {
        default:
          'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20',
        secondary:
          'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800',
        destructive:
          'border-red-200 dark:border-red-900 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900',
        success:
          'border-emerald-200 dark:border-emerald-900 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900',
        warning:
          'border-amber-200 dark:border-amber-900 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900',
        outline:
          'border-slate-200 dark:border-slate-800 text-foreground hover:bg-slate-50 dark:hover:bg-slate-950',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
