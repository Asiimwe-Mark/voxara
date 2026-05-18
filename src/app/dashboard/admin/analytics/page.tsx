'use client'

/**
 * Admin - Analytics Page
 */

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react'

interface AnalyticsData {
  dailySignups: Array<{ date: string; count: number }>
  videosGenerated: Array<{ date: string; count: number }>
  creditsUsed: Array<{ date: string; amount: number }>
  topFeatures: Array<{ feature: string; uses: number }>
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState('7d') // 7d, 30d, 90d

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/admin/analytics?timeframe=${timeframe}`)
        if (!response.ok) {
          throw new Error('Failed to fetch analytics')
        }
        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeframe])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm text-muted-foreground">Loading analytics...</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
            Platform usage and performance metrics
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['7d', '30d', '90d'].map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf)
                setLoading(true)
              }}
              className={`h-10 sm:h-11 rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                timeframe === tf
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-foreground border border-border hover:bg-muted/50'
              }`}
            >
              Last {tf === '7d' ? '7 days' : tf === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 sm:p-5 text-sm sm:text-base text-destructive-foreground">
          <strong>Error:</strong> {error}
        </div>
      )}

      {analytics && (
        <div className="space-y-6 sm:space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Total Signups */}
            <Card className="card-premium p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Signups</p>
                  <p className="mt-1.5 sm:mt-2 text-xl sm:text-3xl font-bold tracking-tight">
                    {analytics.dailySignups.reduce((sum, d) => sum + d.count, 0)}
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 dark:text-emerald-400" />
              </div>
            </Card>

            {/* Videos Generated */}
            <Card className="card-premium p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Videos Generated</p>
                  <p className="mt-1.5 sm:mt-2 text-xl sm:text-3xl font-bold tracking-tight">
                    {analytics.videosGenerated.reduce((sum, d) => sum + d.count, 0)}
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
            </Card>

            {/* Credits Consumed */}
            <Card className="card-premium p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Credits Consumed</p>
                  <p className="mt-1.5 sm:mt-2 text-xl sm:text-3xl font-bold tracking-tight">
                    {analytics.creditsUsed.reduce((sum, d) => sum + d.amount, 0)}
                  </p>
                </div>
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-violet-500 dark:text-violet-400" />
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Signups Chart */}
            <Card className="card-premium p-4 sm:p-6">
              <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 tracking-tight">
                Daily Signups
              </h3>
              <div className="space-y-2.5 sm:space-y-3">
                {analytics.dailySignups.slice(-7).map((day) => (
                  <div key={day.date} className="flex items-center justify-between gap-3 sm:gap-4">
                    <span className="text-xs sm:text-sm text-muted-foreground min-w-[60px] sm:min-w-[80px]">
                      {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div
                        className="h-1.5 sm:h-2 rounded-full bg-primary transition-all duration-200"
                        style={{ width: `${Math.min(day.count * 10, 100)}%`, maxWidth: '60%' }}
                      />
                      <span className="text-xs sm:text-sm font-semibold tabular-nums shrink-0">{day.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Features */}
            <Card className="card-premium p-4 sm:p-6">
              <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 tracking-tight">
                Most Used Features
              </h3>
              <div className="space-y-2.5 sm:space-y-3">
                {analytics.topFeatures.map((feature, index) => {
                  const maxUses = Math.max(...analytics.topFeatures.map((f) => f.uses))
                  const widthPercent = Math.max((feature.uses / maxUses) * 100, 10)
                  return (
                    <div key={index} className="flex items-center justify-between gap-3 sm:gap-4">
                      <span className="text-xs sm:text-sm text-muted-foreground truncate min-w-0">
                        {feature.feature}
                      </span>
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div
                          className="h-1.5 sm:h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-200"
                          style={{ width: `${widthPercent}%`, maxWidth: '60%' }}
                        />
                        <span className="text-xs sm:text-sm font-semibold tabular-nums shrink-0">{feature.uses}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Videos Generated Trend */}
          <Card className="card-premium p-4 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 tracking-tight">
              Videos Generated Trend
            </h3>
            <div className="space-y-2.5 sm:space-y-3">
              {analytics.videosGenerated.slice(-14).map((day) => (
                <div key={day.date} className="flex items-center justify-between gap-3 sm:gap-4">
                  <span className="text-xs sm:text-sm text-muted-foreground min-w-[60px] sm:min-w-[80px]">
                    {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div
                      className="h-1.5 sm:h-2 rounded-full bg-violet-500 dark:bg-violet-400 transition-all duration-200"
                      style={{ width: `${Math.min(day.count * 5, 100)}%`, maxWidth: '60%' }}
                    />
                    <span className="text-xs sm:text-sm font-semibold tabular-nums shrink-0">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}