import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed gap-2',
  {
    variants: {
      variant: {
        /* ── Primary: Main call-to-action ──────────────────────── */
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-sm hover:shadow-md',

        /* ── Destructive: Dangerous actions ────────────────────── */
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 shadow-sm hover:shadow-md',

        /* ── Outline: Secondary action ─────────────────────────── */
        outline:
          'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80 transition-smooth',

        /* ── Secondary: Softer alternative ────────────────────── */
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/60 transition-smooth',

        /* ── Ghost: Minimal, text-like ──────────────────────────── */
        ghost:
          'hover:bg-accent hover:text-accent-foreground active:bg-accent/80 transition-smooth',

        /* ── Link: Text button ──────────────────────────────────── */
        link: 'text-primary underline-offset-4 hover:underline active:text-primary/80 transition-smooth',

        /* ── Subtle: Faint background ──────────────────────────── */
        subtle:
          'bg-muted text-muted-foreground hover:bg-muted/80 active:bg-muted/60 transition-smooth',
      },

      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-6 text-base',
        icon: 'h-10 w-10 rounded-lg',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-12 w-12 rounded-lg',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
