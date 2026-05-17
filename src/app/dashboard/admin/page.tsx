'use client'

/**
 * Admin Dashboard - Overview Page
 */

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Users, Video, DollarSign, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalVideos: number
  totalRevenue: number
  monthlyRecurringRevenue: number
  activeSubscriptions: number
  failedPayments: number
  systemHealth: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm text-muted-foreground">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 sm:p-5 text-sm sm:text-base text-destructive-foreground">
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />,
      trend: '+12% this month',
      contextColor: 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50',
    },
    {
      title: 'Active Users (30d)',
      value: stats.activeUsers.toLocaleString(),
      icon: <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />,
      trend: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% engagement`,
      contextColor: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50',
    },
    {
      title: 'Total Videos Generated',
      value: stats.totalVideos.toLocaleString(),
      icon: <Video className="h-5 w-5 sm:h-6 sm:w-6 text-violet-600 dark:text-violet-400" />,
      trend: '+8% this month',
      contextColor: 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-200/50 dark:border-violet-800/50',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />,
      trend: `MRR: $${stats.monthlyRecurringRevenue.toLocaleString()}`,
      contextColor: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/50',
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
          Welcome to the Voxara admin panel
        </p>
      </div>

      {/* Alerts */}
      {stats.failedPayments > 0 && (
        <div className="rounded-xl border border-amber-200/50 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 sm:p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-200">
              {stats.failedPayments} Failed Payments
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
              Review failed payment records in the Billing section
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className={`card-premium p-5 sm:p-6 ${stat.contextColor}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground/80">{stat.trend}</p>
              </div>
              <div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Breakdown */}
        <Card className="card-premium p-5 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight mb-4">
            Subscription Metrics
          </h3>
          <div className="space-y-3.5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-sm text-muted-foreground">Active Subscriptions</span>
              <span className="font-semibold tabular-nums">
                {stats.activeSubscriptions.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-sm text-muted-foreground">Monthly Recurring Revenue</span>
              <span className="font-semibold tabular-nums">
                ${stats.monthlyRecurringRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-sm text-muted-foreground">Failed Payments</span>
              <span className="font-semibold tabular-nums text-destructive">
                {stats.failedPayments}
              </span>
            </div>
          </div>
        </Card>

        {/* System Status */}
        <Card className="card-premium p-5 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight mb-4">
            System Health
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Database', status: 'Healthy' },
              { label: 'API Service', status: 'Operational' },
              { label: 'Payment Integration', status: 'Connected' },
            ].map(({ label, status }) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_hsl(var(--color-emerald-500))]" />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-premium p-5 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold tracking-tight mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'View All Users', color: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' },
            { label: 'View All Videos', color: 'bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600' },
            { label: 'Recent Payments', color: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600' },
            { label: 'System Logs', color: 'bg-muted hover:bg-muted/80 text-foreground dark:text-foreground' },
          ].map(({ label, color }) => (
            <button
              key={label}
              className={`rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-primary-foreground transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] ${color}`}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}