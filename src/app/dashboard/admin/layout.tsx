'use client'
import logger from '@/lib/logger'

/**
 * Admin Dashboard Layout
 * Protected admin-only layout with sidebar and header
 */

import React from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
  Loader2,
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/check-access')
        if (!res.ok) {
          router.push('/dashboard')
          return
        }
        const data = await res.json()
        setIsAdmin(data.isAdmin)
        setLoading(false)
      } catch (error) {
        logger.error('Failed to verify admin access:', { error: String(error) })
        router.push('/dashboard')
      }
    }

    checkAdmin()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const adminMenuItems = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Analytics',
      href: '/dashboard/admin/analytics',
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Users',
      href: '/dashboard/admin/users',
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: 'Billing',
      href: '/dashboard/admin/billing',
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Access denied. Admin privileges required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-sidebar-background border-r border-sidebar-border transform transition-all duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        } ${desktopSidebarOpen ? 'md:w-64' : 'md:w-20'} md:translate-x-0`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">
          <div className={`flex items-center gap-2.5 overflow-hidden ${!desktopSidebarOpen && 'md:justify-center md:w-full'}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-destructive flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-foreground">VX</span>
            </div>
            <h1 className={`font-bold text-lg text-sidebar-foreground whitespace-nowrap transition-opacity duration-200 ${!desktopSidebarOpen ? 'opacity-0 md:opacity-0' : 'opacity-100'}`}>
              Admin
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring md:hidden"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
            className="hidden md:inline-flex p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
            aria-label={desktopSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {desktopSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {adminMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring ${
                !desktopSidebarOpen ? 'md:justify-center md:px-3' : ''
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${!desktopSidebarOpen ? 'opacity-0 md:opacity-0' : 'opacity-100'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring ${
              !desktopSidebarOpen ? 'md:justify-center md:px-3' : ''
            }`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${!desktopSidebarOpen ? 'opacity-0 md:opacity-0' : 'opacity-100'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 bg-card border-b border-border shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-muted text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="min-w-0 truncate text-lg sm:text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground">Administrator</p>
            <p className="text-xs text-muted-foreground">Full access</p>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 min-w-0 overflow-auto bg-background p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}