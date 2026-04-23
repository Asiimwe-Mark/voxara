/**
 * Legal Index Page - Overview of all policies
 */

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Legal Documentation - voxara',
  description:
    'Complete legal documentation, policies, and agreements for voxara',
}

export default function LegalIndex() {
  const policyCategories = [
    {
      title: 'Service Terms',
      description: 'Fundamental rules governing your use of voxara',
      policies: [
        {
          name: 'Terms of Service',
          href: '/legal/terms',
          description: 'Complete terms of service and conditions of use',
          icon: '📋',
        },
      ],
    },
    {
      title: 'Privacy & Data Protection',
      description: 'How we handle your data and protect your privacy',
      policies: [
        {
          name: 'Privacy Policy',
          href: '/legal/privacy',
          description:
            'Comprehensive privacy policy and data handling practices',
          icon: '🔒',
        },
        {
          name: 'Data Processing Agreement',
          href: '/legal/dpa',
          description: 'GDPR-compliant data processing agreement',
          icon: '📜',
        },
        {
          name: 'Cookie Policy',
          href: '/legal/cookies',
          description: 'Information about cookies and tracking technologies',
          icon: '🍪',
        },
      ],
    },
    {
      title: 'Usage & Conduct',
      description: 'Rules for appropriate use of the platform',
      policies: [
        {
          name: 'Acceptable Use Policy',
          href: '/legal/aup',
          description: 'Prohibited content and conduct on voxara',
          icon: '⚠️',
        },
      ],
    },
    {
      title: 'Billing & Support',
      description: 'Refunds, support levels, and service guarantees',
      policies: [
        {
          name: 'Refund & Cancellation Policy',
          href: '/legal/refunds',
          description:
            'Refund policy, subscription management, and billing terms',
          icon: '💰',
        },
        {
          name: 'SLA & Support Policy',
          href: '/legal/sla',
          description: 'Service level agreements and support response times',
          icon: '🆘',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 rounded-xl mb-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Legal Documentation
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Welcome to voxara's legal and policy documentation. Here you'll find
            comprehensive information about our terms of service, privacy
            practices, data protection measures, and support commitments.
          </p>
          <p className="text-gray-600">
            All policies are effective as of April 19, 2026. We regularly update
            these documents to reflect changes in our service and applicable
            laws.
          </p>
        </div>
      </section>

      {/* Policy Categories Grid */}
      <div className="space-y-12">
        {policyCategories.map((category) => (
          <section key={category.title}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {category.title}
              </h2>
              <p className="text-gray-600">{category.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.policies.map((policy) => (
                <Link
                  key={policy.href}
                  href={policy.href}
                  className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform">
                      {policy.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {policy.name}
                      </h3>
                      <p className="text-gray-600 text-sm mt-2">
                        {policy.description}
                      </p>
                      <div className="mt-4 inline-flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 gap-1 transition-all">
                        Read Policy <span>→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Key Information Section */}
      <section className="mt-16 pt-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Key Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>🛡️</span> Data Protection
            </h3>
            <p className="text-gray-700 text-sm">
              We comply with GDPR, CCPA, and other data protection regulations
              to safeguard your personal information.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>⚡</span> Security First
            </h3>
            <p className="text-gray-700 text-sm">
              End-to-end encryption, secure authentication, and regular security
              audits protect your account and data.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>💬</span> Ethical AI Use
            </h3>
            <p className="text-gray-700 text-sm">
              We provide guidelines for responsible and ethical use of
              AI-generated deepfake technology.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-12 pt-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <details className="group bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow">
            <summary className="flex items-center justify-between font-semibold text-gray-900">
              <span>What personal information do you collect?</span>
              <span className="group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <p className="mt-4 text-gray-700">
              We collect information you provide (name, email, billing details),
              usage data (videos created, features used), and technical data (IP
              address, browser info). See our Privacy Policy for complete
              details.
            </p>
          </details>

          <details className="group bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow">
            <summary className="flex items-center justify-between font-semibold text-gray-900">
              <span>How do you protect my data?</span>
              <span className="group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <p className="mt-4 text-gray-700">
              We use industry-standard encryption (TLS/SSL in transit, AES-256
              at rest), secure authentication, regular security audits, and
              role-based access controls. Read our Security Policy for more
              information.
            </p>
          </details>

          <details className="group bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow">
            <summary className="flex items-center justify-between font-semibold text-gray-900">
              <span>Can I get a refund?</span>
              <span className="group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <p className="mt-4 text-gray-700">
              Yes! We offer a 14-day money-back guarantee on first purchases if
              you're not satisfied. After that, we only refund for duplicate
              charges, unauthorized charges, or service failures. See our Refund
              Policy for details.
            </p>
          </details>

          <details className="group bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow">
            <summary className="flex items-center justify-between font-semibold text-gray-900">
              <span>What are my rights regarding my data?</span>
              <span className="group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <p className="mt-4 text-gray-700">
              You have the right to access, correct, delete, and port your data.
              EU residents have additional rights under GDPR including the right
              to object to processing and withdraw consent. Contact us at
              privacy@voxara.app to exercise your rights.
            </p>
          </details>

          <details className="group bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow">
            <summary className="flex items-center justify-between font-semibold text-gray-900">
              <span>What about ethical use of deepfakes?</span>
              <span className="group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <p className="mt-4 text-gray-700">
              We require disclosure when content is AI-generated, prohibit
              non-consensual deepfakes, and don't allow impersonation for fraud.
              See our Acceptable Use Policy for comprehensive guidelines on
              responsible use.
            </p>
          </details>
        </div>
      </section>

      {/* Contact Section */}
      <section className="mt-16 pt-12 border-t border-gray-200 bg-linear-to-br from-gray-50 to-gray-100 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Still Have Questions?
        </h2>
        <p className="text-gray-700 mb-6">
          If you can't find the information you need in our policies, we're here
          to help. Reach out to our support team:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">
              General Support
            </h3>
            <a
              href="mailto:support@voxara.app"
              className="text-blue-600 hover:text-blue-700 break-all"
            >
              support@voxara.app
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Privacy & Data</h3>
            <a
              href="mailto:privacy@voxara.app"
              className="text-blue-600 hover:text-blue-700 break-all"
            >
              privacy@voxara.app
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Billing</h3>
            <a
              href="mailto:billing@voxara.app"
              className="text-blue-600 hover:text-blue-700 break-all"
            >
              billing@voxara.app
            </a>
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
        <p>Last updated: April 19, 2026</p>
        <p className="mt-2">© 2026 voxara Inc. All rights reserved.</p>
      </section>
    </div>
  )
}
