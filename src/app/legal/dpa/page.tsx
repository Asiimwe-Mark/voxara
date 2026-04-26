/**
 * Data Processing Agreement (DPA) Page
 * GDPR Compliance
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Processing Agreement - voxara',
  description: 'GDPR Data Processing Agreement for voxara',
}

export default function DataProcessingAgreement() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose prose-lg">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Data Processing Agreement
          </h1>
          <p className="text-gray-600">Last updated: April 19, 2026</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            1. Introduction
          </h2>
          <p className="text-gray-700 mb-4">
            This Data Processing Agreement ("DPA") is entered into between
            voxara Inc. ("Data Processor") and you, as the account holder ("Data
            Controller"), and governs how we process personal data in the course
            of providing the voxara Service to you.
          </p>
          <p className="text-gray-700 mb-4">
            This DPA is supplemental to our Terms of Service and Privacy Policy
            and is compliant with the General Data Protection Regulation (GDPR)
            and other applicable data protection laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            2. Definitions
          </h2>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Personal Data:</strong> Any information relating to an
              identified or identifiable natural person
            </li>
            <li>
              <strong>Processing:</strong> Any operation performed on personal
              data, such as collection, recording, organization, use, or
              transmission
            </li>
            <li>
              <strong>Data Subject:</strong> The individual to whom personal
              data relates
            </li>
            <li>
              <strong>Data Controller:</strong> The entity that determines the
              purposes and means of processing (you)
            </li>
            <li>
              <strong>Data Processor:</strong> The entity that processes data on
              behalf of the controller (voxara)
            </li>
            <li>
              <strong>Sub-processor:</strong> A processor engaged by voxara to
              process data on its behalf
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            3. Scope of Processing
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.1 Data Subject Matter
          </h3>
          <p className="text-gray-700 mb-4">
            We process the following categories of personal data:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Identification data (name, email, phone number)</li>
            <li>Account credentials (hashed passwords)</li>
            <li>Billing information (payment methods, invoices)</li>
            <li>Usage data (videos created, features used)</li>
            <li>
              Content data (scripts, voice selections, avatar configurations)
            </li>
            <li>Device and log data (IP addresses, browser information)</li>
            <li>Communication data (support inquiries, feedback)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.2 Categories of Data Subjects
          </h3>
          <p className="text-gray-700 mb-4">Processing relates to:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>voxara account holders (customers)</li>
            <li>
              Employees and representatives of organizational account holders
            </li>
            <li>End users whose likenesses may be included in video content</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.3 Duration of Processing
          </h3>
          <p className="text-gray-700 mb-4">Processing duration depends on:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              Active subscription period plus retention for legal compliance
            </li>
            <li>
              Typically 30 days after account deletion or subscription
              termination
            </li>
            <li>Longer periods where required by law (e.g., tax records)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            4. Nature and Purpose of Processing
          </h2>
          <p className="text-gray-700 mb-4">
            As Data Processor, voxara processes personal data for the following
            purposes on your behalf:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Providing and maintaining the Service</li>
            <li>Processing transactions and payments</li>
            <li>Fulfilling your requests and support needs</li>
            <li>Preventing fraud and ensuring security</li>
            <li>Complying with legal and regulatory obligations</li>
            <li>Improving and optimizing our Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            5. Your Responsibilities as Data Controller
          </h2>
          <p className="text-gray-700 mb-4">
            As the Data Controller, you are responsible for:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              Obtaining lawful consent before providing personal data to us
            </li>
            <li>
              Ensuring data subjects are informed of processing activities
            </li>
            <li>Ensuring lawful basis exists for all processing</li>
            <li>
              Honoring data subject rights (access, deletion, portability, etc.)
            </li>
            <li>Notifying us of any data subject requests</li>
            <li>Complying with all applicable data protection laws</li>
            <li>Maintaining records of processing activities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            6. Our Responsibilities as Data Processor
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6.1 Processing Instructions
          </h3>
          <p className="text-gray-700 mb-4">We will:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              Process personal data only in accordance with your documented
              instructions
            </li>
            <li>
              Not process data for our own purposes (except as permitted by law)
            </li>
            <li>Maintain confidentiality of all personal data</li>
            <li>
              Implement appropriate technical and organizational security
              measures
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6.2 Sub-processors
          </h3>
          <p className="text-gray-700 mb-4">
            We use the following authorized sub-processors:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Supabase:</strong> Database and authentication services
            </li>
            <li>
              <strong>Paddle:</strong> Payment processing (global) / Flutterwave (Africa)
            </li>
            <li>
              <strong>Amazon Web Services (AWS):</strong> Cloud infrastructure
            </li>
            <li>
              <strong>SendGrid/Resend:</strong> Email delivery
            </li>
            <li>
              <strong>Sentry:</strong> Error tracking and monitoring
            </li>
            <li>
              <strong>Inngest:</strong> Job scheduling and workflow
            </li>
          </ul>
          <p className="text-gray-700 mb-4">
            We maintain agreements with all sub-processors that include
            equivalent data protection obligations.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6.3 Data Security
          </h3>
          <p className="text-gray-700 mb-4">We implement:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Encryption of data in transit (TLS 1.3)</li>
            <li>Encryption of data at rest (AES-256)</li>
            <li>Secure authentication mechanisms</li>
            <li>Regular security audits and assessments</li>
            <li>Employee training on data protection</li>
            <li>Access controls and role-based permissions</li>
            <li>Incident response procedures</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            7. Data Subject Rights
          </h2>
          <p className="text-gray-700 mb-4">
            We will support you in fulfilling data subject requests for:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Right of Access:</strong> Providing copies of personal
              data
            </li>
            <li>
              <strong>Right to Rectification:</strong> Correcting inaccurate
              data
            </li>
            <li>
              <strong>Right to Erasure:</strong> Deleting personal data ("right
              to be forgotten")
            </li>
            <li>
              <strong>Right to Restrict Processing:</strong> Limiting how data
              is used
            </li>
            <li>
              <strong>Right to Data Portability:</strong> Transferring data to
              other services
            </li>
            <li>
              <strong>Right to Object:</strong> Opposing specific processing
              activities
            </li>
            <li>
              <strong>Right to Withdraw Consent:</strong> Revoking permission
              for processing
            </li>
          </ul>
          <p className="text-gray-700 mb-4">
            To exercise these rights, data subjects should contact you as the
            Data Controller. We will cooperate with any lawful requests within
            30 days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            8. Data Breaches
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            8.1 Breach Notification
          </h3>
          <p className="text-gray-700 mb-4">
            If a data breach occurs, we will:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Notify you without undue delay (typically within 24 hours)</li>
            <li>Provide details of the breach and affected data</li>
            <li>Describe the likely consequences</li>
            <li>Outline measures being taken to respond</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            8.2 Cooperation
          </h3>
          <p className="text-gray-700 mb-4">We will:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Investigate the breach promptly</li>
            <li>Preserve evidence for legal proceedings</li>
            <li>Cooperate with law enforcement if requested</li>
            <li>Provide you with information to meet regulatory obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            9. International Data Transfers
          </h2>
          <p className="text-gray-700 mb-4">
            voxara is based in the United States. Your personal data may be
            transferred to, stored in, and processed in the United States and
            other jurisdictions where we operate.
          </p>
          <p className="text-gray-700 mb-4">
            For EU residents, we ensure transfers comply with GDPR, utilizing:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Standard Contractual Clauses (SCCs)</li>
            <li>Binding Corporate Rules (where applicable)</li>
            <li>Adequacy decisions (if applicable to destination country)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            10. Audit and Compliance
          </h2>
          <p className="text-gray-700 mb-4">We will:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Maintain documentation of our processing activities</li>
            <li>Cooperate with your data protection impact assessments</li>
            <li>Allow audits and inspections as legally required</li>
            <li>Provide evidence of compliance upon request</li>
            <li>Undergo regular security assessments</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            11. Data Retention
          </h2>
          <p className="text-gray-700 mb-4">
            We retain personal data only as long as necessary:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              Account data: Throughout active subscription plus 30 days after
              deletion
            </li>
            <li>
              Billing/payment data: For tax and audit purposes (typically 7
              years)
            </li>
            <li>Usage logs: Typically 30-90 days</li>
            <li>
              Backup data: May be retained for 30-90 days for disaster recovery
            </li>
            <li>Other data: As required by law or your instructions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            12. Termination of Processing
          </h2>
          <p className="text-gray-700 mb-4">Upon termination of the Service:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>We will cease processing personal data</li>
            <li>We will return or securely delete data at your request</li>
            <li>We will retain data only as required by law</li>
            <li>We will provide certificates of deletion upon request</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            13. Legal Basis for Processing
          </h2>
          <p className="text-gray-700 mb-4">Processing is based on:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              <strong>Contract:</strong> Performance of services you have
              subscribed to (GDPR Article 6(1)(b))
            </li>
            <li>
              <strong>Legal Obligation:</strong> Compliance with tax, fraud
              prevention, and other legal requirements (GDPR Article 6(1)(c))
            </li>
            <li>
              <strong>Legitimate Interest:</strong> Fraud prevention, security,
              service improvement (GDPR Article 6(1)(f))
            </li>
            <li>
              <strong>Consent:</strong> For marketing communications and
              optional analytics (GDPR Article 6(1)(a))
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            14. California Privacy Laws
          </h2>
          <p className="text-gray-700 mb-4">
            For California residents, we comply with CCPA and CPRA by:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Providing disclosures about data collection and use</li>
            <li>Honoring rights to access, delete, and opt-out</li>
            <li>Restricting sale and sharing of personal information</li>
            <li>Implementing non-discrimination for rights exercises</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            15. Modifications to This Agreement
          </h2>
          <p className="text-gray-700 mb-4">
            voxara may modify this DPA as needed to comply with changes in law.
            We will notify you of material changes and provide an opportunity to
            object. Continued use of the Service indicates acceptance of
            modified terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            16. Governing Law
          </h2>
          <p className="text-gray-700 mb-4">
            This DPA is governed by and construed in accordance with the laws of
            the State of California, United States, without regard to its
            conflict of law principles. However, GDPR and other data protection
            regulations will apply to the extent they are applicable.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            17. Dispute Resolution
          </h2>
          <p className="text-gray-700 mb-4">
            In case of disputes regarding data processing:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>First contact support@voxara.app to resolve the issue</li>
            <li>
              If unresolved, you may contact your data protection authority
            </li>
            <li>
              EU residents have the right to lodge complaints with their
              supervisory authority
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            18. Contact
          </h2>
          <p className="text-gray-700 mb-4">
            For questions about this DPA or our data processing practices:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <strong>Data Protection Officer:</strong> dpo@voxara.app
            </p>
            <p className="text-gray-700">
              <strong>Privacy Team:</strong> privacy@voxara.app
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
