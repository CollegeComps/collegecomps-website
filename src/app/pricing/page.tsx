'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCheckoutSession } from '@/lib/stripe-client';

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState<string | null>(null);

  const currentTier = session?.user?.subscriptionTier || 'free';

  const handleUpgrade = async (tier: string) => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/pricing');
      return;
    }

    try {
      setLoading(tier);
      await createCheckoutSession(tier, billingCycle);
    } catch (error) {
      console.error('[handleUpgrade] Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to start checkout: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
    } finally {
      setLoading(null);
    }
  };

  const isCurrentTier = (tier: string) => {
    if (tier === 'plus' && (currentTier === 'premium' || currentTier === 'plus')) return true;
    return currentTier === tier;
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
            Start free or unlock AI-powered features for smarter college decisions
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-900 border border-gray-800 rounded-full p-1 shadow-[0_0_12px_rgba(249,115,22,0.08)]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-orange-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-orange-500/30'
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

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Free Plan */}
          <div className="relative bg-gray-900 border-2 border-gray-800 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Free</h3>
              <div className="text-4xl font-extrabold text-white mb-1">
                $0
                <span className="text-base text-gray-400 font-normal">/forever</span>
              </div>
              <p className="text-gray-400 text-sm font-medium">Start your journey</p>
            </div>

            <ul className="space-y-2.5 mb-6 flex-grow text-sm">
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">ROI Calculator</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">College Search & Explorer</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Compare up to 3 Colleges</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Data Dashboard</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">3 AI Advisor Messages/Day</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">1 Saved Comparison</span>
              </li>
            </ul>

            <button
              onClick={() => !session ? router.push('/auth/signin') : router.push('/roi-calculator')}
              className="w-full py-3 px-6 rounded-lg font-bold transition-all bg-gray-800 text-white hover:bg-gray-700"
            >
              {isCurrentTier('free') && session ? 'Current Plan' : 'Get Started Free'}
            </button>
          </div>

          {/* Plus Plan (formerly Premium) */}
          <div className="relative bg-gray-900 border-2 border-gray-800 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Plus</h3>
              <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-1">
                ${billingCycle === 'monthly' ? '9.99' : '7.99'}
                <span className="text-base text-gray-400 font-normal">/month</span>
              </div>
              <p className="text-gray-400 text-sm font-medium">
                {billingCycle === 'annual' ? 'Billed annually at $95.88' : 'or $95.88/year (save 20%)'}
              </p>
            </div>

            <ul className="space-y-2.5 mb-6 flex-grow text-sm">
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300 font-semibold">Everything in Free</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">15 AI Advisor Messages/Day</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Detailed Salary Insights</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Unlimited Comparisons</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Unlimited Saved Scenarios</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Export to PDF/Excel</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Price Alerts</span>
              </li>
            </ul>

            <div className="relative z-20">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUpgrade('premium');
                }}
                disabled={isCurrentTier('plus') || loading === 'premium'}
                className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${
                  isCurrentTier('plus') || loading === 'premium'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600 shadow-orange-500/30 cursor-pointer'
                }`}
                style={{ pointerEvents: 'auto' }}
              >
                {loading === 'premium' ? 'Loading...' : isCurrentTier('plus') ? 'Current Plan' : 'Upgrade to Plus'}
              </button>
            </div>
          </div>

          {/* AI Pro Plan - MOST POPULAR */}
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-orange-950/30 rounded-2xl shadow-[0_0_25px_rgba(249,115,22,0.2)] border-2 border-orange-500/50 p-6 transform lg:scale-105 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5"></div>
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"></div>

            <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl text-xs font-bold shadow-lg">
              MOST POPULAR
            </div>

            <div className="relative z-10 text-center mb-6 pt-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Pro</h3>
              <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-1">
                ${billingCycle === 'monthly' ? '19.99' : '15.99'}
                <span className="text-base text-gray-400 font-normal">/month</span>
              </div>
              <p className="text-gray-400 text-sm font-medium">
                {billingCycle === 'annual' ? 'Billed annually at $191.88' : 'or $191.88/year (save 20%)'}
              </p>
            </div>

            <ul className="space-y-2.5 mb-6 flex-grow text-sm relative z-10">
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300 font-semibold">Everything in Plus</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Unlimited AI College Advisor</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">AI Essay Assistant (5/mo)</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">AI Career Path Analysis</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Smart Scholarship Matching</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">AI College Reports (3/mo)</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Advanced Analytics</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Priority Support</span>
              </li>
            </ul>

            <div className="relative z-20">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUpgrade('ai_pro');
                }}
                disabled={isCurrentTier('ai_pro') || loading === 'ai_pro'}
                className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${
                  isCurrentTier('ai_pro') || loading === 'ai_pro'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600 shadow-orange-500/30 transform hover:-translate-y-0.5 cursor-pointer'
                }`}
                style={{ pointerEvents: 'auto' }}
              >
                {loading === 'ai_pro' ? 'Loading...' : isCurrentTier('ai_pro') ? 'Current Plan' : 'Upgrade to AI Pro'}
              </button>
            </div>
          </div>

          {/* Family Plan */}
          <div className="relative bg-gray-900 border-2 border-gray-800 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl text-xs font-bold">
              FAMILIES
            </div>

            <div className="text-center mb-6 pt-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Family</h3>
              <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-1">
                ${billingCycle === 'monthly' ? '29.99' : '23.99'}
                <span className="text-base text-gray-400 font-normal">/month</span>
              </div>
              <p className="text-gray-400 text-sm font-medium">
                {billingCycle === 'annual' ? 'Billed annually at $287.88' : 'or $287.88/year (save 20%)'}
              </p>
            </div>

            <ul className="space-y-2.5 mb-6 flex-grow text-sm">
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300 font-semibold">Everything in AI Pro</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Up to 3 Student Profiles</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Parent Dashboard</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Unlimited AI Essays</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Unlimited AI Reports</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Deadline Tracking</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Dedicated Support</span>
              </li>
            </ul>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUpgrade('family');
              }}
              disabled={isCurrentTier('family') || loading === 'family'}
              className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${
                isCurrentTier('family') || loading === 'family'
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-blue-500/30 cursor-pointer'
              }`}
              style={{ pointerEvents: 'auto' }}
            >
              {loading === 'family' ? 'Loading...' : isCurrentTier('family') ? 'Current Plan' : 'Upgrade to Family'}
            </button>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-20 max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white text-center mb-8">
            Compare All Features
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Free</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Plus</th>
                  <th className="text-center py-4 px-4 text-orange-500 font-bold">AI Pro</th>
                  <th className="text-center py-4 px-4 text-blue-400 font-medium">Family</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">ROI Calculator</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">College Explorer</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">College Comparisons</td>
                  <td className="py-3 px-4 text-center">3 max</td>
                  <td className="py-3 px-4 text-center text-green-500">Unlimited</td>
                  <td className="py-3 px-4 text-center text-green-500">Unlimited</td>
                  <td className="py-3 px-4 text-center text-green-500">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">AI College Advisor</td>
                  <td className="py-3 px-4 text-center">3/day</td>
                  <td className="py-3 px-4 text-center">15/day</td>
                  <td className="py-3 px-4 text-center text-green-500">Unlimited</td>
                  <td className="py-3 px-4 text-center text-green-500">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">Salary Analytics</td>
                  <td className="py-3 px-4 text-center text-gray-600">-</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">Export PDF/Excel</td>
                  <td className="py-3 px-4 text-center text-gray-600">-</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">AI Essay Assistant</td>
                  <td className="py-3 px-4 text-center text-gray-600">-</td>
                  <td className="py-3 px-4 text-center text-gray-600">-</td>
                  <td className="py-3 px-4 text-center">5/month</td>
                  <td className="py-3 px-4 text-center text-green-500">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">AI Career Path Analysis</td>
                  <td className="py-3 px-4 text-center text-gray-600">-</td>
                  <td className="py-3 px-4 text-center text-gray-600">-</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">AI College Reports</td>
                  <td className="py-3 px-4 text-center text-gray-600">-</td>
                  <td className="py-3 px-4 text-center">1/month</td>
                  <td className="py-3 px-4 text-center">3/month</td>
                  <td className="py-3 px-4 text-center text-green-500">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">Student Profiles</td>
                  <td className="py-3 px-4 text-center">1</td>
                  <td className="py-3 px-4 text-center">1</td>
                  <td className="py-3 px-4 text-center">1</td>
                  <td className="py-3 px-4 text-center">3</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">Parent Dashboard</td>
                  <td className="py-3 px-4 text-center text-gray-600">-</td>
                  <td className="py-3 px-4 text-center text-gray-600">-</td>
                  <td className="py-3 px-4 text-center text-gray-600">-</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-300 font-medium">
                Yes! You can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">
                What is the AI College Advisor?
              </h3>
              <p className="text-gray-300 font-medium">
                Our AI Advisor is a conversational tool powered by advanced AI that has access to data from 6,000+ institutions. Ask it anything about colleges, ROI, careers, financial aid, or application strategy and get personalized, data-backed guidance.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-300 font-medium">
                We accept all major credit cards (Visa, MasterCard, American Express) through our secure payment processor, Stripe.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">
                Is there a student discount?
              </h3>
              <p className="text-gray-300 font-medium">
                We&apos;re working on a student verification system. For now, the annual plan offers the best value with 20% savings.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">
                What&apos;s the difference between Plus and AI Pro?
              </h3>
              <p className="text-gray-300 font-medium">
                Plus gives you full access to data tools, salary analytics, and limited AI advisor access. AI Pro unlocks unlimited AI advisor conversations, essay assistance, career path analysis, and AI-generated college reports.
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
