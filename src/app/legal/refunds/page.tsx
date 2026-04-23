/**
 * Refund and Cancellation Policy Page
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy - voxara',
  description: 'Refund and cancellation policies for voxara subscriptions',
}

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose prose-lg">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Refund & Cancellation Policy
          </h1>
          <p className="text-gray-600">Last updated: April 19, 2026</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            1. Overview
          </h2>
          <p className="text-gray-700 mb-4">
            At voxara, we want you to be satisfied with your subscription. This
            policy outlines our refund and cancellation procedures. Please read
            it carefully before making a purchase.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            2. Subscription Plans
          </h2>
          <p className="text-gray-700 mb-4">
            voxara offers the following subscription tiers:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Free Plan:</strong> No charge, includes basic features
            </li>
            <li>
              <strong>Pro Plan:</strong> $29/month or $290/year
            </li>
            <li>
              <strong>Agency Plan:</strong> $99/month or $990/year
            </li>
            <li>
              <strong>Credit Packs:</strong> One-time purchases ranging from
              $10-$100+
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            3. Cancellation Policy
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.1 How to Cancel
          </h3>
          <p className="text-gray-700 mb-4">
            You can cancel your subscription at any time through:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Dashboard → Settings → Billing → Cancel Subscription</li>
            <li>Email: support@voxara.app with your account details</li>
            <li>Live chat support on our website</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.2 Cancellation Timing
          </h3>
          <p className="text-gray-700 mb-4">
            <strong>Cancellations are effective immediately.</strong> You will
            lose access to premium features at the end of your current billing
            cycle. Your account will be downgraded to the Free Plan.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.3 No Refund Upon Cancellation
          </h3>
          <p className="text-gray-700 mb-4">
            Cancellation does not entitle you to a refund of charges already
            incurred. You can use your subscription until the end of your
            billing period.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.4 Auto-Renewal Cancellation
          </h3>
          <p className="text-gray-700 mb-4">
            When you cancel, automatic recurring charges will stop. You will not
            be billed for the next billing cycle.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            4. Refund Policy
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4.1 General Refund Policy
          </h3>
          <p className="text-gray-700 mb-4">
            <strong>
              All payments are generally final and non-refundable.
            </strong>{' '}
            voxara does not offer refunds on subscription fees or credit pack
            purchases except under the circumstances outlined below.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4.2 Money-Back Guarantee (First 14 Days)
          </h3>
          <p className="text-gray-700 mb-4">
            If you are not satisfied with your subscription within 14 days of
            purchase, you may request a full refund by contacting
            support@voxara.app. To qualify:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              The request must be made within 14 days of your initial purchase
            </li>
            <li>You must provide a reason for the refund request</li>
            <li>This applies only to the first subscription purchase</li>
            <li>Abuse of this policy may result in account termination</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4.3 Refunds for Duplicate Charges
          </h3>
          <p className="text-gray-700 mb-4">
            If you were charged multiple times due to an error or technical
            issue, you are entitled to a full refund for the duplicate charges.
            Please contact support with:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Your account email</li>
            <li>Screenshots of duplicate charges</li>
            <li>Date and amount of charges</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4.4 Refunds for Service Unavailability
          </h3>
          <p className="text-gray-700 mb-4">
            If the Service is unavailable for more than 7 consecutive days due
            to a technical issue on our end, you may request a prorated refund
            or service credit.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4.5 Refunds for Unauthorized Charges
          </h3>
          <p className="text-gray-700 mb-4">
            If your credit card was charged without authorization, please
            contact us immediately at support@voxara.app or your credit card
            company to dispute the charge.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            5. Credit Pack Refunds
          </h2>
          <p className="text-gray-700 mb-4">
            Credit packs purchased for one-time use are non-refundable. However:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              Refunds may be issued if you purchased the wrong amount within 14
              days
            </li>
            <li>
              Unused credits may be transferred to future months if requested
            </li>
            <li>Credits expire after 12 months of purchase</li>
            <li>In case of service outages, credits may be restored</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            6. Refund Process
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6.1 Requesting a Refund
          </h3>
          <p className="text-gray-700 mb-4">To request a refund, please:</p>
          <ol className="list-decimal pl-6 text-gray-700 mb-4">
            <li>Contact support@voxara.app with your request</li>
            <li>Include your account email and order details</li>
            <li>Provide a reason for the refund request</li>
            <li>Include any supporting documentation</li>
          </ol>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6.2 Processing Time
          </h3>
          <p className="text-gray-700 mb-4">
            Once approved, refunds are typically processed within 5-10 business
            days. Depending on your financial institution, it may take an
            additional 1-3 business days to appear in your account.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6.3 Refund Method
          </h3>
          <p className="text-gray-700 mb-4">
            Refunds will be issued to the original payment method used for the
            purchase.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            7. Billing Disputes
          </h2>
          <p className="text-gray-700 mb-4">If you dispute a charge:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Contact us first at support@voxara.app to resolve the issue</li>
            <li>Provide documentation of the disputed charge</li>
            <li>
              If unresolved, you may file a dispute with your credit card
              company
            </li>
            <li>Repeated chargebacks may result in account termination</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            8. Downgrade Policy
          </h2>
          <p className="text-gray-700 mb-4">
            You can downgrade your subscription at any time:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Downgrades take effect on your next billing cycle</li>
            <li>No refund for the difference between plans</li>
            <li>You may receive a service credit if pro-rata adjusted</li>
            <li>Downgrading to Free Plan disables premium features</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            9. Account Deletion
          </h2>
          <p className="text-gray-700 mb-4">When you delete your account:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Immediate termination of service access</li>
            <li>No refund of prepaid subscriptions</li>
            <li>Remaining credits are forfeited</li>
            <li>All content and data are permanently deleted after 30 days</li>
            <li>You cannot recover a deleted account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            10. Tax Considerations
          </h2>
          <p className="text-gray-700 mb-4">Please note that:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>All prices are subject to applicable sales tax</li>
            <li>Tax is calculated based on your billing address</li>
            <li>Refunds are calculated before tax</li>
            <li>International customers are responsible for import duties</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            11. Exceptions and Special Cases
          </h2>
          <p className="text-gray-700 mb-4">
            Special circumstances may be considered on a case-by-case basis:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Significant feature unavailability or bugs</li>
            <li>Accidental duplicate charges</li>
            <li>Fraudulent activity</li>
            <li>Service delivery failures</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Contact support@voxara.app to discuss your specific situation.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            12. Changes to This Policy
          </h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to modify this policy at any time. Changes will
            be posted on this page with an updated "Last updated" date.
            Continued use of the Service indicates acceptance of the updated
            policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            13. Contact Support
          </h2>
          <p className="text-gray-700 mb-4">
            For refund requests or billing questions:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <strong>Email:</strong> support@voxara.app
            </p>
            <p className="text-gray-700">
              <strong>Billing Support:</strong> billing@voxara.app
            </p>
            <p className="text-gray-700">
              <strong>Response Time:</strong> 24-48 hours
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
