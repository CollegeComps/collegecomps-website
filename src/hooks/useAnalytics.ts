import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export function useAnalytics() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const trackEvent = async (eventType: string, eventData?: any) => {
    if (!session?.user?.id) return;

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          eventData,
          pageUrl: pathname
        })
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  // Track page views automatically
  useEffect(() => {
    if (session?.user?.id) {
      trackEvent('page_view', { page: pathname });
    }
  }, [pathname, session]);

  return { trackEvent };
}
