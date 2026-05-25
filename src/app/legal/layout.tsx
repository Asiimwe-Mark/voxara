/**
 * Legal Section Layout
 * Provides navigation structure for all legal and policy pages
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const legalPages = [
    { href: '/legal/terms', label: 'Terms of Service' },
    { href: '/legal/privacy', label: 'Privacy Policy' },
    { href: '/legal/aup', label: 'Acceptable Use Policy' },
    { href: '/legal/cookies', label: 'Cookie Policy' },
    { href: '/legal/refunds', label: 'Refund Policy' },
    { href: '/legal/dpa', label: 'Data Processing Agreement' },
    { href: '/legal/sla', label: 'SLA & Support' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Legal & Policies</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Find all the information you need about Voxara&apos;s policies and legal documentation
          </p>
        </div>
      </div>

      {/* Navigation and Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="card-premium p-5 sm:p-6 sticky top-6">
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4 tracking-tight">
                Policies & Agreements
              </h2>
              <nav className="space-y-1.5">
                {legalPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className={`block px-3 py-2.5 rounded-lg text-sm transition-smooth ${
                      pathname === page.href
                        ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent'
                    }`}
                  >
                    {page.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Quick Links */}
            <div className="card-premium p-5 sm:p-6 mt-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 tracking-tight">
                Need Help?
              </h3>
              <div className="space-y-3">
                <a
                  href="mailto:support@voxara.app"
                  className="flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="mailto:privacy@voxara.app"
                  className="flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Privacy Questions
                </a>
                <a
                  href="mailto:billing@voxara.app"
                  className="flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Billing Help
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12 sm:mt-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-sm tracking-tight">
                Policy Categories
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/legal/terms" className="hover:text-primary transition-colors">
                    Service Terms
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="hover:text-primary transition-colors">
                    Privacy & Data
                  </Link>
                </li>
                <li>
                  <Link href="/legal/aup" className="hover:text-primary transition-colors">
                    Usage Policies
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-sm tracking-tight">
                Support & Legal
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/legal/sla" className="hover:text-primary transition-colors">
                    Support & SLA
                  </Link>
                </li>
                <li>
                  <Link href="/legal/refunds" className="hover:text-primary transition-colors">
                    Refunds & Billing
                  </Link>
                </li>
                <li>
                  <Link href="/legal/dpa" className="hover:text-primary transition-colors">
                    Data Agreements
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-sm tracking-tight">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>support@voxara.app</li>
                <li>privacy@voxara.app</li>
                <li>billing@voxara.app</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 sm:pt-8">
            <p className="text-xs sm:text-sm text-muted-foreground">
              &copy; 2026 Voxara Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
