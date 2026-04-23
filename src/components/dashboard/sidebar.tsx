'use client'

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
  BarChart3,
  Zap,
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
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: Home },
  { title: 'Create Video', href: '/dashboard/create', icon: PlusCircle },
  { title: 'AI Studio', href: '/dashboard/ai-studio', icon: Sparkles },
  { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { title: 'Marketplace', href: '/dashboard/marketplace', icon: Store },
  { title: 'Team', href: '/dashboard/team', icon: Users },
  { title: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-3 h-16 flex-row items-center">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="truncate">
            <span className="text-sm font-bold tracking-tight">voxara</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground/70 px-3">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2.5 rounded-md transition-colors',
                          isActive && 'font-medium'
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-3 py-3">
        <p className="text-xs text-muted-foreground/60 text-center truncate">
          © {new Date().getFullYear()} voxara
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
