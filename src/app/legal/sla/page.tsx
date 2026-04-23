/**
 * Service Level Agreement & Support Policy Page
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SLA & Support Policy - voxara',
  description: 'Service Level Agreement and support policy for voxara',
}

export default function SLAPolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose prose-lg">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Service Level Agreement & Support Policy
          </h1>
          <p className="text-gray-600">Last updated: April 19, 2026</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            1. Overview
          </h2>
          <p className="text-gray-700 mb-4">
            This Service Level Agreement ("SLA") describes the service
            commitments and support levels that voxara provides to customers.
            Our goal is to maintain high reliability and provide responsive
            support.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            2. Service Uptime Commitment
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.1 Uptime Guarantee
          </h3>
          <p className="text-gray-700 mb-4">
            voxara commits to maintaining the following uptime levels:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Free Plan:</strong> Best-effort support, no uptime SLA
            </li>
            <li>
              <strong>Pro Plan:</strong> 99.0% monthly uptime
            </li>
            <li>
              <strong>Agency Plan:</strong> 99.5% monthly uptime
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.2 Measurement
          </h3>
          <p className="text-gray-700 mb-4">
            Uptime is measured monthly. Excluded from uptime calculations:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              Scheduled maintenance windows (announced 48 hours in advance)
            </li>
            <li>
              Outages caused by factors outside our control (ISP failures, DDoS
              attacks)
            </li>
            <li>
              Outages caused by customer-side issues (network, device,
              configuration)
            </li>
            <li>Outages during force majeure events</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.3 Service Credits
          </h3>
          <p className="text-gray-700 mb-4">
            If we fail to meet the uptime commitment, you are entitled to
            service credits:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">
                    Uptime Range
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Service Credit
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    99.0% - 98.5%
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    10% monthly fee
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    98.5% - 98.0%
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    25% monthly fee
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    98.0% - 95.0%
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    50% monthly fee
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Below 95.0%
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    100% monthly fee
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 mb-4 mt-4">
            To claim service credits, contact support@voxara.app with
            documentation of the outage. Credits are issued as account credits,
            not refunds.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            3. Support Tiers
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.1 Free Plan Support
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Availability:</strong> Business hours (9 AM - 5 PM EST,
              M-F)
            </li>
            <li>
              <strong>Response Time:</strong> Up to 48 hours
            </li>
            <li>
              <strong>Channels:</strong> Email only
            </li>
            <li>
              <strong>Scope:</strong> Account/technical issues only, no billing
              support
            </li>
            <li>
              <strong>Priority:</strong> Lowest
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.2 Pro Plan Support
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Availability:</strong> Business hours (9 AM - 5 PM EST,
              M-F)
            </li>
            <li>
              <strong>Response Time:</strong> Up to 24 hours
            </li>
            <li>
              <strong>Channels:</strong> Email, live chat, phone (callback
              available)
            </li>
            <li>
              <strong>Scope:</strong> Technical, billing, feature requests
            </li>
            <li>
              <strong>Priority:</strong> Standard
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.3 Agency Plan Support
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Availability:</strong> 24/7/365
            </li>
            <li>
              <strong>Response Time:</strong> Up to 4 hours (critical), 24 hours
              (non-critical)
            </li>
            <li>
              <strong>Channels:</strong> Email, live chat, phone, dedicated
              account manager
            </li>
            <li>
              <strong>Scope:</strong> Full support including custom requests
            </li>
            <li>
              <strong>Priority:</strong> High
            </li>
            <li>
              <strong>Additional Benefits:</strong> Priority bug fixes, advanced
              training, quarterly reviews
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            4. Support Issue Classification
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4.1 Critical Issues
          </h3>
          <p className="text-gray-700 mb-4">
            Complete service outage or severe functionality loss affecting
            production use.
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Example:</strong> Unable to log in, complete video
              generation failure
            </li>
            <li>
              <strong>Pro Plan Response:</strong> 8 hours
            </li>
            <li>
              <strong>Agency Plan Response:</strong> 2 hours
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4.2 High Priority Issues
          </h3>
          <p className="text-gray-700 mb-4">
            Significant functionality degradation or non-critical features
            unavailable.
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Example:</strong> Slow performance, partial feature
              unavailability
            </li>
            <li>
              <strong>Pro Plan Response:</strong> 24 hours
            </li>
            <li>
              <strong>Agency Plan Response:</strong> 4 hours
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4.3 Medium Priority Issues
          </h3>
          <p className="text-gray-700 mb-4">
            Minor functionality issues or general questions about feature usage.
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Example:</strong> Specific feature question, UI bug,
              documentation question
            </li>
            <li>
              <strong>Pro Plan Response:</strong> 48 hours
            </li>
            <li>
              <strong>Agency Plan Response:</strong> 24 hours
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4.4 Low Priority Issues
          </h3>
          <p className="text-gray-700 mb-4">
            General inquiries, feature requests, or enhancement suggestions.
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Example:</strong> Feature request, general question
            </li>
            <li>
              <strong>Pro Plan Response:</strong> Best effort
            </li>
            <li>
              <strong>Agency Plan Response:</strong> 1 week
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            5. Support Channels
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            5.1 Email Support
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Email:</strong> support@voxara.app
            </li>
            <li>Responses within stated SLAs</li>
            <li>Good for non-urgent issues and documentation</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            5.2 Live Chat
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Available during business hours for Pro and Agency plans</li>
            <li>Real-time assistance for technical questions</li>
            <li>Direct support from our team</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            5.3 Phone Support
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Pro Plan: Callback available during business hours</li>
            <li>Agency Plan: Direct phone support 24/7</li>
            <li>Best for urgent or complex issues</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            5.4 Account Manager (Agency Plan Only)
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Dedicated point of contact for your account</li>
            <li>Quarterly business reviews</li>
            <li>Strategic guidance and optimization recommendations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            6. Maintenance and Updates
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6.1 Scheduled Maintenance
          </h3>
          <p className="text-gray-700 mb-4">
            We schedule regular maintenance to improve service quality and
            security. Maintenance windows:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              Scheduled for low-traffic periods (typically Tuesday - Thursday,
              2-4 AM EST)
            </li>
            <li>Announced at least 48 hours in advance</li>
            <li>Typically last 1-2 hours</li>
            <li>May include service interruptions</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6.2 Emergency Maintenance
          </h3>
          <p className="text-gray-700 mb-4">
            In case of critical security issues or service degradation, we may
            perform emergency maintenance with minimal notice.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6.3 Updates
          </h3>
          <p className="text-gray-700 mb-4">
            We regularly deploy feature updates and security patches. These may
            occasionally cause brief downtime.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            7. Problem Resolution Process
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            7.1 Initial Contact
          </h3>
          <p className="text-gray-700 mb-4">
            Submit your issue through your preferred support channel with:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Clear description of the issue</li>
            <li>Steps to reproduce (if applicable)</li>
            <li>Screenshots or error messages</li>
            <li>Your account email</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            7.2 Investigation
          </h3>
          <p className="text-gray-700 mb-4">Our support team will:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Acknowledge receipt of your issue</li>
            <li>Provide initial diagnosis</li>
            <li>Ask clarifying questions if needed</li>
            <li>Escalate to engineering if necessary</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            7.3 Resolution and Followup
          </h3>
          <p className="text-gray-700 mb-4">Once resolved:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>We provide clear explanation of the resolution</li>
            <li>Confirm the fix resolves your issue</li>
            <li>Provide workarounds if temporary</li>
            <li>Close ticket after your confirmation</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            8. Known Limitations
          </h2>
          <p className="text-gray-700 mb-4">We do not provide support for:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Third-party integrations or services</li>
            <li>Custom development or modification</li>
            <li>Content creation advice or artistic direction</li>
            <li>Issues caused by customer misuse or negligence</li>
            <li>Issues outside the scope of our Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            9. Performance Metrics
          </h2>
          <p className="text-gray-700 mb-4">
            We track and publish the following metrics:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Monthly uptime percentage</li>
            <li>Average response times by support tier</li>
            <li>Incident reports and post-mortems</li>
            <li>Published on status.voxara.app</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            10. Escalation Process
          </h2>
          <p className="text-gray-700 mb-4">
            If your issue is not satisfactorily resolved:
          </p>
          <ol className="list-decimal pl-6 text-gray-700 mb-4">
            <li>Request escalation to the Support Manager</li>
            <li>Provide detailed history of your communications</li>
            <li>Include specific outcomes you expect</li>
            <li>Manager review typically completes within 3-5 business days</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            11. Billing Support
          </h2>
          <p className="text-gray-700 mb-4">For billing inquiries:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Email:</strong> billing@voxara.app
            </li>
            <li>
              <strong>Response Time:</strong> 24 hours (Pro/Agency), 48 hours
              (Free)
            </li>
            <li>
              <strong>Scope:</strong> Invoices, charges, payment methods,
              refunds
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            12. Limitations of Liability
          </h2>
          <p className="text-gray-700 mb-4">
            IN NO EVENT SHALL voxara BE LIABLE FOR:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Indirect, incidental, or consequential damages</li>
            <li>Loss of profits, data, or business opportunity</li>
            <li>
              Damages exceeding the total amount you paid in the last 12 months
            </li>
            <li>Issues caused by events beyond our reasonable control</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Your exclusive remedy for any SLA violation is the service credit
            described above.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            13. Changes to This SLA
          </h2>
          <p className="text-gray-700 mb-4">
            We may update this SLA periodically. Changes will be posted on this
            page with notice. Continued use of the Service constitutes
            acceptance of updated terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            14. Contact Support
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <strong>General Support:</strong> support@voxara.app
            </p>
            <p className="text-gray-700">
              <strong>Billing Support:</strong> billing@voxara.app
            </p>
            <p className="text-gray-700">
              <strong>Security Issues:</strong> security@voxara.app
            </p>
            <p className="text-gray-700">
              <strong>Status Page:</strong> status.voxara.app
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
