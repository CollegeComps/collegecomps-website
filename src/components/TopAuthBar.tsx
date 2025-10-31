'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from './UserMenu';

interface TopAuthBarProps {
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
}

export default function TopAuthBar({ onMenuClick, showMobileMenu = true }: TopAuthBarProps) {
  const { data: session, status } = useSession();

  return (
    <div className="fixed top-0 right-0 z-40 p-4 lg:p-6 flex items-center gap-4">
      {/* Mobile menu button - only show on small screens */}
      {showMobileMenu && onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-900/50"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      )}
      
      {/* User menu or auth buttons */}
      <div className="flex items-center">
        <UserMenu />
      </div>
    </div>
  );
}
