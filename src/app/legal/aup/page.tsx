/**
 * Acceptable Use Policy Page
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceptable Use Policy - voxara',
  description: 'Acceptable use policy for voxara platform',
}

export default function AcceptableUsePolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose prose-lg">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Acceptable Use Policy
          </h1>
          <p className="text-gray-600">Last updated: April 19, 2026</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            1. Overview
          </h2>
          <p className="text-gray-700 mb-4">
            This Acceptable Use Policy ("Policy") sets forth the standards of
            conduct that apply to all users of voxara. Any violation of this
            Policy may result in suspension or termination of your account and
            access to the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            2. Prohibited Content
          </h2>
          <p className="text-gray-700 mb-4">
            You agree not to create, upload, distribute, or use any content on
            voxara that:
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.1 Illegal Content
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              Violates any applicable local, state, national, or international
              law
            </li>
            <li>Relates to child exploitation or abuse</li>
            <li>Promotes illegal activities or violence</li>
            <li>Facilitates fraud or money laundering</li>
            <li>Infringes on copyrights, trademarks, or patents</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.2 Harmful Content
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Promotes violence, terrorism, or extremism</li>
            <li>
              Incites hatred, discrimination, or harassment based on protected
              characteristics
            </li>
            <li>Contains graphic violence or gore</li>
            <li>Promotes self-harm or suicide</li>
            <li>Threatening, harassing, or defamatory content</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.3 Deceptive Content
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Deepfakes created to deceive or harm</li>
            <li>Impersonation of real people without consent</li>
            <li>Misinformation presented as fact</li>
            <li>Fraudulent or misleading content</li>
            <li>Content that violates anyone's privacy or consent</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.4 Sexually Explicit Content
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Non-consensual intimate imagery</li>
            <li>Child sexual abuse material (CSAM)</li>
            <li>Sexual content involving minors</li>
            <li>Unsolicited sexual content or solicitation</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2.5 Spam and Abuse
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Spam, phishing, or scams</li>
            <li>Malware or harmful code</li>
            <li>Automated abuse or botting</li>
            <li>Mass email campaigns or spamming</li>
            <li>Unauthorized scraping or data harvesting</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            3. Deepfake Ethics
          </h2>
          <p className="text-gray-700 mb-4">
            voxara is designed to create synthetic videos for creative and
            legitimate purposes. Users must understand the ethical implications
            and follow these guidelines:
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.1 Consent
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              Always obtain explicit consent from any real person whose likeness
              is used
            </li>
            <li>Disclose when content is synthetic or AI-generated</li>
            <li>Use only authorized images and likenesses</li>
            <li>Respect privacy and dignity of all individuals</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.2 Disclosure Requirements
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Clearly label content as "AI-generated" or "synthetic"</li>
            <li>Include appropriate disclaimers in video descriptions</li>
            <li>Follow platform-specific disclosure requirements</li>
            <li>Be transparent about the use of AI technology</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3.3 Prohibited Deepfake Uses
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Creating fake content to defame or harm someone</li>
            <li>Impersonating public figures for fraud</li>
            <li>Creating non-consensual intimate imagery</li>
            <li>Election interference or political manipulation</li>
            <li>Spreading disinformation or propaganda</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            4. Intellectual Property Rights
          </h2>
          <p className="text-gray-700 mb-4">
            You must respect intellectual property rights of others:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Only use content you own or have permission to use</li>
            <li>
              Obtain licenses for music, images, and other copyrighted materials
            </li>
            <li>Do not infringe on trademarks or brand names</li>
            <li>Credit original creators appropriately</li>
            <li>Respect privacy and right of publicity</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            5. Account Security
          </h2>
          <p className="text-gray-700 mb-4">
            You are responsible for maintaining the security of your account:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Use a strong, unique password</li>
            <li>Enable two-factor authentication</li>
            <li>Do not share your account credentials</li>
            <li>Log out after using shared or public devices</li>
            <li>Report unauthorized access immediately</li>
            <li>Do not attempt to gain unauthorized access to accounts</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            6. System Abuse
          </h2>
          <p className="text-gray-700 mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Probe, scan, or test the vulnerability of the Service</li>
            <li>Use automated tools or bots to access the Service</li>
            <li>Reverse engineer or decompile the Service</li>
            <li>Intercept, monitor, or disrupt the Service</li>
            <li>Consume excessive bandwidth or resources</li>
            <li>Circumvent security measures or restrictions</li>
            <li>Install backdoors or other malicious code</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            7. Harassment and Bullying
          </h2>
          <p className="text-gray-700 mb-4">
            Harassment and bullying will not be tolerated:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Do not target, threaten, or intimidate other users</li>
            <li>Do not engage in sustained harassment campaigns</li>
            <li>Do not use the Service to facilitate cyberbullying</li>
            <li>Do not share private information to harm others</li>
            <li>Respect the dignity and safety of all users</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            8. Commercial Misuse
          </h2>
          <p className="text-gray-700 mb-4">
            You agree not to use the Service for unauthorized commercial
            purposes:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Resell or redistribute the Service</li>
            <li>
              Use the Service on behalf of others without proper licensing
            </li>
            <li>Create competing services using our infrastructure</li>
            <li>Engage in arbitrage or resale schemes</li>
            <li>Violate your subscription terms</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            9. Enforcement
          </h2>
          <p className="text-gray-700 mb-4">
            Violations of this Policy may result in:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Removal of content</li>
            <li>Temporary suspension of account</li>
            <li>Permanent termination of account</li>
            <li>Legal action</li>
            <li>Reporting to law enforcement</li>
          </ul>
          <p className="text-gray-700 mb-4">
            We investigate violations and enforce this Policy at our sole
            discretion.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            10. Reporting Violations
          </h2>
          <p className="text-gray-700 mb-4">
            If you encounter content that violates this Policy, please report it
            to:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">Email: abuse@voxara.app</p>
            <p className="text-gray-700">
              Include specific details and the URL of the violating content
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            11. Changes to This Policy
          </h2>
          <p className="text-gray-700 mb-4">
            We may update this Policy at any time. Continued use of the Service
            constitutes your acceptance of the updated Policy.
          </p>
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
