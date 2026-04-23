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
    { href: '/legal/terms', label: 'Terms of Service', icon: '📋' },
    { href: '/legal/privacy', label: 'Privacy Policy', icon: '🔒' },
    { href: '/legal/aup', label: 'Acceptable Use Policy', icon: '⚠️' },
    { href: '/legal/cookies', label: 'Cookie Policy', icon: '🍪' },
    { href: '/legal/refunds', label: 'Refund Policy', icon: '💰' },
    { href: '/legal/dpa', label: 'Data Processing Agreement', icon: '📜' },
    { href: '/legal/sla', label: 'SLA & Support', icon: '🆘' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900">Legal & Policies</h1>
          <p className="text-gray-600 mt-2">
            Find all the information you need about voxara's policies and legal
            documentation
          </p>
        </div>
      </div>

      {/* Navigation and Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Policies & Agreements
              </h2>
              <nav className="space-y-2">
                {legalPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                      pathname === page.href
                        ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <span className="mr-2">{page.icon}</span>
                    {page.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Need Help?
              </h3>
              <div className="space-y-3">
                <a
                  href="mailto:support@voxara.app"
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  <span className="mr-2">📧</span> Contact Support
                </a>
                <a
                  href="mailto:privacy@voxara.app"
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  <span className="mr-2">🔐</span> Privacy Questions
                </a>
                <a
                  href="mailto:billing@voxara.app"
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  <span className="mr-2">💳</span> Billing Help
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Policy Categories
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/legal/terms" className="hover:text-blue-600">
                    Service Terms
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="hover:text-blue-600">
                    Privacy & Data
                  </Link>
                </li>
                <li>
                  <Link href="/legal/aup" className="hover:text-blue-600">
                    Usage Policies
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Support & Legal
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/legal/sla" className="hover:text-blue-600">
                    Support & SLA
                  </Link>
                </li>
                <li>
                  <Link href="/legal/refunds" className="hover:text-blue-600">
                    Refunds & Billing
                  </Link>
                </li>
                <li>
                  <Link href="/legal/dpa" className="hover:text-blue-600">
                    Data Agreements
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>support@voxara.app</li>
                <li>privacy@voxara.app</li>
                <li>billing@voxara.app</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-600">
              © 2026 voxara Inc. All rights reserved. | Last updated: April 19,
              2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
