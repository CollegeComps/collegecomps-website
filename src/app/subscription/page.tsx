'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  BellAlertIcon,
  DocumentArrowDownIcon,
  FolderIcon,
  ArrowPathIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { createCustomerPortalSession } from '@/lib/stripe-client';

interface SubscriptionFeature {
  name: string;
  description: string;
  available: boolean;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  link?: string;
}

interface UsageStats {
  saved_comparisons: number;
  exports_this_month: number;
  alerts_configured: number;
  folders_created: number;
}

export default function SubscriptionPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCancelMessage, setShowCancelMessage] = useState(false);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    saved_comparisons: 0,
    exports_this_month: 0,
    alerts_configured: 0,
    folders_created: 0,
  });

  const isPremium = session?.user?.subscriptionTier === 'premium';

  useEffect(() => {
    if (!session) {
      router.push('/login?callbackUrl=/subscription');
      return;
    }

    // Check for success/cancel parameters
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      setShowSuccessMessage(true);
      // Refresh session to get updated subscription tier
      update();
      // Clear URL parameter after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        router.replace('/subscription');
      }, 5000);
    }
    
    if (canceled === 'true') {
      setShowCancelMessage(true);
      setTimeout(() => {
        setShowCancelMessage(false);
        router.replace('/subscription');
      }, 5000);
    }

    fetchUsageStats();
  }, [session, searchParams]);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/user/usage-stats');
      if (response.ok) {
        const data = await response.json();
        setUsageStats(data);
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const freeFeatures: SubscriptionFeature[] = [
    {
      name: 'Basic ROI Calculator',
      description: 'Calculate return on investment for education',
      available: true,
      icon: ChartBarIcon,
      link: '/roi-calculator',
    },
    {
      name: 'College Data Explorer',
      description: 'Browse institutions and programs',
      available: true,
      icon: SparklesIcon,
      link: '/colleges',
    },
    {
      name: 'My Timeline',
      description: 'Track submissions and important dates',
      available: true,
      icon: ChartBarIcon,
      link: '/my-timeline',
    },
    {
      name: 'Save 1 Comparison',
      description: 'Save one college comparison',
      available: true,
      icon: FolderIcon,
      link: '/saved-comparisons',
    },
  ];

  const premiumFeatures: SubscriptionFeature[] = [
    {
      name: 'Advanced Salary Analytics',
      description: 'P25/P50/P75 analysis, career trajectories, peer comparison',
      available: isPremium,
      icon: ChartBarIcon,
      link: '/advanced-analytics',
    },
    {
      name: 'AI-Powered Suggestions',
      description: 'Smart school and major recommendations',
      available: isPremium,
      icon: SparklesIcon,
      link: '/onboarding',
    },
    {
      name: 'Custom Alerts & Notifications',
      description: 'Email alerts for salary updates, deadlines, and ROI changes',
      available: isPremium,
      icon: BellAlertIcon,
      link: '/alerts',
    },
    {
      name: 'Export & Reports',
      description: 'Download as PDF/Excel, create shareable links',
      available: isPremium,
      icon: DocumentArrowDownIcon,
      link: '/exports',
    },
    {
      name: 'Unlimited Comparisons',
      description: 'Save unlimited comparisons with folders and tags',
      available: isPremium,
      icon: FolderIcon,
      link: '/comparison-manager',
    },
  ];

  const handleManageSubscription = async () => {
    try {
      await createCustomerPortalSession();
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again or contact support.');
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleCancelSubscription = () => {
    // TODO: Integrate with Stripe cancellation
    if (confirm('Are you sure you want to cancel your Premium subscription? You\'ll lose access to all premium features at the end of your billing period.')) {
      alert('Stripe cancellation flow coming soon!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded-lg flex items-center gap-3">
            <CheckCircleIcon className="h-6 w-6 text-green-400" />
            <div>
              <h3 className="font-semibold text-green-400">Subscription Successful!</h3>
              <p className="text-sm text-green-300">
                Welcome to Premium! Your subscription is now active. Enjoy all premium features.
              </p>
            </div>
          </div>
        )}

        {/* Cancel Message */}
        {showCancelMessage && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg flex items-center gap-3">
            <XCircleIcon className="h-6 w-6 text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-400">Checkout Canceled</h3>
              <p className="text-sm text-yellow-300">
                No worries! You can upgrade to Premium anytime.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white font-bold mb-2">My Subscription</h1>
          <p className="text-lg text-gray-300">
            Manage your plan and view feature access
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Current Plan Card */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.1)] p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white font-bold mb-2">
                    {isPremium ? 'Premium Plan' : 'Free Plan'}
                  </h2>
                  <p className="text-gray-300">
                    {isPremium 
                      ? 'You have access to all premium features'
                      : 'Upgrade to unlock advanced features'
                    }
                  </p>
                </div>
                {isPremium && (
                  <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full">
                    Active
                  </span>
                )}
              </div>

              {isPremium && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-300">Billing Cycle</p>
                      <p className="text-lg font-semibold text-white font-bold">Monthly</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Next Billing Date</p>
                      <p className="text-lg font-semibold text-white font-bold">Oct 30, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Amount</p>
                      <p className="text-lg font-semibold text-white font-bold">$6.99/month</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Payment Method</p>
                      <p className="text-lg font-semibold text-white font-bold">•••• 4242</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleManageSubscription}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <CreditCardIcon className="w-5 h-5" />
                      Manage Billing
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      className="flex-1 px-4 py-3 border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              )}

              {!isPremium && (
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-lg hover:shadow-[0_0_12px_rgba(249,115,22,0.08)] transition-all transform hover:-translate-y-1"
                >
                  Upgrade to Premium - $6.99/month
                </button>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Free Features */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.1)] p-8">
                <h3 className="text-xl font-bold text-white font-bold mb-4">Free Features</h3>
                <div className="space-y-3">
                  {freeFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-white font-bold">{feature.name}</p>
                        <p className="text-sm text-gray-300">{feature.description}</p>
                        {feature.link && (
                          <Link
                            href={feature.link}
                            className="text-sm text-orange-500 hover:underline mt-1 inline-block"
                          >
                            Go to feature →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Features */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.1)] p-8">
                <h3 className="text-xl font-bold text-white font-bold mb-4">Premium Features</h3>
                <div className="space-y-3">
                  {premiumFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {feature.available ? (
                        <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${feature.available ? 'text-white font-bold' : 'text-gray-400'}`}>
                          {feature.name}
                        </p>
                        <p className={`text-sm ${feature.available ? 'text-gray-300' : 'text-gray-400'}`}>
                          {feature.description}
                        </p>
                        {feature.available && feature.link && (
                          <Link
                            href={feature.link}
                            className="text-sm text-orange-500 hover:underline mt-1 inline-block"
                          >
                            Go to feature →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Usage Stats Sidebar */}
          <div className="space-y-6">
            {/* Usage Overview */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.1)] p-8">
              <h3 className="text-xl font-bold text-white font-bold mb-4">Usage This Month</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Saved Comparisons</span>
                    <span className="font-semibold text-white font-bold">
                      {usageStats.saved_comparisons} / {isPremium ? '∞' : '1'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ 
                        width: isPremium 
                          ? '30%' 
                          : `${Math.min((usageStats.saved_comparisons / 1) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>

                {isPremium && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Exports</span>
                        <span className="font-semibold text-white font-bold">{usageStats.exports_this_month}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Active Alerts</span>
                        <span className="font-semibold text-white font-bold">{usageStats.alerts_configured}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Folders Created</span>
                        <span className="font-semibold text-white font-bold">{usageStats.folders_created}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.1)] p-8">
              <h3 className="text-xl font-bold text-white font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/pricing"
                  className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ArrowPathIcon className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-white font-bold">
                      {isPremium ? 'Change Plan' : 'View Plans'}
                    </p>
                    <p className="text-xs text-gray-300">
                      {isPremium ? 'Switch to annual billing' : 'See all features'}
                    </p>
                  </div>
                </Link>

                {isPremium && (
                  <>
                    <button
                      onClick={handleManageSubscription}
                      className="w-full flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-left"
                    >
                      <CreditCardIcon className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-white font-bold">Update Payment</p>
                        <p className="text-xs text-gray-300">Change card or billing info</p>
                      </div>
                    </button>

                    <Link
                      href="/alerts"
                      className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <BellAlertIcon className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-white font-bold">Manage Alerts</p>
                        <p className="text-xs text-gray-300">Configure notifications</p>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.1)] p-8 text-white">
              <h3 className="text-xl font-bold mb-2">Need Help?</h3>
              <p className="text-orange-100 mb-4 text-sm">
                Our support team is here to help with any questions about your subscription.
              </p>
              <a
                href="mailto:support@collegeroi.com"
                className="inline-block bg-white text-orange-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
