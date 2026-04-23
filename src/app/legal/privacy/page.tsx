/**
 * Privacy Policy Page
 * Comprehensive privacy and data protection policy
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - voxara',
  description: 'Privacy policy and data protection practices of voxara',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose prose-lg">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-600">Last updated: April 19, 2026</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            1. Introduction
          </h2>
          <p className="text-gray-700 mb-4">
            voxara ("we," "us," "our," or "Company") is committed to protecting
            your privacy. This Privacy Policy explains how we collect, use,
            disclose, and otherwise process your personal information in
            connection with our websites, mobile applications, and services
            (collectively, the "Service").
          </p>
          <p className="text-gray-700 mb-4">
            Please read this Privacy Policy carefully. If you do not agree with
            our privacy practices, please do not use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            2. Information We Collect
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.1 Information You Provide
          </h3>
          <p className="text-gray-700 mb-4">
            We collect information you provide directly to us, such as when you:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Create an account or sign up for our Service</li>
            <li>Make a purchase or payment</li>
            <li>Fill out forms or surveys</li>
            <li>Communicate with us via email, chat, or support channels</li>
            <li>Upload content to our platform</li>
            <li>Participate in promotions or contests</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.2 Account Information
          </h3>
          <p className="text-gray-700 mb-4">
            When you create an account, we collect:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Name and email address</li>
            <li>Phone number (optional)</li>
            <li>Password (securely hashed)</li>
            <li>Profile information and preferences</li>
            <li>Billing and payment information</li>
            <li>Subscription status and history</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.3 Automatically Collected Information
          </h3>
          <p className="text-gray-700 mb-4">
            We automatically collect certain information about your device and
            how you use our Service:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>IP address and device identifiers</li>
            <li>Browser type, version, and language</li>
            <li>Operating system</li>
            <li>Pages visited and actions taken</li>
            <li>Referral source and exit pages</li>
            <li>Timestamps and duration of visits</li>
            <li>Cookies and similar tracking technologies</li>
            <li>Location information (if permitted)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.4 Content Data
          </h3>
          <p className="text-gray-700 mb-4">
            We collect and store the content you create using our Service,
            including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Video scripts and generated content</li>
            <li>Avatar configurations and voice settings</li>
            <li>Video metadata and editing history</li>
            <li>Publishing information and distribution channels</li>
            <li>Analytics and performance metrics of your videos</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.5 Third-Party Information
          </h3>
          <p className="text-gray-700 mb-4">
            We may receive information about you from third parties, such as
            social media platforms when you connect your account, payment
            processors, and analytics providers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            3. How We Use Your Information
          </h2>
          <p className="text-gray-700 mb-4">
            We use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Providing and maintaining the Service</li>
            <li>Processing transactions and sending related information</li>
            <li>Sending promotional communications (with your consent)</li>
            <li>Responding to your inquiries and customer support requests</li>
            <li>Monitoring and analyzing usage patterns and trends</li>
            <li>Improving and personalizing your experience</li>
            <li>
              Detecting, preventing, and addressing technical or security issues
            </li>
            <li>Detecting and preventing fraud and abuse</li>
            <li>Enforcing our Terms of Service and other agreements</li>
            <li>Complying with legal obligations</li>
            <li>Creating anonymized or aggregated data for analytics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            4. Information Sharing
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4.1 Service Providers
          </h3>
          <p className="text-gray-700 mb-4">
            We share information with service providers who assist us in
            operating our website and providing the Service, including payment
            processors, cloud storage providers, analytics services, and
            customer support platforms.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4.2 Legal Requirements
          </h3>
          <p className="text-gray-700 mb-4">
            We may disclose your information if required by law or when we
            believe in good faith that such disclosure is necessary to comply
            with a legal obligation, enforce our agreements, or protect the
            safety of our users or the public.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4.3 Business Transfers
          </h3>
          <p className="text-gray-700 mb-4">
            If voxara is involved in a merger, acquisition, bankruptcy, or other
            business transaction, your information may be transferred as part of
            that transaction. We will provide notice if your information becomes
            subject to a different privacy policy.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4.4 Consent
          </h3>
          <p className="text-gray-700 mb-4">
            We may share your information with third parties when you provide
            your consent to do so.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4.5 No Sale of Data
          </h3>
          <p className="text-gray-700 mb-4">
            We do not sell, rent, or share your personal information with third
            parties for their direct marketing purposes without your explicit
            consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            5. Data Security
          </h2>
          <p className="text-gray-700 mb-4">
            We implement comprehensive technical, administrative, and physical
            security measures to protect your information from unauthorized
            access, alteration, and destruction, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Encryption of data in transit (TLS/SSL)</li>
            <li>Encryption of data at rest</li>
            <li>Secure password hashing with industry-standard algorithms</li>
            <li>Regular security audits and penetration testing</li>
            <li>Access controls and role-based permissions</li>
            <li>Secure data centers with physical security measures</li>
            <li>Employee training and confidentiality agreements</li>
            <li>Incident response and breach notification procedures</li>
          </ul>
          <p className="text-gray-700 mb-4">
            However, no security system is impenetrable. We cannot guarantee
            absolute security of your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            6. Data Retention
          </h2>
          <p className="text-gray-700 mb-4">
            We retain your personal information for as long as necessary to
            provide the Service and fulfill the purposes outlined in this
            Privacy Policy. Retention periods vary depending on the type of
            information and the purposes for which we use it.
          </p>
          <p className="text-gray-700 mb-4">
            When you delete your account, we will remove your personal
            information within 30 days, except where we are required to retain
            it for legal or regulatory reasons.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            7. Your Privacy Rights
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            7.1 Access and Portability
          </h3>
          <p className="text-gray-700 mb-4">
            You have the right to access your personal information and request a
            copy of it in a portable format.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            7.2 Correction
          </h3>
          <p className="text-gray-700 mb-4">
            You may request that we correct inaccurate or incomplete information
            about you.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            7.3 Deletion
          </h3>
          <p className="text-gray-700 mb-4">
            You have the right to request deletion of your personal information,
            subject to certain legal exceptions.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            7.4 Opt-Out
          </h3>
          <p className="text-gray-700 mb-4">
            You may opt out of receiving promotional communications by clicking
            the unsubscribe link in any email or by adjusting your notification
            preferences in your account settings.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            7.5 GDPR Rights (EU Residents)
          </h3>
          <p className="text-gray-700 mb-4">
            If you are a resident of the European Union, you have the following
            rights under GDPR:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Right to access your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Right to withdraw consent at any time</li>
            <li>Right to file a complaint with a data protection authority</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            7.6 CCPA Rights (California Residents)
          </h3>
          <p className="text-gray-700 mb-4">
            If you are a California resident, you have the following rights
            under CCPA:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Right to know what personal information is collected</li>
            <li>
              Right to know whether personal information is sold or disclosed
            </li>
            <li>Right to opt out of the sale of personal information</li>
            <li>Right to delete personal information collected from you</li>
            <li>Right to non-discrimination for exercising CCPA rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            8. Cookies and Tracking Technologies
          </h2>
          <p className="text-gray-700 mb-4">
            We use cookies, web beacons, and similar tracking technologies to
            enhance your experience and analyze usage. These include:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Essential Cookies:</strong> Necessary for authentication
              and security
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Help us understand how you use
              our Service
            </li>
            <li>
              <strong>Preference Cookies:</strong> Remember your preferences and
              settings
            </li>
            <li>
              <strong>Marketing Cookies:</strong> Used for retargeting and
              personalized advertising
            </li>
          </ul>
          <p className="text-gray-700 mb-4">
            You can control cookies through your browser settings or our cookie
            preference center.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            9. Third-Party Links
          </h2>
          <p className="text-gray-700 mb-4">
            Our Service may contain links to third-party websites and services.
            We are not responsible for their privacy practices. Please review
            their privacy policies before providing your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            10. Children's Privacy
          </h2>
          <p className="text-gray-700 mb-4">
            Our Service is not directed to children under 13. We do not
            knowingly collect personal information from children under 13. If we
            become aware that we have collected information from a child under
            13, we will delete it promptly. If you believe we have collected
            information from a child under 13, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            11. International Data Transfers
          </h2>
          <p className="text-gray-700 mb-4">
            Your information may be transferred to, processed in, and stored in
            countries other than your country of residence. These countries may
            have different data protection laws than your home country. By using
            the Service, you consent to the transfer of your information to
            countries outside your country of residence.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            12. Updates to This Policy
          </h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time. We will notify
            you of significant changes by posting the updated policy and
            updating the "Last updated" date. Your continued use of the Service
            following the posting of changes means that you accept those
            changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            13. Contact Us
          </h2>
          <p className="text-gray-700 mb-4">
            If you have questions about this Privacy Policy or our privacy
            practices, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <strong>voxara Inc.</strong>
            </p>
            <p className="text-gray-700">Email: privacy@voxara.app</p>
            <p className="text-gray-700">Support: support@voxara.app</p>
            <p className="text-gray-700">
              Data Protection Officer: dpo@voxara.app
            </p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            © 2026 voxara Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
