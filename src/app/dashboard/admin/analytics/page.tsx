/**
 * Admin - Analytics Page
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AnalyticsData {
  dailySignups: Array<{ date: string; count: number }>;
  videosGenerated: Array<{ date: string; count: number }>;
  creditsUsed: Array<{ date: string; amount: number }>;
  topFeatures: Array<{ feature: string; uses: number }>;
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('7d'); // 7d, 30d, 90d

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/admin/analytics?timeframe=${timeframe}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe]);

  if (loading) return <div className="text-center py-12">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">Platform usage and performance metrics</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                setLoading(true);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Last {tf === '7d' ? '7 days' : tf === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">Error: {error}</div>
      )}

      {analytics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Signups</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {analytics.dailySignups.reduce((sum, d) => sum + d.count, 0)}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Videos Generated</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {analytics.videosGenerated.reduce((sum, d) => sum + d.count, 0)}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Credits Consumed</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {analytics.creditsUsed.reduce((sum, d) => sum + d.amount, 0)}
                  </p>
                </div>
                <TrendingDown className="h-5 w-5 text-purple-600" />
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Daily Signups Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Daily Signups
              </h3>
              <div className="space-y-2">
                {analytics.dailySignups.slice(-7).map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 bg-blue-500"
                        style={{ width: `${Math.min(day.count * 10, 100)}px` }}
                      />
                      <span className="text-sm font-semibold">{day.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Features */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Most Used Features
              </h3>
              <div className="space-y-3">
                {analytics.topFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{feature.feature}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 bg-green-500"
                        style={{
                          width: `${Math.max(feature.uses / Math.max(...analytics.topFeatures.map((f) => f.uses)), 0.1) * 100}px`,
                        }}
                      />
                      <span className="text-sm font-semibold">{feature.uses}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Videos Generated Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Videos Generated Trend
            </h3>
            <div className="space-y-2">
              {analytics.videosGenerated.slice(-14).map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-purple-500"
                      style={{ width: `${Math.min(day.count * 5, 200)}px` }}
                    />
                    <span className="text-sm font-semibold">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
