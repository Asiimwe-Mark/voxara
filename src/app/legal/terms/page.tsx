/**
 * Terms of Service Page
 * Comprehensive terms governing use of voxara platform
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - voxara',
  description: 'Terms and conditions for using voxara platform',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose prose-lg">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Terms of Service
          </h1>
          <p className="text-gray-600">Last updated: April 19, 2026</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-700 mb-4">
            By accessing and using voxara ("the Service"), you accept and agree
            to be bound by the terms and provision of this agreement. If you do
            not agree to abide by the above, please do not use this service.
          </p>
          <p className="text-gray-700 mb-4">
            voxara reserves the right to modify these terms at any time. Your
            continued use of the Service following the posting of revised Terms
            means that you accept and agree to the changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            2. Use License
          </h2>
          <p className="text-gray-700 mb-4">
            Permission is granted to temporarily download one copy of the
            materials (including information and software) on voxara for
            personal, non-commercial transitory viewing only. This is the grant
            of a license, not a transfer of title, and under this license you
            may not:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Modifying or copying the materials</li>
            <li>
              Using the materials for any commercial purpose or for any public
              display
            </li>
            <li>
              Attempting to decompile or reverse engineer any software contained
              on voxara
            </li>
            <li>
              Removing any copyright or other proprietary notations from the
              materials
            </li>
            <li>
              Transferring the materials to another person or "mirroring" the
              materials on any other server
            </li>
            <li>Violating any applicable laws or regulations</li>
            <li>
              Accessing or searching the Service by any means other than
              voxara's publicly supported interfaces
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            3. Disclaimer
          </h2>
          <p className="text-gray-700 mb-4">
            The materials on voxara are provided on an 'as is' basis. voxara
            makes no warranties, expressed or implied, and hereby disclaims and
            negates all other warranties including, without limitation, implied
            warranties or conditions of merchantability, fitness for a
            particular purpose, or non-infringement of intellectual property or
            other violation of rights.
          </p>
          <p className="text-gray-700 mb-4">
            Further, voxara does not warrant or make any representations
            concerning the accuracy, likely results, or reliability of the use
            of the materials on its Internet web site or otherwise relating to
            such materials or on any sites linked to this site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            4. Limitations
          </h2>
          <p className="text-gray-700 mb-4">
            In no event shall voxara or its suppliers be liable for any damages
            (including, without limitation, damages for loss of data or profit,
            or due to business interruption) arising out of the use or inability
            to use the materials on voxara, even if voxara or a voxara
            authorized representative has been notified orally or in writing of
            the possibility of such damage.
          </p>
          <p className="text-gray-700 mb-4">
            Because some jurisdictions do not allow limitations on implied
            warranties, or limitations of liability for consequential or
            incidental damages, these limitations may not apply to you.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            5. Accuracy of Materials
          </h2>
          <p className="text-gray-700 mb-4">
            The materials appearing on voxara could include technical,
            typographical, or photographic errors. voxara does not warrant that
            any of the materials on our website are accurate, complete, or
            current. voxara may make changes to the materials contained on its
            website at any time without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            6. Materials Copyright
          </h2>
          <p className="text-gray-700 mb-4">
            The materials appearing on voxara could include technical,
            typographical, or photographic errors. voxara does not warrant that
            any of the materials on our website are accurate, complete, or
            current.
          </p>
          <p className="text-gray-700 mb-4">
            The content you create using voxara remains your property. However,
            by using the Service, you grant voxara a worldwide, non-exclusive,
            royalty-free license to use your content for the purpose of
            operating and improving the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            7. Links
          </h2>
          <p className="text-gray-700 mb-4">
            voxara has not reviewed all of the sites linked to its website and
            is not responsible for the contents of any such linked site. The
            inclusion of any link does not imply endorsement by voxara of the
            site. Use of any such linked website is at the user's own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            8. Modifications
          </h2>
          <p className="text-gray-700 mb-4">
            voxara may revise these terms of service for our website at any time
            without notice. By using this website, you are agreeing to be bound
            by the then current version of these terms of service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            9. Governing Law
          </h2>
          <p className="text-gray-700 mb-4">
            These terms and conditions are governed by and construed in
            accordance with the laws of the United States, and you irrevocably
            submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            10. User Accounts
          </h2>
          <p className="text-gray-700 mb-4">
            If you create an account on voxara, you are responsible for
            maintaining the confidentiality of your account and password and for
            restricting access to your computer. You agree to accept
            responsibility for all activities that occur under your account or
            password.
          </p>
          <p className="text-gray-700 mb-4">
            You agree that you will not disclose your password to any third
            party and that you are solely responsible for any and all use of
            your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            11. Acceptable Use
          </h2>
          <p className="text-gray-700 mb-4">You agree not to use voxara:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              To transmit any unlawful, threatening, abusive, defamatory,
              obscene, or otherwise objectionable material
            </li>
            <li>To disrupt the normal flow of dialogue within our website</li>
            <li>
              To create content that promotes violence, hatred, discrimination,
              or harassment
            </li>
            <li>
              To create deepfakes of real people without consent for harmful
              purposes
            </li>
            <li>To violate any applicable laws or regulations</li>
            <li>To infringe on any intellectual property rights</li>
            <li>To impersonate any person or entity</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            12. Content Ownership
          </h2>
          <p className="text-gray-700 mb-4">
            You retain all rights to the content you create. You represent and
            warrant that any content you upload to voxara:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              Does not infringe on any third-party intellectual property rights
            </li>
            <li>Does not violate any applicable laws</li>
            <li>
              Is your original work or you have the proper licenses/permissions
            </li>
            <li>
              Contains no harmful, illegal, or otherwise objectionable material
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            13. Payment Terms
          </h2>
          <p className="text-gray-700 mb-4">
            By purchasing a subscription or credits through voxara, you agree to
            pay the stated fees. All payments are final and non-refundable
            unless explicitly stated otherwise in our Refund Policy.
          </p>
          <p className="text-gray-700 mb-4">
            Subscription payments are billed according to the plan you select
            (monthly or annually). Your subscription will automatically renew
            unless you cancel it through your account settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            14. Service Modifications
          </h2>
          <p className="text-gray-700 mb-4">
            voxara reserves the right to modify, suspend, or discontinue the
            Service (or any part thereof) at any time with or without notice.
            voxara will not be liable to you or any third party for any
            modification, suspension, or discontinuance of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            15. Limitation of Liability
          </h2>
          <p className="text-gray-700 mb-4">
            To the fullest extent permitted by law, in no event shall voxara be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits or revenues, whether
            incurred directly or indirectly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            16. Indemnification
          </h2>
          <p className="text-gray-700 mb-4">
            You agree to indemnify, defend, and hold harmless voxara and its
            officers, directors, employees, and agents from and against any and
            all claims, damages, losses, costs, and expenses (including
            reasonable attorney's fees) arising out of or resulting from your
            violation of these Terms or your use of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            17. Termination
          </h2>
          <p className="text-gray-700 mb-4">
            voxara may terminate your account and access to the Service at any
            time, without notice, for violation of these Terms or for any other
            reason at its sole discretion.
          </p>
          <p className="text-gray-700 mb-4">
            You may terminate your account at any time by contacting
            support@voxara.app.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            18. Severability
          </h2>
          <p className="text-gray-700 mb-4">
            If any provision of these Terms is found to be invalid or
            unenforceable, the remaining provisions shall continue in full force
            and effect.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            19. Entire Agreement
          </h2>
          <p className="text-gray-700 mb-4">
            These Terms constitute the entire agreement between you and voxara
            concerning your use of the Service and supersede all prior
            agreements and understandings, whether written or oral.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            20. Contact Us
          </h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms of Service, please
            contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <strong>voxara Inc.</strong>
            </p>
            <p className="text-gray-700">Email: legal@voxara.app</p>
            <p className="text-gray-700">Support: support@voxara.app</p>
            <p className="text-gray-700">
              Address: To be updated with your company address
            </p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            © 2026 voxara Inc. All rights reserved. This document is provided
            for informational purposes only and does not constitute legal
            advice. Please consult with a legal professional regarding your
            specific circumstances.
          </p>
        </div>
      </div>
    </div>
  )
}
