"use client"

import { useState, useEffect } from "react"
import { BarChart2, TrendingUp, Eye, Clock, MousePointer, Loader2, Lock } from "lucide-react"
import Link from "next/link"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface OverviewData {
  overview: { totalViews: number; totalWatchTime: number; avgCTR: number; avgRetention: number }
  dailyData: { date: string; views: number; watchTime: number; ctr: number }[]
  topVideos: { video_id: string; views: number; ctr: number; average_view_percentage: number; videos: { title: string } | null }[]
}

function StatCard({ icon: Icon, label, value, sub, color = "text-primary" }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <Card className="card-glow rounded-2xl overflow-hidden group hover:shadow-md hover:border-primary/30 transition-all duration-200">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
          <Icon className={`h-3.5 w-3.5 ${color}`} />
          <span className="font-medium">{label}</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold tracking-tight stat-number">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export function AnalyticsDashboard({ plan }: { plan: string }) {
  const [period, setPeriod] = useState("30d")
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  const isPaidPlan = plan !== "free"

  useEffect(() => {
    if (!isPaidPlan) { setLoading(false); return }
    setLoading(true)
    fetch(`/api/analytics/overview?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .catch((e) => process.env.NODE_ENV !== 'production' && console.error(e))
      .finally(() => setLoading(false))
  }, [period, isPaidPlan])

  if (!isPaidPlan) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
            Understand how your videos perform
          </p>
        </div>

        {/* Locked State */}
        <Card className="card-glow rounded-2xl border-dashed border-2">
          <CardContent className="flex flex-col items-center px-4 py-10 text-center sm:px-6 sm:py-14">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted sm:mb-5 sm:h-14 sm:w-14">
              <Lock className="h-5 w-5 text-muted-foreground sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-1.5 text-base font-semibold tracking-tight sm:mb-2 sm:text-lg">
              Analytics require Pro or Agency
            </h3>
            <p className="mb-5 max-w-xs text-xs leading-relaxed text-muted-foreground sm:mb-7 sm:text-sm sm:max-w-sm">
              Upgrade to track views, watch time, CTR, and retention across all your videos.
            </p>
            <Button
              asChild
              className="h-10 w-full rounded-xl text-sm font-medium sm:h-11 sm:w-auto"
            >
              <Link href="/pricing">Upgrade Plan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with Period Select */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
            Performance overview for your videos
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-10 sm:h-11 w-full sm:w-36 rounded-lg text-sm focus:ring-2 focus:ring-primary/30">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-sm text-muted-foreground">Loading analytics...</span>
        </div>
      ) : !data ? (
        <Card className="card-glow rounded-2xl">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Failed to load analytics. Please refresh the page.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard 
              icon={Eye} 
              label="Total Views" 
              value={data.overview.totalViews.toLocaleString()} 
              color="text-blue-500 dark:text-blue-400" 
            />
            <StatCard 
              icon={Clock} 
              label="Watch Time" 
              value={`${Math.round(data.overview.totalWatchTime / 60)} min`} 
              color="text-violet-500 dark:text-violet-400" 
            />
            <StatCard 
              icon={MousePointer} 
              label="Avg CTR" 
              value={`${data.overview.avgCTR.toFixed(1)}%`} 
              color="text-emerald-500 dark:text-emerald-400" 
            />
            <StatCard 
              icon={TrendingUp} 
              label="Avg Retention" 
              value={`${Math.round(data.overview.avgRetention)}%`} 
              color="text-amber-500 dark:text-amber-400" 
            />
          </div>

          {/* Views Over Time Chart */}
          {data.dailyData.length > 0 ? (
            <Card className="card-glow rounded-2xl min-w-0 overflow-hidden">
              <CardHeader className="pb-2 px-4 sm:px-6">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  <span>Views Over Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-6 pb-4">
                <div className="w-full h-[240px] sm:h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={data.dailyData} 
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        tick={{ fontSize: 11 }} 
                        className="text-muted-foreground"
                        tickFormatter={(v) => v.toLocaleString()}
                      />
                      <Tooltip
                        labelFormatter={(v) => new Date(v as string).toLocaleDateString()}
                        formatter={(val) => [val?.toLocaleString(), "Views"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                          fontSize: "12px",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="views" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2} 
                        dot={false} 
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-glow rounded-2xl min-w-0 overflow-hidden">
              <CardContent className="py-8 px-4 text-center sm:py-10">
                <div className="empty-state py-0">
                  <div className="empty-state-icon">
                    <BarChart2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <p className="empty-state-title">No view data yet</p>
                  <p className="empty-state-description">
                    Share your videos to start seeing analytics!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Videos List */}
          {data.topVideos.length > 0 && (
            <Card className="card-glow rounded-2xl min-w-0 overflow-hidden">
              <CardHeader className="pb-2 px-4 sm:px-6">
                <CardTitle className="text-base">Top Videos</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Ranked by views in this period
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6 pb-4">
                <div className="space-y-0">
                  {data.topVideos.map((v, i) => (
                    <div
                      key={`${v.video_id}-${i}`}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 px-2 sm:px-0 ${
                        i < data.topVideos.length - 1 ? "border-b border-border/50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-bold text-muted-foreground w-5 shrink-0 tabular-nums">
                          {i + 1}
                        </span>
                        <p className="text-sm font-medium truncate" title={v.videos?.title ?? "Untitled"}>
                          {v.videos?.title ?? "Untitled"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 tabular-nums">
                          <Eye className="h-3.5 w-3.5" />
                          {v.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 tabular-nums">
                          <MousePointer className="h-3.5 w-3.5" />
                          {v.ctr.toFixed(1)}%
                        </span>
                        <Badge 
                          variant="outline" 
                          className="text-xs tabular-nums border-border/50"
                        >
                          {Math.round(v.average_view_percentage)}% retention
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}