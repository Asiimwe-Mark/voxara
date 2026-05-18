import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sign In – voxara',
  description: 'Access your voxara account',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-background">

      {/* ── Navbar ── */}
      <header className="absolute inset-x-0 top-0 z-10">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5"
          aria-label="Main navigation"
        >
          {/* Brand */}
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-lg px-1 py-0.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            aria-label="voxara home"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-background/80 shadow-sm backdrop-blur sm:h-8 sm:w-8">
              <Sparkles className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
            </span>
            <span className="text-base font-bold tracking-tight sm:text-lg">
              voxara
            </span>
          </Link>

          {/* Back-to-home link — useful on auth pages */}
          <Link
            href="/"
            className="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            ← Back to home
          </Link>
        </nav>
      </header>

      {/* ── Page content ── */}
      <main className="pt-[60px] sm:pt-[68px]">
        {children}
      </main>

    </div>
  )
}