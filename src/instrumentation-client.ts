// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a8494b0d749f577bb2a9c51c3bccbcf0@o4510194660933632.ingest.us.sentry.io/4510194665390080",

  // Lower sample rate in production to reduce quota usage
  tracesSampleRate: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 0.1 : 1.0,

  // Disable PII for privacy compliance
  sendDefaultPii: false,

  // Set environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',

  // Enhanced browser tracing
  integrations: [
    Sentry.browserTracingIntegration(),
  ],

  // Track requests to our API
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/www\.collegecomps\.com/,
    /^https:\/\/collegecomps\.com/
  ],

  // Before sending to Sentry, scrub sensitive data
  beforeSend(event, hint) {
    // Filter out sensitive form data
    if (event.request?.data) {
      const data = event.request.data as any;
      if (data.password) data.password = '[Filtered]';
      if (data.token) data.token = '[Filtered]';
    }

    // Add user context (but not PII)
    if (event.user) {
      event.user = {
        id: event.user.id,
        // Remove email and other PII
      };
    }

    return event;
  },

  // Ignore common browser errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Random plugins/extensions
    'atomicFindClose',
    // Facebook related
    'fb_xd_fragment',
    // Network errors that aren't actionable
    'NetworkError when attempting to fetch resource',
    'Failed to fetch',
    // User cancellations
    'AbortError',
    'The operation was aborted',
    'cancelled',
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;