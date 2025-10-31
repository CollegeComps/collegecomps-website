'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import AuthModal from './AuthModal';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface UserMenuProps {
  isInSidebar?: boolean;
  isExpanded?: boolean;
}

export default function UserMenu({ isInSidebar = false, isExpanded = false }: UserMenuProps) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position based on available space
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const dropdownHeight = 400; // Approximate dropdown height

      // If more space above or not enough space below, show dropdown above
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    // Use redirect: true to force full page reload and clear client-side cache
    await signOut({ callbackUrl: '/', redirect: true });
  };

  const openAuthModal = (tab: 'signin' | 'signup') => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  if (!session?.user) {
    return (
      <>
        {/* Hide auth buttons on mobile to avoid clutter - only show on md and up */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => openAuthModal('signin')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuthModal('signup')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Get Started
          </button>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab={authTab}
        />
      </>
    );
  }

  const isPremium = session?.user?.subscriptionTier === 'premium';

  // Sidebar version - simple logout button (only show if logged in)
  if (isInSidebar && session?.user) {
    return (
      <div className="p-3">
        <button
          onClick={handleSignOut}
          className={`
            group flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 w-full
            text-gray-300 hover:bg-gray-900 hover:text-white
            ${!isExpanded ? 'justify-center' : ''}
          `}
          title={!isExpanded ? 'Sign Out' : ''}
        >
          <ArrowRightOnRectangleIcon
            className={`
              h-5 w-5 flex-shrink-0 transition-colors duration-150
              text-gray-400 group-hover:text-orange-500
              ${isExpanded ? 'mr-3' : ''}
            `}
          />
          {isExpanded && (
            <span className="font-semibold text-sm whitespace-nowrap">Sign Out</span>
          )}
        </button>
      </div>
    );
  }

  // Sidebar version - don't show anything for non-logged in users
  if (isInSidebar && !session?.user) {
    return null;
  }

  // Top bar version - update styling for dark background
  if (!session?.user) {
    return (
      <>
        {/* Auth buttons with better visibility on dark background */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => openAuthModal('signin')}
            className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuthModal('signup')}
            className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            Get Started
          </button>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab={authTab}
        />
      </>
    );
  }

  // Top bar version continues below
  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-gray-800 rounded-lg p-2 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
            {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
          </div>
          {isPremium && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full">
              PRO
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute right-0 w-72 bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden z-50 ${
            dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-800 bg-gradient-to-r from-orange-500/10 to-orange-600/10">
            <p className="text-sm font-bold text-white">{session.user.name || 'User'}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{session.user.email}</p>
            {!isPremium && (
              <Link
                href="/pricing"
                className="mt-2 block text-xs text-center font-bold text-white hover:text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 rounded-lg px-3 py-1.5 transition-all"
              >
                Upgrade to Premium
              </Link>
            )}
            {isPremium && (
              <div className="mt-2 flex items-center justify-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold py-1 px-3 rounded-lg">
                <span>Premium Member</span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/submit-salary"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-orange-500 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="font-semibold">Submit Salary Data</span>
            </Link>
            <Link
              href="/saved-comparisons"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-orange-500 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="font-semibold">Saved Comparisons</span>
              {!isPremium && (
                <span className="ml-auto px-2 py-0.5 text-xs bg-orange-500/20 text-orange-500 rounded-full font-bold">
                  PRO
                </span>
              )}
            </Link>
            
            <div className="my-1 border-t border-gray-800"></div>
            
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-orange-500 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-semibold">Settings</span>
            </Link>
            {isPremium && (
              <Link
                href="/subscription"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-orange-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="font-semibold">Subscription</span>
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-800 pt-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-orange-500 hover:bg-gray-800 hover:text-orange-400 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
