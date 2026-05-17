'use client'

/**
 * Admin Dashboard Layout
 * Uses the parent dashboard sidebar/header.
 * Only provides admin access gating.
 */

import React from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
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
        if (data.isAdmin) {
          setIsAdmin(true)
        } else {
          router.push('/dashboard')
        }
      } catch {
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm text-muted-foreground">Verifying admin access...</span>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive mb-3" />
          <p className="text-sm text-muted-foreground">Access denied. Admin privileges required.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
