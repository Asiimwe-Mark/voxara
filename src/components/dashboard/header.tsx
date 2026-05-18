'use client'

import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import {
  LogOut,
  User,
  Settings,
  Coins,
  Crown,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'
import { useSidebar, SidebarTrigger } from '@/components/ui/sidebar'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'My Videos',
  '/dashboard/create': 'Create Video',
  '/dashboard/ai-studio': 'AI Studio',
  '/dashboard/seo': 'SEO Optimizer',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/marketplace': 'Template Marketplace',
  '/dashboard/team': 'Team',
  '/dashboard/billing': 'Billing & Subscription',
  '/dashboard/settings': 'Settings',
}

interface DashboardHeaderProps {
  user: { name: string; email: string; credits: number; plan: string; avatarUrl?: string | null }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const pageTitle = PAGE_TITLES[pathname] ?? 'Dashboard'

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  const planBadgeClass: Record<string, string> = {
    pro: 'bg-primary text-primary-foreground',
    agency: 'bg-violet-600 text-white dark:bg-violet-500',
  }

  const { setOpen } = useSidebar()

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-6 py-3 sm:py-4 shrink-0">
      {/* Mobile sidebar toggle */}
      <SidebarTrigger
        className="md:hidden h-9 w-9 sm:h-10 sm:w-10 rounded-lg transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      />

      {/* Page Title */}
      <h1 className="flex-1 min-w-0 text-base sm:text-lg font-semibold tracking-tight truncate">
        {pageTitle}
      </h1>

      {/* Right-side actions */}
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
        {/* Credits & Plan Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-muted/50 dark:bg-muted/30 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm border border-border/50">
          <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 dark:text-amber-400 shrink-0" />
          <span className="font-medium tabular-nums">{user.credits}</span>
          <span className="text-muted-foreground hidden sm:inline">credits</span>
          {user.plan !== 'free' && (
            <Badge
              variant="secondary"
              className={`ml-0.5 text-[10px] sm:text-xs px-1.5 py-0 h-5 rounded-full ${planBadgeClass[user.plan] ?? ''}`}
            >
              <Crown className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline capitalize">{user.plan}</span>
              <span className="sm:hidden">{user.plan[0].toUpperCase()}</span>
            </Badge>
          )}
        </div>

        {/* Upgrade button (free users) */}
        {user.plan === 'free' && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => router.push('/pricing')}
          >
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Upgrade</span>
            <span className="sm:hidden">Pro</span>
          </Button>
        )}

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0 transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Open user menu"
            >
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                <AvatarFallback className="text-xs sm:text-sm bg-primary text-primary-foreground font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
            <DropdownMenuLabel className="py-2.5 px-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground leading-none truncate">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Mobile credits (shown only in dropdown on small screens) */}
            <DropdownMenuItem
              className="sm:hidden py-2.5 px-3"
              onClick={() => router.push('/dashboard/billing')}
            >
              <Coins className="mr-2 h-4 w-4 text-amber-500 dark:text-amber-400" />
              <span className="tabular-nums">{user.credits} credits</span>
            </DropdownMenuItem>

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings')}
                className="py-2.5 px-3 cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings')}
                className="py-2.5 px-3 cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="py-2.5 px-3 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}