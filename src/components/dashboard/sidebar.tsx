'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, PlusCircle, Settings, Sparkles, Store,
  CreditCard, Users, BarChart3, Zap,
} from 'lucide-react'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Dashboard',   href: '/dashboard',             icon: Home },
  { title: 'Create Video',href: '/dashboard/create',      icon: PlusCircle },
  { title: 'AI Studio',   href: '/dashboard/ai-studio',   icon: Sparkles },
  { title: 'Analytics',   href: '/dashboard/analytics',   icon: BarChart3 },
  { title: 'Marketplace', href: '/dashboard/marketplace', icon: Store },
  { title: 'Team',        href: '/dashboard/team',        icon: Users },
  { title: 'Billing',     href: '/dashboard/billing',     icon: CreditCard },
  { title: 'Settings',    href: '/dashboard/settings',    icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200/70 dark:border-slate-800/70 sidebar-glow"
    >
      {/* ── Logo ──────────────────────────────────────────── */}
      <SidebarHeader className="border-b border-slate-200/70 dark:border-slate-800/70 px-3 h-16 flex-row items-center">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow duration-200">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight truncate">voxara</span>
        </Link>
      </SidebarHeader>

      {/* ── Nav items ─────────────────────────────────────── */}
      <SidebarContent className="py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 px-3 mb-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        'rounded-lg h-9 transition-all duration-150',
                        isActive
                          ? 'bg-gradient-to-r from-violet-600/10 to-blue-600/10 text-violet-700 dark:text-violet-300 font-medium border border-violet-200/60 dark:border-violet-800/60'
                          : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-2.5">
                        <item.icon className={cn(
                          'h-4 w-4 flex-shrink-0 transition-colors',
                          isActive ? 'text-violet-600 dark:text-violet-400' : ''
                        )} />
                        <span className="text-sm">{item.title}</span>
                        {/* Active indicator dot */}
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400 flex-shrink-0" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ────────────────────────────────────────── */}
      <SidebarFooter className="border-t border-slate-200/70 dark:border-slate-800/70 px-3 py-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <p className="text-[10px] text-slate-400 dark:text-slate-600 truncate">
            All systems operational
          </p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
