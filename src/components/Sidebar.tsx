'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  BoltIcon
} from '@heroicons/react/24/outline';
import UserMenu from './UserMenu';

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
    name: 'Compare Colleges',
    href: '/compare',
    icon: ArrowsRightLeftIcon,
    description: 'Compare colleges side-by-side',
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
  {
    name: 'Historical Trends',
    href: '/historical-trends',
    icon: ArrowTrendingUpIcon,
    description: 'View historical data and AI predictions',
    requiresAuth: true
  },
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
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <AcademicCapIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">CollegeComps</h1>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {visibleNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150
                      ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                    `}
                  />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className={`
                      text-xs mt-0.5
                      ${isActive ? 'text-blue-600' : 'text-gray-500'}
                    `}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <div className="mb-3">
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <AcademicCapIcon className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">CollegeComps</span>
            </div>
            <div className="flex items-center">
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}