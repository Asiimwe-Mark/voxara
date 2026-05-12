'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// ── Context ──────────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_ICON = '3.5rem'

interface SidebarContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  collapsed: boolean
  setCollapsed: (c: boolean) => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>')
  return ctx
}

// ── Provider ─────────────────────────────────────────────────────────────────

function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [collapsed, setCollapsed] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const sync = (matches: boolean) => {
      setIsMobile(matches)
      setOpen(matches ? false : defaultOpen)
      setCollapsed(false)
    }

    sync(mq.matches)
    const handler = (e: MediaQueryListEvent) => sync(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [defaultOpen])

  return (
    <SidebarContext.Provider
      value={{ open, setOpen, collapsed, setCollapsed, isMobile }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: 'icon' | 'offcanvas' | 'none'
}

function Sidebar({
  collapsible = 'none',
  className,
  children,
  ...props
}: SidebarProps) {
  const { open, collapsed, setOpen } = useSidebar()
  const isIconMode = collapsible === 'icon' && collapsed
  const isOffcanvas = collapsible === 'offcanvas'

  return (
    <>
      {isOffcanvas && open && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        data-collapsed={isIconMode}
        className={cn(
          'group/sidebar relative flex flex-col h-screen border-r bg-sidebar-background text-sidebar-foreground shadow-xl transition-all duration-300',
          isOffcanvas
            ? 'fixed inset-y-0 left-0 z-50 transform border-r bg-background shadow-2xl'
            : 'relative',
          isOffcanvas ? (open ? 'translate-x-0' : '-translate-x-full') : '',
          isIconMode ? 'w-14' : 'w-64',
          className
        )}
        style={{ width: isIconMode ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH }}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

const SidebarHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex items-center overflow-hidden', className)}
    {...props}
  />
)

const SidebarContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1 overflow-auto', className)} {...props} />
)

const SidebarFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-auto', className)} {...props} />
)

const SidebarGroup = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-2', className)} {...props} />
)

const SidebarGroupLabel = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { collapsed } = useSidebar()
  return (
    <div
      className={cn(
        'mb-1 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 transition-all overflow-hidden',
        collapsed ? 'opacity-0 h-0' : 'opacity-100',
        className
      )}
      {...props}
    />
  )
}

const SidebarGroupContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-0.5', className)} {...props} />
)

const SidebarMenu = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className={cn('flex flex-col gap-0.5', className)} {...props} />
)

const SidebarMenuItem = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) => (
  <li className={cn('list-none', className)} {...props} />
)

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ asChild, isActive, tooltip, className, children, ...props }, ref) => {
  const { collapsed } = useSidebar()
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      ref={ref}
      title={collapsed ? tooltip : undefined}
      data-active={isActive}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground',
        collapsed && 'justify-center px-2',
        className
      )}
      {...(props as any)}
    >
      {children}
    </Comp>
  )
})
SidebarMenuButton.displayName = 'SidebarMenuButton'

function SidebarRail({
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const { collapsed, setCollapsed } = useSidebar()
  return (
    <button
      className={cn(
        'absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm transition-transform hover:scale-105',
        className
      )}
      onClick={() => setCollapsed(!collapsed)}
      aria-label="Toggle sidebar"
      {...(props as any)}
    >
      <PanelLeft
        className={cn(
          'h-3 w-3 transition-transform',
          collapsed && 'rotate-180'
        )}
      />
    </button>
  )
}

// Trigger component for mobile
function SidebarTrigger({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', className)}
      onClick={() => setOpen(!open)}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
}
