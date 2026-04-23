/**
 * Cookie Policy Page
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy - voxara',
  description: 'Cookie policy and preferences for voxara',
}

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose prose-lg">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Cookie Policy
          </h1>
          <p className="text-gray-600">Last updated: April 19, 2026</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            1. What are Cookies?
          </h2>
          <p className="text-gray-700 mb-4">
            Cookies are small text files stored on your device (computer,
            tablet, mobile phone) when you visit a website. They are widely used
            to enhance your browsing experience, analyze website traffic, and
            remember your preferences.
          </p>
          <p className="text-gray-700 mb-4">
            Similar technologies like web beacons, pixel tags, and local storage
            also serve similar purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            2. Types of Cookies We Use
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.1 Essential/Strictly Necessary Cookies
          </h3>
          <p className="text-gray-700 mb-4">
            These cookies are necessary for the website to function properly.
            They enable core functionalities such as:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>User authentication and login</li>
            <li>Session management</li>
            <li>Security and fraud prevention</li>
            <li>Compliance with legal obligations</li>
            <li>Remembering account preferences</li>
          </ul>
          <p className="text-gray-700 mb-4">
            <strong>Consent:</strong> Not required (legally exempt)
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.2 Performance/Analytics Cookies
          </h3>
          <p className="text-gray-700 mb-4">
            These cookies help us understand how you use the website:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Google Analytics - traffic analysis and user behavior</li>
            <li>Session recordings (for debugging with user consent)</li>
            <li>Page load times and performance metrics</li>
            <li>Error tracking and debugging</li>
            <li>Feature usage analytics</li>
          </ul>
          <p className="text-gray-700 mb-4">
            <strong>Consent:</strong> Required
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.3 Preference/Functionality Cookies
          </h3>
          <p className="text-gray-700 mb-4">
            These cookies remember your choices to provide personalized
            experiences:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Language and locale preferences</li>
            <li>Dark mode/light mode settings</li>
            <li>Layout and display preferences</li>
            <li>Notification preferences</li>
            <li>Previously viewed content</li>
          </ul>
          <p className="text-gray-700 mb-4">
            <strong>Consent:</strong> Required (though often implied by website
            use)
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.4 Marketing/Advertising Cookies
          </h3>
          <p className="text-gray-700 mb-4">
            These cookies track your online behavior for advertising purposes:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Facebook Pixel - for retargeting on Facebook</li>
            <li>Google Ads - for search and display advertising</li>
            <li>Third-party advertising networks</li>
            <li>Conversion tracking</li>
            <li>Behavioral targeting</li>
          </ul>
          <p className="text-gray-700 mb-4">
            <strong>Consent:</strong> Explicit consent required
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            3. Cookies and Similar Technologies
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.1 Web Beacons
          </h3>
          <p className="text-gray-700 mb-4">
            Tiny images embedded in web pages that track when a page is visited
            or an email is opened. Often used in marketing emails to track opens
            and clicks.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.2 Pixel Tags
          </h3>
          <p className="text-gray-700 mb-4">
            Similar to web beacons, used to track user interactions and
            conversions.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.3 Local Storage
          </h3>
          <p className="text-gray-700 mb-4">
            Browser storage that allows websites to store data locally on your
            device. More persistent than cookies.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.4 Session Storage
          </h3>
          <p className="text-gray-700 mb-4">
            Temporary storage that is cleared when you close your browser.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            4. Third-Party Cookies
          </h2>
          <p className="text-gray-700 mb-4">
            We use third-party services that may set their own cookies:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Google Analytics:</strong> Website traffic and user
              behavior analysis
            </li>
            <li>
              <strong>Stripe:</strong> Payment processing
            </li>
            <li>
              <strong>Facebook:</strong> Social login and advertising
            </li>
            <li>
              <strong>Google Ads:</strong> Search and display advertising
            </li>
            <li>
              <strong>Sentry:</strong> Error tracking and monitoring
            </li>
            <li>
              <strong>Intercom:</strong> Customer support chat
            </li>
          </ul>
          <p className="text-gray-700 mb-4">
            These third parties have their own privacy policies and we encourage
            you to review them.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            5. Cookie Duration
          </h2>
          <p className="text-gray-700 mb-4">
            Cookies have different lifespans:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Session Cookies:</strong> Deleted when you close your
              browser
            </li>
            <li>
              <strong>Persistent Cookies:</strong> Remain on your device for a
              set period (days, months, years)
            </li>
          </ul>
          <p className="text-gray-700 mb-4">
            Most of our cookies expire within 30 days, though some may persist
            longer to remember your preferences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            6. Managing Cookies
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6.1 Browser Settings
          </h3>
          <p className="text-gray-700 mb-4">
            You can control cookies through your browser settings:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Chrome:</strong> Settings → Privacy and security → Cookies
              and other site data
            </li>
            <li>
              <strong>Firefox:</strong> Preferences → Privacy & Security →
              Cookies and Site Data
            </li>
            <li>
              <strong>Safari:</strong> Preferences → Privacy → Manage Website
              Data
            </li>
            <li>
              <strong>Edge:</strong> Settings → Privacy, search, and services →
              Clear browsing data
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6.2 Cookie Preference Center
          </h3>
          <p className="text-gray-700 mb-4">
            We provide a cookie preference center where you can manage your
            consent settings. You can:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Accept all cookies</li>
            <li>Reject all non-essential cookies</li>
            <li>Customize your preferences</li>
            <li>Update preferences at any time</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6.3 Opt-Out Tools
          </h3>
          <p className="text-gray-700 mb-4">
            You can opt out of third-party tracking:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Google Analytics Opt-out:</strong> Browser extension
              available
            </li>
            <li>
              <strong>Digital Advertising Alliance (DAA):</strong>{' '}
              www.aboutads.info
            </li>
            <li>
              <strong>Network Advertising Initiative (NAI):</strong>{' '}
              www.networkadvertising.org
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6.4 Do Not Track (DNT)
          </h3>
          <p className="text-gray-700 mb-4">
            Some browsers have a "Do Not Track" feature. While we respect these
            signals, not all third parties honor DNT requests.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            7. Impact of Disabling Cookies
          </h2>
          <p className="text-gray-700 mb-4">
            If you disable cookies, you may experience:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Inability to log in to your account</li>
            <li>Loss of personalization</li>
            <li>Inability to use certain features</li>
            <li>Need to re-enter information repeatedly</li>
            <li>Reduced website functionality</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Essential cookies cannot be disabled as they are necessary for the
            Service to function.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            8. GDPR and ePrivacy Compliance
          </h2>
          <p className="text-gray-700 mb-4">
            We comply with GDPR and ePrivacy regulations by:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              Obtaining explicit consent before setting non-essential cookies
            </li>
            <li>Providing clear information about cookies in use</li>
            <li>Allowing easy cookie management and opt-out</li>
            <li>Honoring "Do Not Track" requests where possible</li>
            <li>Ensuring transparent privacy practices</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            9. Updates to This Policy
          </h2>
          <p className="text-gray-700 mb-4">
            We may update this Cookie Policy periodically. We will notify you of
            significant changes by posting the updated policy and updating the
            "Last updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            10. Contact Us
          </h2>
          <p className="text-gray-700 mb-4">
            If you have questions about our cookie practices, please contact us:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">Email: privacy@voxara.app</p>
            <p className="text-gray-700">Support: support@voxara.app</p>
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
