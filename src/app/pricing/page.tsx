'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCheckoutSession } from '@/lib/stripe-client';

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  
  const currentTier = session?.user?.subscriptionTier || 'free';

  const handleUpgrade = async (tier: string) => {
    console.log('[handleUpgrade] Called with tier:', tier, 'session:', !!session, 'currentTier:', currentTier);
    
    if (!session) {
      console.log('[handleUpgrade] No session, redirecting to signin');
      router.push('/auth/signin?callbackUrl=/pricing');
      return;
    }
    
    if (tier === 'premium') {
      try {
        console.log('[handleUpgrade] Starting premium upgrade, billingCycle:', billingCycle);
        setLoading(true);
        await createCheckoutSession('premium', billingCycle);
      } catch (error) {
        console.error('[handleUpgrade] Checkout error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Failed to start checkout: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 font-medium">
            Start free or unlock premium features for deeper insights and advanced tools
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-900 border border-gray-800 rounded-full p-1 shadow-[0_0_12px_rgba(249,115,22,0.08)]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.08)] shadow-orange-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.08)] shadow-orange-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Annual
              <span className="ml-2 px-2 py-0.5 bg-green-500/20 border border-green-500 text-green-400 text-xs rounded-full font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards - Enhanced design */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan - Enhanced */}
          <div className="relative bg-gray-900 border-2 border-gray-800 rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.1)] p-8 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
            {/* Subtle gradient overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 mb-3">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="text-5xl font-extrabold text-white mb-2">
                  $0
                  <span className="text-lg text-gray-400 font-normal">/forever</span>
                </div>
                <p className="text-gray-300 font-medium">Start your journey</p>
              </div>
            </div>
            
            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 font-medium">ROI Calculator</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 font-medium">College Search & Explorer</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 font-medium">Compare up to 3 Colleges</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 font-medium">Data Dashboard</span>
              </li>
              {/* Historical Trends temporarily hidden */}
              {/* <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300">Historical Trends</span>
              </li> */}
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 font-medium">Limited Saved Scenarios</span>
              </li>
            </ul>
            
            <button
              onClick={() => !session ? router.push('/auth/signin') : router.push('/roi-calculator')}
              className="w-full py-3 px-6 rounded-lg font-bold transition-all bg-gray-800 text-white hover:bg-gray-700 shadow-[0_0_10px_rgba(249,115,22,0.08)]"
            >
              {currentTier === 'free' ? '✓ Current Plan' : 'Get Started Free'}
            </button>
          </div>

          {/* Premium Plan - Enhanced */}
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-orange-950/30 rounded-2xl shadow-[0_0_25px_rgba(249,115,22,0.2)] border-2 border-orange-500/50 p-8 transform md:scale-105 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5"></div>
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
            
            <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-1.5 rounded-bl-xl rounded-tr-xl text-sm font-bold shadow-lg">
              ⭐ POPULAR
            </div>
            
            <div className="relative z-10">
              <div className="text-center mb-6 pt-4">
                <div className="inline-flex items-center gap-2 mb-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl">🚀</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Premium</h3>
                <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-2">
                  ${billingCycle === 'monthly' ? '6.99' : '4.99'}
                  <span className="text-xl text-gray-400 font-normal">/month</span>
                </div>
                <p className="text-gray-300 font-medium">
                  {billingCycle === 'annual' ? 'Billed annually at $59.99' : 'or $59.99/year (save $24)'}
                </p>
              </div>
            </div>
            
            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 font-semibold">Everything in Free</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 font-medium">Detailed Salary Insights</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 font-medium">Compare Unlimited Colleges</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 font-medium">Unlimited Saved Scenarios & Bookmarks</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 font-medium">Advanced Analytics & Reports</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 font-medium">Price Alerts & Notifications</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 font-medium">Export to PDF/Excel</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 font-medium">Priority Support</span>
              </li>
            </ul>
            
            {/* Button wrapper with z-index to prevent overlay blocking */}
            <div className="relative z-20">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[Stripe Button] Click detected, tier:', currentTier, 'loading:', loading);
                  handleUpgrade('premium');
                }}
                disabled={currentTier === 'premium' || loading}
                className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${
                  currentTier === 'premium' || loading
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600 shadow-[0_0_12px_rgba(249,115,22,0.08)] shadow-orange-500/30 transform hover:-translate-y-0.5 cursor-pointer'
                }`}
                style={{ pointerEvents: 'auto' }}
              >
                {loading ? 'Loading...' : currentTier === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-[0_0_12px_rgba(249,115,22,0.08)]">
              <h3 className="text-lg font-bold text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-300 font-medium">
                Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-[0_0_12px_rgba(249,115,22,0.08)]">
              <h3 className="text-lg font-bold text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-300 font-medium">
                We accept all major credit cards (Visa, MasterCard, American Express) through our secure payment processor, Stripe.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-[0_0_12px_rgba(249,115,22,0.08)]">
              <h3 className="text-lg font-bold text-white mb-2">
                Is there a student discount?
              </h3>
              <p className="text-gray-300 font-medium">
                We're working on a student verification system. For now, the annual plan offers the best value with 20% savings.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure payments</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}