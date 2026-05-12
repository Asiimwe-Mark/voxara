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
  PanelLeft,
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
import { useSidebar } from '@/components/ui/sidebar'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'My Videos',
  '/dashboard/create': 'Create Video',
  '/dashboard/ai-studio': 'AI Studio',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/marketplace': 'Template Marketplace',
  '/dashboard/team': 'Team',
  '/dashboard/billing': 'Billing & Subscription',
  '/dashboard/settings': 'Settings',
}

interface DashboardHeaderProps {
  user: { name: string; email: string; credits: number; plan: string }
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

  const planColors: Record<string, string> = {
    pro: 'bg-blue-500 text-white',
    agency: 'bg-purple-500 text-white',
  }

  const { isMobile, setOpen } = useSidebar()

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-background px-3 sm:px-6 py-3 sm:py-0 shrink-0 overflow-hidden">
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setOpen(true)}
        >
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Open sidebar</span>
        </Button>
      )}

      <h1 className="flex-1 min-w-0 text-base sm:text-lg font-semibold truncate">
        {pageTitle}
      </h1>

      <div className="flex flex-1 min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
        {/* Credits pill */}
        <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">
          <Coins className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-500 shrink-0" />
          <span className="font-medium tabular-nums hidden xs:inline">
            {user.credits}
          </span>
          <span className="xs:hidden">{user.credits}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            credits
          </span>
          {user.plan !== 'free' && (
            <Badge
              className={`ml-0.5 sm:ml-1 text-xs px-1 py-0 h-4 ${planColors[user.plan] ?? ''}`}
            >
              <Crown className="mr-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5" />
              <span className="hidden sm:inline">{user.plan}</span>
            </Badge>
          )}
        </div>

        {/* Upgrade button (free users) */}
        {user.plan === 'free' && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            onClick={() => router.push('/pricing')}
          >
            <Sparkles className="h-3 w-3 sm:mr-1.5" />
            <span className="hidden xs:inline">Upgrade</span>
          </Button>
        )}

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-8 sm:w-8"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full p-0"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground leading-none mt-1">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Mobile credits */}
            <DropdownMenuItem
              className="sm:hidden"
              onClick={() => router.push('/dashboard/billing')}
            >
              <Coins className="mr-2 h-4 w-4 text-yellow-500" />
              {user.credits} credits
            </DropdownMenuItem>

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings')}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
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
