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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5">
        <Link 
          href="/" 
          className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-md px-1 py-0.5 transition-colors"
          aria-label="voxara home"
        >
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="font-bold text-lg sm:text-xl">voxara</span>
        </Link>
      </nav>
      {children}
    </div>
  )
}