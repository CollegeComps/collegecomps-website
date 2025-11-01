'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { DataSourcesFooter } from '@/components/DataSources';
import { OrganizationSchema, WebApplicationSchema } from '@/components/StructuredData';
import RotatingTestimonials from '@/components/RotatingTestimonials';
import SocialShare from '@/components/SocialShare';
import AnimatedCounter from '@/components/AnimatedCounter';
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

// Format large numbers with K/M suffix and + sign
function formatStatNumber(num: number): string {
  if (num >= 1000000) {
    // Round down to nearest 100K for millions
    const millions = Math.floor(num / 100000) / 10;
    return `${millions.toFixed(1)}M+`;
  } else if (num >= 10000) {
    // Round down to nearest 1K for ten thousands
    const thousands = Math.floor(num / 1000);
    return `${thousands}K+`;
  } else if (num >= 1000) {
    // Round down to nearest 100 for thousands
    const rounded = Math.floor(num / 100) * 100;
    return `${(rounded / 1000).toFixed(1)}K+`;
  }
  return num.toString();
}

const features = [
  {
    title: 'ROI Calculator',
    description: 'Calculate the return on investment for different college programs and make informed decisions about your education.',
    icon: CalculatorIcon,
    href: '/roi-calculator',
    color: 'bg-orange-500',
    stats: 'Real financial data',
    tier: 'free'
  },
  {
    title: 'College Explorer',
    description: 'Browse and compare thousands of institutions with detailed information about costs, outcomes, and programs.',
    icon: BuildingOffice2Icon,
    href: '/colleges',
    color: 'bg-orange-600',
    stats: 'Comprehensive database',
    tier: 'free'
  },
  {
    title: 'Compare Colleges',
    description: 'Side-by-side comparison of colleges with costs, programs, and outcomes to make the best choice.',
    icon: ChartBarIcon,
    href: '/compare',
    color: 'bg-orange-500',
    stats: 'Smart comparisons',
    tier: 'free'
  },
  // Historical Trends temporarily hidden
  // {
  //   title: 'Historical Trends',
  //   description: 'Analyze past trends and future projections for college costs, salaries, and ROI over time.',
  //   icon: SparklesIcon,
  //   href: '/historical-trends',
  //   color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
  //   stats: 'Premium feature',
  //   tier: 'premium'
  // },
  {
    title: 'Salary Analytics',
    description: 'Real salary data from graduates with detailed breakdowns by major, school, and experience level.',
    icon: SparklesIcon,
    href: '/salary-insights',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
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
  const { data: session } = useSession();
  const currentTier = session?.user?.subscriptionTier || 'free';

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
      {/* Structured Data for SEO */}
      <OrganizationSchema />
      <WebApplicationSchema />
      
      {/* Hero Section - Enhanced with gradients */}
      <div className="relative bg-black overflow-hidden">
        {/* Gradient overlay background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-orange-950/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-600/10 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full mb-6">
              <SparklesIcon className="w-4 h-4 text-orange-500 mr-2" />
              <span className="text-sm font-semibold text-orange-400">Data-Driven College Selection</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-8 tracking-tight">
              Make Smarter{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">
                Education Decisions
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
              Comprehensive college data analysis platform with ROI calculators, program comparisons, 
              and career outcome insights to help you choose the right educational path.
            </p>
            
            {/* Stats - Less blocky, more flowing design */}
            <div className="flex flex-wrap justify-center gap-6 mb-12 px-4">
              {loading ? (
                <div className="flex space-x-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center bg-gray-900/50 rounded-3xl p-8 border border-gray-800 w-[200px]">
                      <div className="h-12 w-24 bg-gray-800 rounded animate-pulse mb-3 mx-auto"></div>
                      <div className="h-4 w-28 bg-gray-800 rounded animate-pulse mx-auto"></div>
                    </div>
                  ))}
                </div>
              ) : (
                stats && (
                  <>
                    <div className="group text-center bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-orange-500/20 rounded-3xl p-6 w-[200px] shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:shadow-[0_0_40px_rgba(249,115,22,0.25)] hover:-translate-y-2 transition-all duration-500 ease-out">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <BuildingOffice2Icon className="w-8 h-8 text-white" />
                      </div>
                      <AnimatedCounter 
                        end={stats.totalInstitutions} 
                        formatter={formatStatNumber}
                        duration={2000}
                      />
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-3">Institutions</div>
                    </div>
                    <div className="group text-center bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-orange-500/20 rounded-3xl p-6 w-[200px] shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:shadow-[0_0_40px_rgba(249,115,22,0.25)] hover:-translate-y-2 transition-all duration-500 ease-out">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <AcademicCapIcon className="w-8 h-8 text-white" />
                      </div>
                      <AnimatedCounter 
                        end={stats.totalPrograms} 
                        formatter={formatStatNumber}
                        duration={2000}
                      />
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-3">Programs</div>
                    </div>
                    <div className="group text-center bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-orange-500/20 rounded-3xl p-6 w-[200px] shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:shadow-[0_0_40px_rgba(249,115,22,0.25)] hover:-translate-y-2 transition-all duration-500 ease-out">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <MapPinIcon className="w-8 h-8 text-white" />
                      </div>
                      <AnimatedCounter 
                        end={stats.statesCovered} 
                        duration={2000}
                      />
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-3">States + DC</div>
                    </div>
                  </>
                )
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/roi-calculator"
                className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] active:scale-95 inline-flex items-center justify-center group"
              >
                Start Calculating ROI
                <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.15)] active:scale-95 inline-flex items-center justify-center group"
              >
                <SparklesIcon className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                View Plans & Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Example ROI Calculation Section */}
      <div className="py-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              See the Real ROI Impact
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium">
              Here's an actual example calculation showing how education investment pays off
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.15)] p-8 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Example Scenario */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="bg-orange-500/20 text-orange-500 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">1</span>
                  Example Scenario
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400 font-medium">Institution:</span>
                    <span className="font-semibold text-white">University of California, Berkeley</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400 font-medium">Program:</span>
                    <span className="font-semibold text-white">Computer Science (B.S.)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400 font-medium">Total Cost (4 years):</span>
                    <span className="font-semibold text-white">$140,000</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400 font-medium">Starting Salary:</span>
                    <span className="font-semibold text-white">$105,000/year</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400 font-medium">Baseline (No Degree):</span>
                    <span className="font-semibold text-white">$35,000/year</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="bg-green-500/20 text-green-400 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">2</span>
                  ROI Results
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="text-sm text-green-400 mb-1 font-semibold">Net ROI (30 years)</div>
                    <div className="text-3xl font-extrabold text-green-400">+$1,960,000</div>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                    <div className="text-sm text-orange-400 mb-1 font-semibold">ROI Percentage</div>
                    <div className="text-3xl font-extrabold text-orange-500">1,400%</div>
                  </div>
                  <div className="bg-orange-600/10 border border-orange-600/20 rounded-lg p-4">
                    <div className="text-sm text-orange-500 mb-1 font-semibold">Payback Period</div>
                    <div className="text-3xl font-extrabold text-orange-500">2.0 years</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800">
              <p className="text-center text-gray-300 mb-4 font-medium">
                This is just one example. Calculate your own ROI with your specific circumstances.
              </p>
              <div className="text-center">
                <Link
                  href="/roi-calculator"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all shadow-[0_0_12px_rgba(249,115,22,0.08)] shadow-orange-500/20"
                >
                  Calculate Your ROI
                  <ArrowRightIcon className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-black border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-300 font-medium">
              Join thousands of students making smarter education decisions
            </p>
          </div>

          <RotatingTestimonials />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-black border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Everything You Need to Make Informed Decisions
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium">
              Our comprehensive platform provides all the tools and data you need to evaluate 
              college programs and make the best investment in your future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
              <Link
                key={index}
                href={feature.href}
                className="group bg-gray-900 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] border border-gray-800 p-6 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:shadow-orange-500/10 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start mb-4">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-orange-500 transition-colors">
                      {feature.title}
                    </h3>
                    {feature.tier === 'premium' && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed text-sm font-medium">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-orange-500 font-bold group-hover:text-orange-400 text-sm">
                  {feature.tier === 'premium' ? 'Upgrade to access' : 'Learn more'}
                  <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="py-20 bg-black border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Powered by Real Data
            </h2>
            <p className="text-xl text-gray-300 font-medium">
              Our platform uses comprehensive, up-to-date information from official sources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => {
              const IconComponent = highlight.icon;
              return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_12px_rgba(249,115,22,0.08)] shadow-orange-500/20">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {highlight.title}
                </h3>
                <p className="text-gray-300 leading-relaxed font-medium">
                  {highlight.description}
                </p>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-black border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium">
              Start free or unlock premium features for deeper insights and advanced tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Explore Plan (Free) */}
            <div className="bg-gray-900 rounded-2xl shadow-[0_0_12px_rgba(249,115,22,0.08)] border-2 border-gray-800 p-8 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:border-gray-700 transition-all flex flex-col">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1 mb-2">
                  <span className="text-2xl">🔍</span>
                  <h3 className="text-2xl font-bold text-white">Explore</h3>
                </div>
                <div className="text-4xl font-extrabold text-white mb-2">
                  $0
                  <span className="text-lg text-gray-400 font-normal">/forever</span>
                </div>
                <p className="text-gray-300 font-medium">Start your journey</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300 font-medium">ROI Calculator</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300 font-medium">College Explorer</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300 font-medium">Data Dashboard</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300 font-medium">My Timeline</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300 font-medium">1 Saved Comparison</span>
                </li>
              </ul>
              <Link
                href="/roi-calculator"
                className="block w-full text-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors shadow-[0_0_10px_rgba(249,115,22,0.08)]"
              >
                {currentTier === 'free' && session ? '✓ Current Plan' : 'Get Started'}
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.15)] border-2 border-orange-500 p-8 relative hover:shadow-orange-500/20 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-all flex flex-col">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-xl text-sm font-bold shadow-[0_0_12px_rgba(249,115,22,0.08)]">
                POPULAR
              </div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1 mb-2">
                  <span className="text-2xl">🚀</span>
                  <h3 className="text-2xl font-bold text-white">Premium</h3>
                </div>
                <div className="text-4xl font-extrabold text-white mb-2">
                  $6.99
                  <span className="text-lg text-gray-400 font-normal">/month</span>
                </div>
                <p className="text-gray-300 font-medium">or $59.99/year (save $24)</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300 font-semibold">Everything in Explore</span>
                </li>
                {/* Historical Trends temporarily hidden */}
                {/* <li className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Historical Trends & Projections</span>
                </li> */}
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300 font-medium">Detailed Salary Analytics</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300 font-medium">Unlimited Saved Scenarios</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300 font-medium">Priority Support</span>
                </li>
              </ul>
              <Link
                href="/pricing"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all shadow-[0_0_12px_rgba(249,115,22,0.08)] shadow-orange-500/30"
              >
                {currentTier === 'premium' ? 'Current Plan' : 'Start Free Trial'}
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-300 mb-4 font-medium">All plans include a 14-day free trial. No credit card required.</p>
            <Link
              href="/pricing"
              className="inline-flex items-center text-orange-500 hover:text-orange-400 font-bold text-lg"
            >
              View detailed pricing comparison
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-orange-600 to-orange-500 border-t border-orange-500/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Explore Your Options?
          </h2>
          <p className="text-xl text-white/90 mb-8 font-medium">
            Start by calculating ROI for programs you're interested in, or browse our comprehensive college database.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/roi-calculator"
              className="bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.1)] shadow-black/30"
            >
              Calculate ROI Now
            </Link>
            <Link
              href="/colleges"
              className="bg-transparent text-white px-8 py-4 rounded-lg font-bold text-lg border-2 border-white hover:bg-white hover:text-orange-600 transition-colors shadow-[0_0_12px_rgba(249,115,22,0.08)]"
            >
              Browse Colleges
            </Link>
          </div>
        </div>
      </div>

      {/* Data Sources Footer */}
      <DataSourcesFooter />

      {/* Legal Footer */}
      <footer className="bg-black text-white py-12 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">CollegeComps</h3>
              <p className="text-gray-400 text-sm font-medium">
                Make smarter education decisions with comprehensive college data and ROI analysis.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/roi-calculator" className="hover:text-orange-500 transition-colors font-medium">ROI Calculator</a></li>
                <li><a href="/compare" className="hover:text-orange-500 transition-colors font-medium">Compare Colleges</a></li>
                <li><a href="/colleges" className="hover:text-orange-500 transition-colors font-medium">College Explorer</a></li>
                <li><a href="/pricing" className="hover:text-orange-500 transition-colors font-medium">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/about" className="hover:text-orange-500 transition-colors font-medium">About Us</a></li>
                <li><a href="/support" className="hover:text-orange-500 transition-colors font-medium">Support</a></li>
                <li><a href="mailto:contact@collegecomps.com" className="hover:text-orange-500 transition-colors font-medium">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/privacy" className="hover:text-orange-500 transition-colors font-medium">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-orange-500 transition-colors font-medium">Terms of Service</a></li>
                <li><a href="mailto:legal@collegecomps.com" className="hover:text-orange-500 transition-colors font-medium">Legal Inquiries</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-900 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-2 font-medium">Help others make better education decisions</p>
                <SocialShare 
                  url="https://www.collegecomps.com"
                  title="CollegeComps - Calculate Your College ROI"
                  description="Make data-driven college decisions with real financial data, salary analytics, and ROI calculations."
                  hashtags={['CollegeROI', 'EducationPlanning', 'CollegeSearch']}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <p className="font-medium">&copy; {new Date().getFullYear()} CollegeComps. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="/privacy" className="hover:text-orange-500 transition-colors font-medium">Privacy</a>
                <a href="/terms" className="hover:text-orange-500 transition-colors font-medium">Terms</a>
                <button 
                  onClick={() => {
                    localStorage.removeItem('cookieConsent');
                    window.location.reload();
                  }} 
                  className="hover:text-orange-500 transition-colors font-medium"
                >
                  Cookie Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
