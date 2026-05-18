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
  Zap,
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
  SidebarGroupLabel,
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
  const { setOpen, isMobile } = useSidebar()

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
      className="border-r border-sidebar-border m-3 bg-sidebar-background"
    >
      <SidebarHeader className="border-b border-sidebar-border px-3 mr-2 h-16 flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring rounded-md px-1 py-0.5 transition-colors"
          onClick={() => isMobile && setOpen(false)}
          aria-label="voxara dashboard home"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-destructive flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/20">
            <Zap className="h-4 w-4  text-primary-foreground" />
          </div>
          <div className="truncate">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              voxara
            </span>
          </div>
        </Link>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] text-sidebar-foreground/60 px-3 py-2 font-medium uppercase tracking-wider">
            Menu
          </SidebarGroupLabel>
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
                          'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-4 w-4 flex-shrink-0 transition-colors',
                            isActive
                              ? 'text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground'
                          )}
                        />
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

      <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
        <div className="flex flex-col gap-1.5 text-[11px] text-sidebar-foreground/60">
          <p className="text-center truncate">
            © {new Date().getFullYear()} voxara
          </p>
          {!isMobile && (
            <p className="text-center text-[10px] leading-none text-sidebar-foreground/40">
              Designed for high-performance teams.
            </p>
          )}
        </div>
      </SidebarFooter>

      {!isMobile && <SidebarRail />}
    </Sidebar>
  )
}
