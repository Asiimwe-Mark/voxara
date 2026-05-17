'use client'

/**
 * Admin - Users Management Page
 */

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface User {
  id: string
  email: string
  subscription_status: string
  subscription_plan: string
  credits: number
  created_at: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 20

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `/api/admin/users?page=${page}&limit=${pageSize}&search=${search}`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        const data = await response.json()
        setUsers(data.users)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchUsers, 300)
    return () => clearTimeout(timer)
  }, [search, page])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm text-muted-foreground">Loading users...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
        <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
          Manage and monitor user accounts
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 sm:p-5 text-sm sm:text-base text-destructive-foreground">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          className="input-premium w-full pl-10 pr-4 text-sm sm:text-base"
        />
      </div>

      {/* Users Table */}
      <Card className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Email
                </th>
                <th className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Plan
                </th>
                <th className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Credits
                </th>
                <th className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 sm:px-6 py-10 text-center">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Search className="h-6 w-6" />
                      </div>
                      <p className="empty-state-title">No users found</p>
                      <p className="empty-state-description">
                        Try adjusting your search or check back later.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-muted/30 transition-colors duration-150"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-sm font-medium truncate block max-w-[180px] sm:max-w-none">
                        {user.email}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`badge-${user.subscription_plan === 'pro' || user.subscription_plan === 'agency' ? 'primary' : 'secondary'}`}>
                        {user.subscription_plan?.toUpperCase() || 'FREE'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.subscription_status === 'active'
                            ? 'badge-success'
                            : 'badge-secondary'
                        }`}
                      >
                        {user.subscription_status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-sm font-semibold tabular-nums">{user.credits}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {new Date(user.created_at).toLocaleDateString(undefined, { 
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

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border/50 bg-muted/10 px-4 sm:px-6 py-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="inline-flex items-center justify-center gap-2 h-10 sm:h-11 rounded-lg px-4 py-2 text-xs sm:text-sm font-medium text-foreground border border-border hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-muted-foreground text-center sm:text-left tabular-nums">
            Page {page + 1}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={users.length < pageSize}
            className="inline-flex items-center justify-center gap-2 h-10 sm:h-11 rounded-lg px-4 py-2 text-xs sm:text-sm font-medium text-foreground border border-border hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  )
}