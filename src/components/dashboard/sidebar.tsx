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
  X,
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
  { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { title: 'Marketplace', href: '/dashboard/marketplace', icon: Store },
  { title: 'Team', href: '/dashboard/team', icon: Users },
  { title: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpen } = useSidebar()

  return (
    <Sidebar collapsible={isMobile ? 'offcanvas' : 'icon'} className="border-r">
      <SidebarHeader className="border-b px-3 h-16 flex items-center justify-between gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="truncate">
            <span className="text-sm font-bold tracking-tight">voxara</span>
          </div>
        </Link>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
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
                        onClick={() => isMobile && setOpen(false)}
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
        <div className="flex flex-col gap-2 text-xs text-muted-foreground/70">
          <p className="text-center truncate">
            © {new Date().getFullYear()} voxara
          </p>
          {!isMobile && (
            <p className="text-center text-[11px] leading-none">
              Designed for high-performance teams.
            </p>
          )}
        </div>
      </SidebarFooter>
      {!isMobile && <SidebarRail />}
    </Sidebar>
  )
}
