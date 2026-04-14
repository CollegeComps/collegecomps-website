'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  CalculatorIcon, 
  BuildingOffice2Icon, 
  AcademicCapIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowsRightLeftIcon,
  CalendarIcon,
  SparklesIcon,
  LifebuoyIcon,
  UserCircleIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  LightBulbIcon,
  GiftIcon,
  BanknotesIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';
import UserMenu from './UserMenu';
import TopAuthBar from './TopAuthBar';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  requiresAuth?: boolean; // Add this flag
}

const navigation: NavItem[] = [
  {
    name: 'ROI Calculator',
    href: '/roi-calculator',
    icon: CalculatorIcon,
    description: 'Calculate return on investment for education',
    requiresAuth: false
  },
  {
    name: 'Career Finder',
    href: '/career-finder',
    icon: LightBulbIcon,
    description: 'Discover careers that match your personality',
    requiresAuth: false
  },
  {
    name: 'Scholarship Finder',
    href: '/scholarships',
    icon: GiftIcon,
    description: 'Find scholarships you qualify for',
    requiresAuth: false
  },
  {
    name: 'Loan Calculator',
    href: '/tools/loan-calculator',
    icon: BanknotesIcon,
    description: 'Calculate student loan payments',
    requiresAuth: false
  },
  {
    name: 'Compare Colleges',
    href: '/compare',
    icon: ArrowsRightLeftIcon,
    description: 'Compare colleges side-by-side',
    requiresAuth: false
  },
  {
    name: 'Recommendations',
    href: '/recommendations',
    icon: SparklesIcon,
    description: 'Get personalized safety/match/reach schools',
    requiresAuth: false
  },
  {
    name: 'Salary Insights',
    href: '/salary-insights',
    icon: CurrencyDollarIcon,
    description: 'Real post-grad salary data from alumni',
    requiresAuth: false
  },
  {
    name: 'ROI Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    description: 'Interactive ROI vs Cost analysis',
    requiresAuth: false
  },
  {
    name: 'Why CollegeComps',
    href: '/articles',
    icon: NewspaperIcon,
    description: 'Learn why ROI matters',
    requiresAuth: false
  },
  {
    name: 'College Explorer',
    href: '/colleges',
    icon: BuildingOffice2Icon,
    description: 'Browse and compare institutions',
    requiresAuth: false
  },
  // {
  //   name: 'Program Analysis',
  //   href: '/programs',
  //   icon: AcademicCapIcon,
  //   description: 'Analyze programs and career outcomes',
  //   requiresAuth: false
  // },
  // Historical Trends temporarily hidden
  // {
  //   name: 'Historical Trends',
  //   href: '/historical-trends',
  //   icon: ArrowTrendingUpIcon,
  //   description: 'View historical data and AI predictions',
  //   requiresAuth: true
  // },
  {
    name: 'Support',
    href: '/support',
    icon: LifebuoyIcon,
    description: 'Get help from our support team',
    requiresAuth: true
  },
];

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Filter navigation based on authentication status
  const visibleNavigation = navigation.filter(item => {
    // If the item doesn't require auth, always show it
    if (!item.requiresAuth) return true;
    // If the item requires auth, only show it if user is logged in
    return !!session?.user;
  });

  return (
    <div className="flex h-screen">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 bg-black/90 backdrop-blur-md shadow-lg transition-all duration-500 ease-in-out flex flex-col
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isExpanded ? 'w-64' : 'w-20'}
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Sidebar header */}
        <div className="flex items-center h-16 px-4 border-b border-gray-900 flex-shrink-0">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-500">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white overflow-hidden">
              <Image
                src="/logo.png"
                alt="CollegeComps Logo"
                width={96}
                height={54}
                className="w-11 h-auto object-contain"
                priority
                quality={100}
              />
            </div>
            {isExpanded && (
              <h1 className="text-xl font-extrabold text-white whitespace-nowrap transition-opacity duration-500">CollegeComps</h1>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-800 absolute right-4"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <div className="space-y-1">
            {visibleNavigation.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center py-2.5 text-sm font-medium rounded-lg transition-all duration-500
                    ${isExpanded ? 'px-3' : 'px-0 justify-center'}
                    ${isActive
                      ? 'bg-orange-500/10 text-orange-500'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                  title={!isExpanded ? item.name : ''}
                >
                  <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                    <IconComponent
                      className={`
                        h-5 w-5 transition-colors duration-150
                        ${isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-orange-500'}
                      `}
                    />
                  </div>
                  {isExpanded && (
                    <span className="ml-3 font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-500">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Reddit community link */}
        <div className={`flex-shrink-0 px-2 pb-2 ${isExpanded ? '' : 'flex justify-center'}`}>
          <a
            href="https://www.reddit.com/r/CollegeComps/"
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center py-2.5 text-sm font-medium rounded-lg transition-all duration-500 text-gray-300 hover:bg-gray-800 hover:text-white ${isExpanded ? 'px-3' : 'px-0 justify-center'}`}
            title={!isExpanded ? 'r/CollegeComps' : ''}
          >
            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-150" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </div>
            {isExpanded && (
              <span className="ml-3 font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-500">r/CollegeComps</span>
            )}
          </a>
        </div>

        {/* Footer - Fixed at bottom with logout */}
        <div className="flex-shrink-0 border-t border-gray-900 bg-black">
          <UserMenu isInSidebar={true} isExpanded={isExpanded} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top auth bar - floating on page content */}
        <TopAuthBar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page content — transparent so starfield shows through behind cards */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}