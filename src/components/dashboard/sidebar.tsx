'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  PlusCircle,
  Settings,
  Sparkles,
  Store,
  CreditCard,
  Users,
  ShieldCheck,
  X,
  BarChart3,
  Search,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: Home },
  { title: 'Create Video', href: '/dashboard/create', icon: PlusCircle },
  { title: 'AI Studio', href: '/dashboard/ai-studio', icon: Sparkles },
  { title: 'SEO', href: '/dashboard/seo', icon: Search },
  { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { title: 'Marketplace', href: '/dashboard/marketplace', icon: Store },
  { title: 'Team', href: '/dashboard/team', icon: Users },
  { title: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()
  const { setOpen, isMobile, collapsed } = useSidebar()

  useEffect(() => {
    let cancelled = false

    fetch('/api/admin/check-access')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled) {
          setIsAdmin(Boolean(data?.isAdmin))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAdmin(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const visibleNavItems = isAdmin
    ? [
        ...navItems,
        { title: 'Admin', href: '/dashboard/admin', icon: ShieldCheck },
      ]
    : navItems

  return (
    <Sidebar
      collapsible={isMobile ? 'offcanvas' : 'icon'}
      className={cn(
        'border-r border-white/[0.06] m-3 rounded-xl overflow-hidden',
        'bg-[hsl(240_12%_7%)] text-[hsl(240_10%_80%)]'
      )}
    >
      {/* Header with V monogram logo */}
      <SidebarHeader className="border-b border-white/[0.06] px-3 mr-2 h-16 flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring rounded-md px-1 py-0.5 transition-colors"
          onClick={() => isMobile && setOpen(false)}
          aria-label="voxara dashboard home"
        >
          {/* V monogram with gradient border */}
          <div className="relative h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 opacity-20" />
            <div className="absolute inset-[1.5px] rounded-[5px] bg-[hsl(240_12%_7%)]" />
            <span className="relative font-display text-sm font-bold italic text-sidebar-foreground">
              V
            </span>
          </div>
          <div className="truncate">
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              voxara
            </span>
          </div>
        </Link>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-sidebar-foreground hover:bg-white/5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="group"
                    >
                      <Link
                        href={item.href}
                        onClick={() => isMobile && setOpen(false)}
                        className={cn(
                          'relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring',
                          isActive
                            ? 'bg-white/[0.08] text-white font-medium border-l-2 border-primary'
                            : 'hover:bg-white/[0.05] hover:text-white/90 border-l-2 border-transparent'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-4 w-4 flex-shrink-0 transition-colors duration-200',
                            isActive
                              ? 'text-primary'
                              : 'text-white/50 group-hover:text-white/70'
                          )}
                        />
                        {/* Collapsed glow indicator for active item */}
                        {collapsed && isActive && !isMobile && (
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                        )}
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/[0.06] px-3 py-3">
        <div className="flex flex-col gap-1.5 text-[11px] text-white/40">
          <p className="text-center truncate">
            &copy; {new Date().getFullYear()} voxara
          </p>
          {!isMobile && !collapsed && (
            <p className="text-center text-[10px] leading-none text-white/25">
              Designed for high-performance teams.
            </p>
          )}
        </div>
      </SidebarFooter>

      {!isMobile && <SidebarRail />}
    </Sidebar>
  )
}
