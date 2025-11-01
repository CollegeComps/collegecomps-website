import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - How We Protect Your Data',
  description: 'Learn how CollegeComps collects, uses, and protects your personal information. COPPA and CCPA compliant privacy practices for US users.',
  robots: { index: false, follow: false },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-gray-900 border border-gray-800 rounded-lg shadow-[0_0_10px_rgba(249,115,22,0.08)] p-8">
        <h1 className="text-4xl font-bold tracking-tight text-white font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-300 mb-2">Last Updated: October 14, 2025</p>
        <p className="text-sm text-gray-300 mb-8">This Privacy Policy applies to users in the United States only.</p>

        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white font-bold mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to CollegeComps ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website collegecomps.com and use our services.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong>Note:</strong> CollegeComps currently operates exclusively in the United States. This Privacy Policy is designed to comply with United States federal privacy laws including COPPA (Children's Online Privacy Protection Act) and California's CCPA (California Consumer Privacy Act).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white font-bold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white font-bold mt-6 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-300 leading-relaxed mb-3">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li><strong>Account Information:</strong> Name, email address, password when you create an account</li>
              <li><strong>Profile Information:</strong> Optional demographic information, educational background</li>
              <li><strong>Payment Information:</strong> Billing details when subscribing to premium features (processed securely by Stripe)</li>
              <li><strong>User-Generated Content:</strong> Salary data submissions, saved ROI scenarios, bookmarked colleges</li>
            </ul>

            <h3 className="text-xl font-semibold text-white font-bold mt-6 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on site</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Cookies:</strong> Session cookies for authentication, analytics cookies for usage tracking</li>
            </ul>

            <h3 className="text-xl font-semibold text-white font-bold mt-6 mb-3">2.3 Third-Party Data</h3>
            <p className="text-gray-300 leading-relaxed">
              We integrate publicly available data from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li><strong>IPEDS (Integrated Postsecondary Education Data System):</strong> College financial and enrollment data</li>
              <li><strong>College Scorecard (U.S. Department of Education):</strong> Graduate outcomes and earnings data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We use collected information for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li><strong>Provide Services:</strong> ROI calculations, college comparisons, salary insights</li>
              <li><strong>Personalization:</strong> Save your preferences, scenarios, and bookmarks</li>
              <li><strong>Analytics:</strong> Understand usage patterns and improve our platform</li>
              <li><strong>Communications:</strong> Send updates, notifications, and support responses</li>
              <li><strong>Security:</strong> Prevent fraud, abuse, and unauthorized access</li>
              <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white font-bold mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We DO NOT sell your personal information. We may share your data in the following limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li><strong>Service Providers:</strong> Third-party vendors (e.g., Vercel for hosting, Turso for databases, Stripe for payments)</li>
              <li><strong>Aggregated Data:</strong> Anonymous, aggregated statistics for research purposes</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or legal process</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white font-bold mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li><strong>Essential Cookies:</strong> Required for authentication and site functionality</li>
              <li><strong>Analytics Cookies:</strong> Google Analytics to understand usage patterns</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              You can control cookies through your browser settings. Note that disabling cookies may affect site functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white font-bold mb-4">6. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300 mt-3">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure password hashing (bcrypt)</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <strong>Note:</strong> No method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white font-bold mb-4">7. Your Privacy Rights</h2>
            
            <h3 className="text-xl font-semibold text-white font-bold mt-6 mb-3">7.1 All Users</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
            </ul>

            <h3 className="text-xl font-semibold text-white font-bold mt-6 mb-3">7.2 CCPA Rights (California Residents)</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt-out of the sale of personal information (we do not sell your data)</li>
              <li>Right to non-discrimination for exercising rights</li>
            </ul>

            <p className="text-gray-300 leading-relaxed mt-4">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:privacy@collegecomps.com" className="text-orange-500 hover:underline">
                privacy@collegecomps.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white font-bold mb-4">8. Children's Privacy (COPPA Compliance)</h2>
            <p className="text-gray-300 leading-relaxed">
              CollegeComps is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at{' '}
              <a href="mailto:privacy@collegecomps.com" className="text-orange-500 hover:underline">
                privacy@collegecomps.com
              </a>{' '}
              and we will delete such information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white font-bold mb-4">9. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain your personal information for as long as necessary to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300 mt-3">
              <li>Provide our services and maintain your account</li>
              <li>Comply with legal obligations (e.g., tax records for 7 years)</li>
              <li>Resolve disputes and enforce agreements</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              When you delete your account, we will delete or anonymize your personal information within 30 days, except where retention is required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white font-bold mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300 mt-3">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending an email notification to registered users</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              Your continued use of our services after changes constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white font-bold mb-4">11. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-300"><strong>Email:</strong> privacy@collegecomps.com</p>
              <p className="text-gray-300 mt-2"><strong>Mail:</strong> CollegeComps<br/>Privacy Team<br/>[Your Business Address]</p>
              <p className="text-gray-300 mt-2"><strong>Support:</strong> <a href="/support" className="text-orange-500 hover:underline">Contact Support</a></p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white font-bold mb-4">12. Third-Party Links</h2>
            <p className="text-gray-300 leading-relaxed">
              Our website may contain links to third-party websites (e.g., college websites, government resources). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-300">
              <strong>California Residents:</strong> For specific CCPA disclosures and opt-out instructions, please see Section 7.2 above.
            </p>
            <p className="text-sm text-gray-300 mt-2">
              <strong>Note:</strong> CollegeComps is a US-based service. We do not currently operate in the European Union or other international markets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
