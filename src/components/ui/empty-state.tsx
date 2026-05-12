import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import type { ButtonProps } from './button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    variant?: ButtonProps['variant']
    size?: ButtonProps['size']
  }
  className?: string
}

/**
 * Premium empty state component
 * Use for empty lists, no results, etc.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <Button
          {...(action.href ? { asChild: true } : { onClick: action.onClick })}
          variant={action.variant}
          size={action.size || 'lg'}
          className="mt-6"
        >
          {action.href ? (
            <a href={action.href}>{action.label}</a>
          ) : (
            action.label
          )}
        </Button>
      )}
    </div>
  )
}
