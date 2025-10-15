/**
 * Sentry Monitoring Utilities
 * 
 * Helper functions for tracking errors, performance, and user actions in Sentry
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Track a custom event in Sentry
 */
export function trackEvent(eventName: string, data?: Record<string, any>) {
  Sentry.captureMessage(eventName, {
    level: 'info',
    extra: data,
  });
}

/**
 * Track an error with context
 */
export function trackError(error: Error, context?: {
  feature?: string;
  action?: string;
  userId?: string;
  extra?: Record<string, any>;
}) {
  Sentry.captureException(error, {
    tags: {
      feature: context?.feature,
      action: context?.action,
    },
    user: context?.userId ? { id: context.userId } : undefined,
    extra: context?.extra,
  });
}

/**
 * Track a performance transaction
 */
export async function trackPerformance<T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return await Sentry.startSpan(
    {
      name,
      op: 'function',
      attributes: metadata,
    },
    async () => {
      return await operation();
    }
  );
}

/**
 * Track API route performance
 */
export function trackAPIRoute(routeName: string, method: string, callback: () => void) {
  return Sentry.startSpan(
    {
      name: `${method} ${routeName}`,
      op: 'http.server',
      attributes: {
        'http.method': method,
        'http.route': routeName,
      },
    },
    callback
  );
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  tier?: string;
}) {
  Sentry.setUser({
    id: user.id,
    // Only set email in development
    ...(process.env.NODE_ENV === 'development' && user.email ? { email: user.email } : {}),
    tier: user.tier,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for user action tracking
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    level: 'info',
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Track critical business events
 */
export const BusinessEvents = {
  userSignup: (userId: string) => {
    trackEvent('User Signup', { userId });
    addBreadcrumb('User signed up', { userId });
  },

  userLogin: (userId: string) => {
    trackEvent('User Login', { userId });
    setUserContext({ id: userId });
  },

  roiCalculation: (userId?: string) => {
    trackEvent('ROI Calculation', { userId });
    addBreadcrumb('ROI calculation performed');
  },

  collegeComparison: (collegeCount: number, userId?: string) => {
    trackEvent('College Comparison', { collegeCount, userId });
    addBreadcrumb('College comparison', { collegeCount });
  },

  premiumUpgrade: (userId: string, plan: string) => {
    trackEvent('Premium Upgrade', { userId, plan });
    addBreadcrumb('User upgraded to premium', { userId, plan });
  },

  emailVerification: (userId: string, success: boolean) => {
    trackEvent('Email Verification', { userId, success });
  },

  passwordReset: (userId: string) => {
    trackEvent('Password Reset', { userId });
  },

  apiError: (endpoint: string, error: string, statusCode: number) => {
    trackError(new Error(`API Error: ${endpoint}`), {
      feature: 'api',
      action: endpoint,
      extra: { error, statusCode },
    });
  },

  databaseError: (query: string, error: string) => {
    trackError(new Error('Database Error'), {
      feature: 'database',
      action: 'query',
      extra: { query, error },
    });
  },

  paymentError: (userId: string, error: string) => {
    trackError(new Error('Payment Error'), {
      feature: 'payments',
      userId,
      extra: { error },
    });
  },
};

/**
 * Performance monitoring helpers
 */
export const Performance = {
  async trackDatabaseQuery<T>(
    queryName: string,
    query: () => Promise<T>
  ): Promise<T> {
    return trackPerformance(`db:${queryName}`, query);
  },

  async trackAPICall<T>(
    endpoint: string,
    call: () => Promise<T>
  ): Promise<T> {
    return trackPerformance(`api:${endpoint}`, call);
  },

  async trackPageLoad<T>(
    pageName: string,
    load: () => Promise<T>
  ): Promise<T> {
    return trackPerformance(`page:${pageName}`, load);
  },
};
