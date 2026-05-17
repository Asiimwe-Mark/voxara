'use client'

/**
 * Admin - Billing Management Page
 */

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface BillingRecord {
  id: string
  user_id: string
  email: string
  amount: number
  currency: string
  status: string
  payment_method: string
  payment_charge_id: string
  created_at: string
}

export default function AdminBilling() {
  const [records, setRecords] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed'>('all')

  useEffect(() => {
    const fetchBillingRecords = async () => {
      try {
        const response = await fetch(
          `/api/admin/billing?status=${filter === 'all' ? '' : filter}`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch billing records')
        }
        const data = await response.json()
        setRecords(data.records)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchBillingRecords()
  }, [filter])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm text-muted-foreground">Loading billing records...</span>
      </div>
    )
  }

  const stats = {
    totalCompleted: records.filter((r) => r.status === 'completed').length,
    totalFailed: records.filter((r) => r.status === 'failed').length,
    totalRevenue: records
      .filter((r) => r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0),
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing Management</h1>
        <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
          Monitor and manage payment transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Successful Payments */}
        <Card className="card-premium p-5 sm:p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50">
          <p className="text-xs sm:text-sm text-muted-foreground">Successful Payments</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {stats.totalCompleted}
          </p>
        </Card>

        {/* Failed Payments */}
        <Card className="card-premium p-5 sm:p-6 bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50">
          <p className="text-xs sm:text-sm text-muted-foreground">Failed Payments</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
            {stats.totalFailed}
          </p>
        </Card>

        {/* Total Revenue */}
        <Card className="card-premium p-5 sm:p-6 bg-primary/5 dark:bg-primary/10 border-primary/20">
          <p className="text-xs sm:text-sm text-muted-foreground">Total Revenue</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            ${(stats.totalRevenue / 100).toFixed(2)}
          </p>
        </Card>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 sm:p-5 text-sm sm:text-base text-destructive-foreground">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'completed', 'failed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f)
              setLoading(true)
            }}
            className={`h-10 sm:h-11 rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              filter === f
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card text-foreground border border-border hover:bg-muted/50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Billing Records Table */}
      <Card className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Email
                </th>
                <th className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Method
                </th>
                <th className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 sm:px-6 py-10 text-center">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <p className="empty-state-title">No billing records found</p>
                      <p className="empty-state-description">
                        Try adjusting your filters or check back later.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr 
                    key={record.id} 
                    className="hover:bg-muted/30 transition-colors duration-150"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-sm font-medium truncate block max-w-[180px] sm:max-w-none">
                        {record.email}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-sm font-semibold tabular-nums">
                        ${(record.amount / 100).toFixed(2)} <span className="text-muted-foreground">{record.currency}</span>
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2">
                        {record.status === 'completed' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Completed</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-red-700 dark:text-red-400">Failed</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-sm text-muted-foreground">{record.payment_method}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {new Date(record.created_at).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}