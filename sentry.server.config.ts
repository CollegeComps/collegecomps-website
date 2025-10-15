// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a8494b0d749f577bb2a9c51c3bccbcf0@o4510194660933632.ingest.us.sentry.io/4510194665390080",

  // Adjust this value in production (0.1 = 10% of transactions)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable sending user PII - useful for debugging but be GDPR compliant
  sendDefaultPii: false, // Changed to false for privacy

  // Set environment
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',

  // Enable performance monitoring for critical operations
  integrations: [
    Sentry.prismaIntegration(),
  ],

  // Before sending to Sentry, scrub sensitive data
  beforeSend(event, hint) {
    // Don't send health check errors
    if (event.request?.url?.includes('/api/health')) {
      return null;
    }

    // Scrub sensitive data from request body
    if (event.request?.data) {
      const data = event.request.data as any;
      if (data.password) data.password = '[Filtered]';
      if (data.email) data.email = data.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
      if (data.token) data.token = '[Filtered]';
    }

    return event;
  },

  // Ignore common non-critical errors
  ignoreErrors: [
    // Browser extensions
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    // Network errors
    'NetworkError',
    'Failed to fetch',
    // User cancellations
    'AbortError',
    'cancelled',
  ],
});
