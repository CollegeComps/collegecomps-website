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
    <div className="flex h-screen bg-gray-800">
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
          fixed inset-y-0 left-0 z-50 bg-black shadow-lg transition-all duration-500 ease-in-out flex flex-col
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isExpanded ? 'w-64' : 'w-20'}
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Sidebar header */}
        <div className="flex items-center h-16 px-4 border-b border-gray-900 flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-all duration-500">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-white">
              <Image 
                src="/logo.svg" 
                alt="CollegeComps Logo" 
                width={48} 
                height={48} 
                className="w-10 h-10 object-contain" 
                priority
                quality={100}
              />
            </div>
            {isExpanded && (
              <h1 className="text-lg font-extrabold text-white whitespace-nowrap transition-opacity duration-500">CollegeComps</h1>
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
                    group flex items-center py-2.5 px-3 text-sm font-medium rounded-lg transition-all duration-500
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

        {/* Footer - Fixed at bottom with logout */}
        <div className="flex-shrink-0 border-t border-gray-900 bg-black">
          <UserMenu isInSidebar={true} isExpanded={isExpanded} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top auth bar - floating on page content */}
        <TopAuthBar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-black">{children}</main>
      </div>
    </div>
  );
}