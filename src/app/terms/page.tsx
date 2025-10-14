'use client';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: October 14, 2025</p>

        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using CollegeComps ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service. We reserve the right to modify these Terms at any time, and your continued use constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              CollegeComps provides:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>ROI (Return on Investment) calculator for college programs</li>
              <li>College comparison tools and data</li>
              <li>Salary insights based on user-contributed data</li>
              <li>College explorer with comprehensive institution data</li>
              <li>Historical trends and predictions (Premium feature)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <strong>Important:</strong> CollegeComps is an educational tool. All calculations, data, and insights are provided for informational purposes only and should not be considered financial, legal, or educational advice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Eligibility</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              To use CollegeComps, you must:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Be at least 13 years of age (COPPA compliance)</li>
              <li>Provide accurate registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Users under 18 should have parental or guardian consent to use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Accounts</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.1 Account Creation</h3>
            <p className="text-gray-700 leading-relaxed">
              When you create an account, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
              <li>Provide true, accurate, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.2 Account Responsibility</h3>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for all activities that occur under your account. We are not liable for any loss or damage arising from unauthorized access to your account.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.3 Account Termination</h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any other reason at our discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Premium Subscriptions</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.1 Subscription Tiers</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Free Tier:</strong> Basic features with limited saved scenarios and bookmarks</li>
              <li><strong>Premium Tier ($9.99/month):</strong> Unlimited features, historical trends, advanced analytics</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.2 Billing and Payments</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Subscriptions renew automatically unless canceled</li>
              <li>Payments are processed securely through Stripe</li>
              <li>Prices are subject to change with 30 days' notice</li>
              <li>No refunds for partial billing periods</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.3 Cancellation</h3>
            <p className="text-gray-700 leading-relaxed">
              You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. You will retain access to premium features until that date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User-Generated Content</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.1 Salary Data Submissions</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              When you submit salary data, you agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>The information is accurate to the best of your knowledge</li>
              <li>Data may be used in aggregate form for analysis and insights</li>
              <li>Individual submissions are anonymized and not publicly identifiable</li>
              <li>You grant us a non-exclusive, royalty-free license to use the data</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.2 Prohibited Content</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              You may not submit content that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Is false, misleading, or fraudulent</li>
              <li>Violates any law or regulation</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains personal information of others without consent</li>
              <li>Includes malicious code, viruses, or harmful content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Acceptable Use Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You agree NOT to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Use automated systems (bots, scrapers) without permission</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Reverse engineer or decompile any part of the Service</li>
              <li>Use the Service for any illegal purpose</li>
              <li>Resell or redistribute our data without authorization</li>
              <li>Create multiple accounts to circumvent limitations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data and Accuracy</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8.1 Data Sources</h3>
            <p className="text-gray-700 leading-relaxed">
              Our data comes from publicly available sources including IPEDS, College Scorecard, and user submissions. We strive for accuracy but cannot guarantee that all data is current, complete, or error-free.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8.2 Disclaimer</h3>
            <p className="text-gray-700 leading-relaxed p-4 bg-red-50 border-l-4 border-red-400 rounded">
              <strong>Important:</strong> CollegeComps provides estimates and projections based on historical data. Actual costs, salaries, and outcomes may vary significantly. ROI calculations are simplified models and do not account for all variables. Always verify information with official college sources and consult with financial advisors for personalized advice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9.1 Our Rights</h3>
            <p className="text-gray-700 leading-relaxed">
              All content, features, and functionality of CollegeComps (including but not limited to software, algorithms, design, text, graphics, and logos) are owned by CollegeComps and protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9.2 Limited License</h3>
            <p className="text-gray-700 leading-relaxed">
              We grant you a limited, non-exclusive, non-transferable license to access and use the Service for personal, non-commercial purposes. This license does not include any right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
              <li>Modify, copy, or distribute the Service</li>
              <li>Create derivative works</li>
              <li>Use the Service commercially without authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimers and Limitations of Liability</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10.1 "AS IS" Disclaimer</h3>
            <p className="text-gray-700 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10.2 Limitation of Liability</h3>
            <p className="text-gray-700 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, COLLEGECOMPS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10.3 Maximum Liability</h3>
            <p className="text-gray-700 leading-relaxed">
              Our total liability to you for any claims arising out of or related to these Terms or the Service shall not exceed the amount you paid to CollegeComps in the 12 months preceding the claim, or $100, whichever is greater.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold harmless CollegeComps, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorney's fees) arising out of:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your user-generated content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your use of the Service is also governed by our{' '}
              <a href="/privacy" className="text-blue-600 hover:underline font-semibold">
                Privacy Policy
              </a>
              , which is incorporated into these Terms by reference. Please review the Privacy Policy to understand our data practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">13.1 Informal Resolution</h3>
            <p className="text-gray-700 leading-relaxed">
              If you have any dispute with us, you agree to first contact us at{' '}
              <a href="mailto:support@collegecomps.com" className="text-blue-600 hover:underline">
                support@collegecomps.com
              </a>{' '}
              and attempt to resolve the dispute informally for at least 30 days.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">13.2 Arbitration</h3>
            <p className="text-gray-700 leading-relaxed">
              Any dispute that cannot be resolved informally shall be resolved through binding arbitration in accordance with the American Arbitration Association rules. You waive any right to a jury trial or to participate in a class action lawsuit.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">13.3 Governing Law</h3>
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by the laws of [Your State/Country], without regard to conflict of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may modify these Terms at any time. Material changes will be notified via:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>Email to registered users</li>
              <li>Prominent notice on the website</li>
              <li>Updated "Last Updated" date at the top of this page</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Your continued use of the Service after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, if you breach these Terms. Upon termination:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>Your right to use the Service ceases immediately</li>
              <li>You remain liable for all obligations accrued prior to termination</li>
              <li>Provisions that should survive termination will remain in effect</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. General Provisions</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">16.1 Entire Agreement</h3>
            <p className="text-gray-700 leading-relaxed">
              These Terms, together with the Privacy Policy, constitute the entire agreement between you and CollegeComps.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">16.2 Severability</h3>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">16.3 No Waiver</h3>
            <p className="text-gray-700 leading-relaxed">
              Our failure to enforce any right or provision of these Terms will not constitute a waiver of such right or provision.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">16.4 Assignment</h3>
            <p className="text-gray-700 leading-relaxed">
              You may not assign or transfer these Terms without our written consent. We may assign our rights and obligations without restriction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700"><strong>Email:</strong> legal@collegecomps.com</p>
              <p className="text-gray-700 mt-2"><strong>Support:</strong> support@collegecomps.com</p>
              <p className="text-gray-700 mt-2"><strong>Mail:</strong> CollegeComps<br/>Legal Department<br/>[Your Business Address]</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 bg-gray-50 p-6 rounded-lg">
            <p className="text-sm text-gray-700 mb-4">
              <strong>By creating an account or using CollegeComps, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
            </p>
            <p className="text-xs text-gray-600">
              Last updated: October 14, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
