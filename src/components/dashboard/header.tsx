'use client'

import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import {
  LogOut, User, Settings, Coins, Crown, CreditCard,
  Sparkles, Sun, Moon, Bell, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':             { title: 'My Videos',            subtitle: 'All your AI-generated content' },
  '/dashboard/create':      { title: 'Create Video',          subtitle: 'Generate a new AI video' },
  '/dashboard/ai-studio':   { title: 'AI Studio',             subtitle: 'Advanced AI tools' },
  '/dashboard/analytics':   { title: 'Analytics',             subtitle: 'Track performance across platforms' },
  '/dashboard/marketplace': { title: 'Template Marketplace',  subtitle: 'Buy & sell proven templates' },
  '/dashboard/team':        { title: 'Team',                  subtitle: 'Manage collaborators' },
  '/dashboard/billing':     { title: 'Billing',               subtitle: 'Manage your subscription & credits' },
  '/dashboard/settings':    { title: 'Settings',              subtitle: 'Account preferences' },
}

const PLAN_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pro:    { bg: 'bg-blue-500',   text: 'text-white', label: 'Pro' },
  agency: { bg: 'bg-violet-600', text: 'text-white', label: 'Agency' },
}

interface DashboardHeaderProps {
  user: { name: string; email: string; credits: number; plan: string }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

  const initials = user.name
    .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const page    = PAGE_TITLES[pathname] ?? { title: 'Dashboard', subtitle: '' }
  const planStyle = PLAN_STYLES[user.plan]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  const creditPct = Math.min(100, (user.credits / 30) * 100)

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-3 sm:px-6 shrink-0 gap-3">

      {/* Left: trigger + title */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors" />
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-600 truncate">
          <span>voxara</span>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{page.title}</span>
        </div>
        <h1 className="sm:hidden text-sm font-semibold truncate">{page.title}</h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto flex-shrink-0">

        {/* Credits pill with mini progress bar */}
        <button
          onClick={() => router.push('/dashboard/billing')}
          className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 px-3 py-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group"
        >
          <Coins className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold tabular-nums">{user.credits}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">credits</span>
          </div>
          {/* Mini credit bar */}
          <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full progress-shine transition-all duration-500"
              style={{ width: `${creditPct}%` }}
            />
          </div>
          {planStyle && (
            <span className={cn(
              'text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5',
              planStyle.bg, planStyle.text
            )}>
              <Crown className="w-2.5 h-2.5" />{planStyle.label}
            </span>
          )}
        </button>

        {/* Upgrade button for free users */}
        {user.plan === 'free' && (
          <Button
            size="sm"
            className="h-8 px-3 btn-shine bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 shadow-sm shadow-violet-500/20 text-xs font-medium hidden xs:flex"
            onClick={() => router.push('/pricing')}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Upgrade
          </Button>
        )}

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 hover:ring-2 hover:ring-violet-400/40 transition-all">
              <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-violet-600 to-blue-600 text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-60" align="end" sideOffset={8}>
            <DropdownMenuLabel>
              <div className="flex items-center gap-3 py-1">
                <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                  <AvatarFallback className="text-xs bg-gradient-to-br from-violet-600 to-blue-600 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-sm font-semibold leading-none truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-0.5 truncate">{user.email}</p>
                  {planStyle && (
                    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-1 w-fit flex items-center gap-0.5', planStyle.bg, planStyle.text)}>
                      <Crown className="w-2.5 h-2.5" />{planStyle.label}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Mobile credits row */}
            <DropdownMenuItem className="sm:hidden cursor-pointer" onClick={() => router.push('/dashboard/billing')}>
              <Coins className="mr-2 h-4 w-4 text-amber-500" />
              <span>{user.credits} credits remaining</span>
            </DropdownMenuItem>

            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard/settings')}>
                <User className="mr-2 h-4 w-4 text-slate-500" />Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4 text-slate-500" />Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard/billing')}>
                <CreditCard className="mr-2 h-4 w-4 text-slate-500" />Billing
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
