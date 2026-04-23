/**
 * Admin Dashboard - Overview Page
 */

'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Users, Video, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

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
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Error: {error}
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-12">No data available</div>
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="h-6 w-6 text-blue-600" />,
      trend: '+12% this month',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Users (30d)',
      value: stats.activeUsers.toLocaleString(),
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      trend: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% engagement`,
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Videos Generated',
      value: stats.totalVideos.toLocaleString(),
      icon: <Video className="h-6 w-6 text-purple-600" />,
      trend: '+8% this month',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6 text-amber-600" />,
      trend: `MRR: $${stats.monthlyRecurringRevenue.toLocaleString()}`,
      bgColor: 'bg-amber-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Welcome to the voxara admin panel</p>
      </div>

      {/* Alerts */}
      {stats.failedPayments > 0 && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 flex items-gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">
              {stats.failedPayments} Failed Payments
            </h3>
            <p className="text-sm text-yellow-700">
              Review failed payment records in the Billing section
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className={`p-6 ${stat.bgColor}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs text-gray-500">{stat.trend}</p>
              </div>
              {stat.icon}
            </div>
          </Card>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Subscription Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Subscription Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Subscriptions</span>
              <span className="font-semibold">
                {stats.activeSubscriptions.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Recurring Revenue</span>
              <span className="font-semibold">
                ${stats.monthlyRecurringRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Failed Payments</span>
              <span className="font-semibold text-red-600">
                {stats.failedPayments}
              </span>
            </div>
          </div>
        </Card>

        {/* System Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            System Health
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Database</span>
                <span className="ml-auto text-sm font-semibold text-green-600">
                  Healthy
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">API Service</span>
                <span className="ml-auto text-sm font-semibold text-green-600">
                  Operational
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Stripe Integration</span>
                <span className="ml-auto text-sm font-semibold text-green-600">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
            View All Users
          </button>
          <button className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition">
            View All Videos
          </button>
          <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition">
            Recent Payments
          </button>
          <button className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition">
            System Logs
          </button>
        </div>
      </Card>
    </div>
  )
}
