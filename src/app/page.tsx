'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalculatorIcon,
  BuildingOffice2Icon,
  AcademicCapIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MapPinIcon,
  ArrowRightIcon,
  SparklesIcon,
  CalendarIcon,
  BellAlertIcon,
  ArrowDownTrayIcon,
  FolderIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

interface DatabaseStats {
  totalInstitutions: number;
  totalPrograms: number;
  statesCovered: number;
}

const features = [
  {
    title: 'ROI Calculator',
    description: 'Calculate the return on investment for different college programs and make informed decisions about your education.',
    icon: CalculatorIcon,
    href: '/roi-calculator',
    color: 'bg-blue-500',
    stats: 'Real financial data',
    tier: 'free'
  },
  {
    title: 'College Explorer',
    description: 'Browse and compare thousands of institutions with detailed information about costs, outcomes, and programs.',
    icon: BuildingOffice2Icon,
    href: '/colleges',
    color: 'bg-green-500',
    stats: 'Comprehensive database',
    tier: 'free'
  },
  {
    title: 'Data Dashboard',
    description: 'Interactive visualizations and insights from comprehensive college data to guide your decisions.',
    icon: ChartBarIcon,
    href: '/dashboard',
    color: 'bg-orange-500',
    stats: 'Visual analytics',
    tier: 'free'
  },
  {
    title: 'My Timeline',
    description: 'Track important dates, deadlines, and milestones in your college application journey.',
    icon: CalendarIcon,
    href: '/my-timeline',
    color: 'bg-purple-500',
    stats: 'Stay organized',
    tier: 'free'
  },
  {
    title: 'Advanced Analytics',
    description: 'Deep salary insights with percentile analysis, career trajectories, and peer comparisons.',
    icon: SparklesIcon,
    href: '/advanced-analytics',
    color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    stats: 'Premium feature',
    tier: 'premium'
  },
  {
    title: 'AI Recommendations',
    description: 'Get personalized school recommendations based on your profile, with smart matching and detailed insights.',
    icon: SparklesIcon,
    href: '/ai-recommendations',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    stats: 'Excel feature',
    tier: 'professional'
  },
  {
    title: 'Price Alerts',
    description: 'Get notified about tuition changes, scholarship deadlines, and ROI updates for your target schools.',
    icon: BellAlertIcon,
    href: '/alerts',
    color: 'bg-gradient-to-br from-pink-500 to-red-500',
    stats: 'Premium feature',
    tier: 'premium'
  },
  {
    title: 'Export & Share',
    description: 'Export your comparisons to PDF or Excel and share custom reports with family and advisors.',
    icon: ArrowDownTrayIcon,
    href: '/exports',
    color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    stats: 'Premium feature',
    tier: 'premium'
  },
  {
    title: 'Saved Comparisons',
    description: 'Save unlimited college comparisons and organize them with folders and tags for easy access.',
    icon: FolderIcon,
    href: '/saved-comparisons',
    color: 'bg-gradient-to-br from-green-500 to-teal-600',
    stats: 'Premium feature',
    tier: 'premium'
  }
];

const highlights = [
  {
    icon: CurrencyDollarIcon,
    title: 'Real Financial Data',
    description: 'Access actual tuition, fees, and financial aid information from thousands of institutions.'
  },
  {
    icon: UserGroupIcon,
    title: 'Career Outcomes',
    description: 'See real earnings data and career trajectories for graduates from different programs.'
  },
  {
    icon: MapPinIcon,
    title: 'Nationwide Coverage',
    description: 'Comprehensive data covering institutions across all 50 U.S. states and Washington, DC.'
  }
];

export default function Home() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Make Smarter{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Education Decisions
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Comprehensive college data analysis platform with ROI calculators, program comparisons, 
              and career outcome insights to help you choose the right educational path.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              {loading ? (
                <div className="flex space-x-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center">
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                stats && (
                  <>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{stats.totalInstitutions.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Institutions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600">{stats.totalPrograms.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Programs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{stats.statesCovered} States + DC</div>
                      <div className="text-sm text-gray-600">Coverage</div>
                    </div>
                  </>
                )
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/roi-calculator"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg inline-flex items-center justify-center"
              >
                Start Calculating ROI
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg inline-flex items-center justify-center"
              >
                <SparklesIcon className="mr-2 w-5 h-5" />
                View Plans & Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Make Informed Decisions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and data you need to evaluate 
              college programs and make the best investment in your future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start mb-4">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    {feature.tier === 'premium' && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full">
                        ⭐ Premium
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-blue-600 font-medium group-hover:text-blue-700 text-sm">
                  {feature.tier === 'premium' ? 'Upgrade to access' : 'Learn more'}
                  <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powered by Real Data
            </h2>
            <p className="text-xl text-gray-600">
              Our platform uses comprehensive, up-to-date information from official sources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <highlight.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {highlight.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free or unlock premium features for deeper insights and advanced tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Explore Plan (Free) */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1 mb-2">
                  <span className="text-2xl">�</span>
                  <h3 className="text-2xl font-bold text-gray-900">Explore</h3>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  $0
                  <span className="text-lg text-gray-500 font-normal">/forever</span>
                </div>
                <p className="text-gray-600">Start your journey</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">ROI Calculator</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">College Explorer</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Data Dashboard</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">My Timeline</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">1 Saved Comparison</span>
                </li>
              </ul>
              <Link
                href="/roi-calculator"
                className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Advance Plan (Premium) */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-blue-500 p-8 relative transform scale-105">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-xl text-sm font-bold">
                POPULAR
              </div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1 mb-2">
                  <span className="text-2xl">🚀</span>
                  <h3 className="text-2xl font-bold text-gray-900">Advance</h3>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  $9.99
                  <span className="text-lg text-gray-500 font-normal">/month</span>
                </div>
                <p className="text-gray-600">or $100/year (save $20)</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">Everything in Explore</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Advanced Analytics</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Unlimited Saves & Folders</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Price Alerts</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Export to PDF/Excel</span>
                </li>
              </ul>
              <Link
                href="/pricing"
                className="block w-full text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Excel Plan (Professional) */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-purple-500 p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1 mb-2">
                  <span className="text-2xl">⭐</span>
                  <h3 className="text-2xl font-bold text-gray-900">Excel</h3>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  $19.99
                  <span className="text-lg text-gray-500 font-normal">/month</span>
                </div>
                <p className="text-gray-600">or $199.92/year (save $40)</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">Everything in Advance</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">✨ AI-Powered School Recommendations</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">✨ Smart Student-School Matching</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">✨ Personalized Insights & Predictions</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Priority Support</span>
                </li>
              </ul>
              <Link
                href="/pricing"
                className="block w-full text-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all shadow-lg"
              >
                ⭐ Maximize Your Potential
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl border-2 border-orange-500 p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  Custom
                </div>
                <p className="text-gray-600">For advisors, counselors & institutions</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">Everything in Excel</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">API Access & Data Exports</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">White Label Options</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Bulk User Management</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Dedicated Account Manager</span>
                </li>
              </ul>
              <Link
                href="/pricing"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/pricing"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              View detailed pricing comparison
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Explore Your Options?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start by calculating ROI for programs you're interested in, or browse our comprehensive college database.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/roi-calculator"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              Calculate ROI Now
            </Link>
            <Link
              href="/colleges"
              className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-colors"
            >
              Browse Colleges
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
