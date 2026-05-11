"use client";

import { useState, useEffect } from "react";
import { BarChart2, TrendingUp, Eye, Clock, MousePointer, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OverviewData {
  overview: { totalViews: number; totalWatchTime: number; avgCTR: number; avgRetention: number };
  dailyData: { date: string; views: number; watchTime: number; ctr: number }[];
  topVideos: { video_id: string; views: number; ctr: number; average_view_percentage: number; videos: { title: string } | null }[];
}

function StatCard({ icon: Icon, label, value, sub, color = "text-primary" }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
          <Icon className={`h-3.5 w-3.5 ${color}`} />
          {label}
        </div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard({ plan }: { plan: string }) {
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const isPaidPlan = plan !== "free";

  useEffect(() => {
    if (!isPaidPlan) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/analytics/overview?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .catch((e) => process.env.NODE_ENV !== 'production' && console.error(e))
      .finally(() => setLoading(false));
  }, [period, isPaidPlan]);

  if (!isPaidPlan) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground text-sm">Understand how your videos perform</p>
        </div>
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center py-20 text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Analytics require Pro or Agency</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Upgrade to track views, watch time, CTR, and retention across all your videos.
            </p>
            <Button asChild><Link href="/pricing">Upgrade Plan</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground text-sm">Performance overview for your videos</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !data ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Failed to load analytics. Please refresh the page.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Eye} label="Total Views" value={data.overview.totalViews.toLocaleString()} color="text-blue-500" />
            <StatCard icon={Clock} label="Watch Time" value={`${Math.round(data.overview.totalWatchTime / 60)} min`} color="text-purple-500" />
            <StatCard icon={MousePointer} label="Avg CTR" value={`${data.overview.avgCTR.toFixed(1)}%`} color="text-green-500" />
            <StatCard icon={TrendingUp} label="Avg Retention" value={`${Math.round(data.overview.avgRetention)}%`} color="text-amber-500" />
          </div>

          {/* Views over time */}
          {data.dailyData.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary" /> Views Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.dailyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      labelFormatter={(v) => new Date(v as string).toLocaleDateString()}
                      formatter={(val) => [val, "Views"]}
                    />
                    <Line type="monotone" dataKey="views" stroke="hsl(221 83% 53%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No view data for this period yet. Share your videos to start seeing analytics!
              </CardContent>
            </Card>
          )}

          {/* Top Videos */}
          {data.topVideos.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Videos</CardTitle>
                <CardDescription>Ranked by views in this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {data.topVideos.map((v, i) => (
                    <div
                      key={`${v.video_id}-${i}`}
                      className={`flex items-center justify-between py-3 gap-4 ${i < data.topVideos.length - 1 ? "border-b" : ""}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">{i + 1}</span>
                        <p className="text-sm font-medium truncate">{v.videos?.title ?? "Untitled"}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{v.views}</span>
                        <span className="hidden sm:flex items-center gap-1"><MousePointer className="h-3 w-3" />{v.ctr.toFixed(1)}%</span>
                        <Badge variant="outline" className="text-xs">{Math.round(v.average_view_percentage)}% retention</Badge>
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
  );
}
