'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface DashboardStatsCardProps {
  label: string
  value: number
  icon: LucideIcon
  iconBgClass: string
  iconColorClass: string
  index: number
}

export function DashboardStatsCard({
  label,
  value,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  index,
}: DashboardStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
    >
      {/* Subtle radial glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/[0.03] transition-all duration-300 pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider sm:text-xs">
            {label}
          </p>
          <p className="mt-1.5 stat-number text-xl text-foreground sm:text-2xl lg:text-3xl">
            {value}
          </p>
        </div>
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10',
            iconBgClass
          )}
        >
          <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', iconColorClass)} />
        </div>
      </div>
    </motion.div>
  )
}
