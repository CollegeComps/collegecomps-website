'use client';

import Script from 'next/script';

/**
 * Google Analytics 4 loader.
 *
 * strategy="lazyOnload" defers the script until after the window load event.
 * This keeps GA off the Time To Interactive (TBT) critical path — saves
 * ~600ms+ TBT on slower devices. Trade-off: if a user bounces before
 * window load, their pageview isn't recorded. Acceptable for most cases
 * since GA4 also catches pageviews on visibility/engagement signals.
 */
export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
