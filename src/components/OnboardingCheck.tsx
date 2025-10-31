'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        // Skip check for certain pages
        const skipPaths = ['/onboarding', '/auth/signin', '/auth/signup', '/api'];
        if (pathname && skipPaths.some(path => pathname.startsWith(path))) {
          setChecked(true);
          return;
        }

        try {
          const response = await fetch('/api/user/onboarding');
          if (response.ok) {
            const data = await response.json();
            if (!data.onboarding_completed) {
              router.push('/onboarding');
              return;
            }
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        }
        
        setChecked(true);
      } else {
        setChecked(true);
      }
    };

    checkOnboarding();
  }, [status, session, router, pathname]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
