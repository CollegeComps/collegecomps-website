'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataSourcesFooter } from '@/components/DataSources';
import { OrganizationSchema, WebApplicationSchema } from '@/components/StructuredData';
import SocialShare from '@/components/SocialShare';
import AnimatedCounter from '@/components/AnimatedCounter';
import HeroSearchBar from '@/components/HeroSearchBar';
import {
  CalculatorIcon,
  BuildingOffice2Icon,
  AcademicCapIcon,
  ChartBarIcon,
  MapPinIcon,
  ArrowRightIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface DatabaseStats {
  totalInstitutions: number;
  totalPrograms: number;
  statesCovered: number;
}

// Format large numbers with better display
// For institutions: round to nearest thousand (e.g., "6000+")
// For programs: use M suffix (e.g., "8.9M+")
function formatStatNumber(num: number, type?: 'institutions' | 'programs' | 'states'): string {
  if (type === 'institutions') {
    // Round to nearest thousand and add + sign
    const rounded = Math.round(num / 1000) * 1000;
    return `${rounded.toLocaleString()}+`;
  } else if (type === 'programs') {
    // Use M suffix for millions (programs)
    if (num >= 1000000) {
      const millions = Math.floor(num / 100000) / 10;
      return `${millions.toFixed(1)}M+`;
    }
  }
  // For states, just return the number as-is
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
    color: 'bg-gradient-to-br from-blue-500 to-pink-500',
    stats: 'Real salary data',
    tier: 'free'
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
      {/* Structured Data for SEO */}
      <OrganizationSchema />
      <WebApplicationSchema />
      
      {/* Hero Section */}
      <div className="relative bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-orange-950/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-600/10 to-transparent rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <p className="text-orange-500 font-bold text-sm sm:text-base uppercase tracking-widest mb-4">
              Stop Guessing. Start Calculating.
            </p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Which Degree Path Is Best for Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">
                Financial Future?
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Compare the ROI of undergraduate degrees, trade schools, and graduate programs.
              Get the hard data on tuition vs. earnings before you make life's most important investment.
            </p>

            {/* Inline Search Bar */}
            <div className="mb-12">
              <HeroSearchBar />
            </div>

            {/* Compact Stats Row */}
            {!loading && stats && (
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <BuildingOffice2Icon className="w-4 h-4 text-orange-500" />
                  <AnimatedCounter end={stats.totalInstitutions} formatter={(num) => formatStatNumber(num, 'institutions')} duration={2000} />
                  <span>institutions</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <AcademicCapIcon className="w-4 h-4 text-orange-500" />
                  <AnimatedCounter end={stats.totalPrograms} formatter={(num) => formatStatNumber(num, 'programs')} duration={2000} />
                  <span>programs</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="w-4 h-4 text-orange-500" />
                  <AnimatedCounter end={stats.statesCovered} formatter={(num) => formatStatNumber(num, 'states')} duration={2000} />
                  <span>states + DC</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Persona Tiles */}
      <div className="py-16 bg-gradient-to-b from-black to-gray-950 border-t border-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tile 1: College-bound */}
            <Link
              href="/colleges"
              className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                <MagnifyingGlassIcon className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">
                &ldquo;Is my dream school a trap?&rdquo;
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Check ROI for 6,000+ universities. See the debt-to-income ratios that colleges won&apos;t show you.
              </p>
              <span className="text-orange-500 font-bold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Colleges <ArrowRightIcon className="w-4 h-4" />
              </span>
            </Link>

            {/* Tile 2: Alternative seeker */}
            <Link
              href="/career-finder"
              className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                <WrenchScrewdriverIcon className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">
                &ldquo;I want a high-paying career without the 4-year degree.&rdquo;
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Discover trade schools and certifications with the highest immediate ROI.
              </p>
              <span className="text-orange-500 font-bold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Find Alternatives <ArrowRightIcon className="w-4 h-4" />
              </span>
            </Link>

            {/* Tile 3: Career switcher */}
            <Link
              href="/compare"
              className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                <ArrowPathIcon className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">
                &ldquo;I&apos;m stuck and need to pivot.&rdquo;
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Compare career-switcher paths. See which credentials actually lead to a raise.
              </p>
              <span className="text-orange-500 font-bold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Compare Career Paths <ArrowRightIcon className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Path Comparison Section */}
      <div className="py-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              See the Reality: Degree vs. Alternatives
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium">
              Compare the 10-year ROI of different education paths in technology
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Comparison Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.15)] overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-5 bg-gray-800/50 border-b border-gray-700">
                <div className="p-4 text-sm font-bold text-gray-400">Path</div>
                <div className="p-4 text-sm font-bold text-gray-400 text-center">Cost</div>
                <div className="p-4 text-sm font-bold text-gray-400 text-center">Time</div>
                <div className="p-4 text-sm font-bold text-gray-400 text-center">Median Salary</div>
                <div className="p-4 text-sm font-bold text-gray-400 text-center">10-Year ROI</div>
              </div>

              {/* CS Degree Row */}
              <div className="grid grid-cols-5 border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <AcademicCapIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-white">CS Degree</div>
                      <div className="text-xs text-gray-500">State University</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 text-center text-sm font-semibold text-white">$80,000</div>
                <div className="p-4 text-center text-sm text-gray-300">4 years</div>
                <div className="p-4 text-center text-sm font-semibold text-white">$95,000</div>
                <div className="p-4 text-center">
                  <span className="text-sm font-bold text-green-400">+$520K</span>
                </div>
              </div>

              {/* Bootcamp Row */}
              <div className="grid grid-cols-5 border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <WrenchScrewdriverIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-white">Coding Bootcamp</div>
                      <div className="text-xs text-gray-500">14-week intensive</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 text-center text-sm font-semibold text-white">$15,000</div>
                <div className="p-4 text-center text-sm text-gray-300">14 weeks</div>
                <div className="p-4 text-center text-sm font-semibold text-white">$75,000</div>
                <div className="p-4 text-center">
                  <span className="text-sm font-bold text-green-400">+$680K</span>
                </div>
              </div>

              {/* Certification Row */}
              <div className="grid grid-cols-5 hover:bg-gray-800/30 transition-colors">
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-white">AWS Certification</div>
                      <div className="text-xs text-gray-500">Self-paced + exam</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 text-center text-sm font-semibold text-white">$3,000</div>
                <div className="p-4 text-center text-sm text-gray-300">3 months</div>
                <div className="p-4 text-center text-sm font-semibold text-white">$65,000</div>
                <div className="p-4 text-center">
                  <span className="text-sm font-bold text-green-400">+$590K</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm mb-4">
                These are illustrative examples. Calculate your specific ROI with real data from our database.
              </p>
              <Link
                href="/roi-calculator"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg"
              >
                Calculate Your ROI
                <ArrowRightIcon className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
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
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed text-sm font-medium">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-orange-500 font-bold group-hover:text-orange-400 text-sm">
                  Learn more
                  <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Data Trust Section */}
      <div className="py-16 bg-black border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Powered by Verified Federal Data
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium">
              Every calculation is backed by the same data the U.S. government uses to evaluate institutions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gray-900 border border-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:border-orange-500/50 transition-colors">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-sm">IPEDS</h3>
              <p className="text-xs text-gray-400 mt-1">Federal education data</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gray-900 border border-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:border-orange-500/50 transition-colors">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-sm">Bureau of Labor Statistics</h3>
              <p className="text-xs text-gray-400 mt-1">Salary &amp; employment data</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gray-900 border border-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:border-orange-500/50 transition-colors">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-sm">College Scorecard</h3>
              <p className="text-xs text-gray-400 mt-1">U.S. Dept. of Education</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gray-900 border border-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:border-orange-500/50 transition-colors">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-sm">Urban Institute</h3>
              <p className="text-xs text-gray-400 mt-1">Education Data Portal</p>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-8 max-w-2xl mx-auto">
            All data is sourced from publicly available federal databases. No paid placements. No sponsored rankings.
            <Link href="/about/methodology" className="text-orange-500 hover:text-orange-400 ml-1 font-medium">See our methodology</Link>
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-orange-800 to-orange-700 border-t border-orange-700/20">
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

      {/* Browse By Section - Internal Linking for SEO */}
      <div className="py-16 bg-black border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Browse by State */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-white mb-4">Browse Colleges by State</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { code: 'ca', name: 'California' }, { code: 'ny', name: 'New York' }, { code: 'tx', name: 'Texas' },
                { code: 'fl', name: 'Florida' }, { code: 'il', name: 'Illinois' }, { code: 'pa', name: 'Pennsylvania' },
                { code: 'oh', name: 'Ohio' }, { code: 'ma', name: 'Massachusetts' }, { code: 'nc', name: 'North Carolina' },
                { code: 'ga', name: 'Georgia' }, { code: 'mi', name: 'Michigan' }, { code: 'va', name: 'Virginia' },
                { code: 'wa', name: 'Washington' }, { code: 'co', name: 'Colorado' }, { code: 'az', name: 'Arizona' },
                { code: 'mn', name: 'Minnesota' }, { code: 'nj', name: 'New Jersey' }, { code: 'in', name: 'Indiana' },
                { code: 'wi', name: 'Wisconsin' }, { code: 'md', name: 'Maryland' }, { code: 'tn', name: 'Tennessee' },
                { code: 'mo', name: 'Missouri' }, { code: 'ct', name: 'Connecticut' }, { code: 'or', name: 'Oregon' },
              ].map((s) => (
                <Link
                  key={s.code}
                  href={`/colleges/state/${s.code}`}
                  className="text-xs text-gray-400 hover:text-orange-500 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg transition-colors hover:border-orange-500/30"
                >
                  {s.name}
                </Link>
              ))}
              <Link
                href="/colleges"
                className="text-xs text-orange-500 hover:text-orange-400 bg-gray-900 border border-orange-500/30 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                All States →
              </Link>
            </div>
          </div>

          {/* Browse by Major */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Browse Programs by Major</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { cip: '11', name: 'Computer Science' }, { cip: '14', name: 'Engineering' },
                { cip: '52', name: 'Business' }, { cip: '51', name: 'Health Professions' },
                { cip: '26', name: 'Biology' }, { cip: '42', name: 'Psychology' },
                { cip: '13', name: 'Education' }, { cip: '45', name: 'Social Sciences' },
                { cip: '27', name: 'Mathematics' }, { cip: '40', name: 'Physical Sciences' },
                { cip: '50', name: 'Arts' }, { cip: '23', name: 'English' },
                { cip: '22', name: 'Legal Studies' }, { cip: '09', name: 'Communication' },
              ].map((m) => (
                <Link
                  key={m.cip}
                  href={`/programs/${m.cip}`}
                  className="text-xs text-gray-400 hover:text-orange-500 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg transition-colors hover:border-orange-500/30"
                >
                  {m.name}
                </Link>
              ))}
              <Link
                href="/programs"
                className="text-xs text-orange-500 hover:text-orange-400 bg-gray-900 border border-orange-500/30 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                All Programs →
              </Link>
            </div>
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
                <li><a href="/articles" className="hover:text-orange-500 transition-colors font-medium">Why CollegeComps</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/about" className="hover:text-orange-500 transition-colors font-medium">About Us</a></li>
                <li><a href="/support" className="hover:text-orange-500 transition-colors font-medium">Support</a></li>
                <li><a href="mailto:fpapalardo@collegecomps.com" className="hover:text-orange-500 transition-colors font-medium">Contact</a></li>
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
