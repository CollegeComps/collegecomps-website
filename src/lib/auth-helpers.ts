import { Session } from 'next-auth';
import { NextResponse } from 'next/server';

/**
 * Subscription tier types
 */
export type SubscriptionTier = 'free' | 'premium';

/**
 * Check if a user has a specific subscription tier or higher
 */
export function hasMinimumTier(
  session: Session | null,
  requiredTier: SubscriptionTier
): boolean {
  if (!session?.user) return false;

  const user = session.user as any;
  // Check both camelCase (NextAuth session) and snake_case (database) formats
  const userTier = user.subscriptionTier || user.subscription_tier || 'free';

  // Admin users have access to all features
  if (user.role === 'admin' || user.email?.endsWith('@collegecomps.com')) {
    return true;
  }

  if (requiredTier === 'free') return true;
  if (requiredTier === 'premium') return userTier === 'premium';

  return false;
}

/**
 * Middleware to check authentication and return error response if not authenticated
 */
export function requireAuth(session: Session | null) {
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to access this feature.' },
      { status: 401 }
    );
  }
  return null;
}

/**
 * Middleware to check subscription tier and return error response if insufficient
 */
export function requireTier(
  session: Session | null,
  requiredTier: SubscriptionTier
) {
  // First check authentication
  const authError = requireAuth(session);
  if (authError) return authError;

  // Then check tier
  if (!hasMinimumTier(session, requiredTier)) {
    return NextResponse.json(
      {
        error: `This feature requires a ${requiredTier} subscription.`,
        requiredTier,
        upgrade: true,
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Check if user is an admin
 */
export function isAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  const user = session.user as any;
  return user.role === 'admin' || user.email?.endsWith('@collegecomps.com');
}

/**
 * Middleware to require admin access
 */
export function requireAdmin(session: Session | null) {
  const authError = requireAuth(session);
  if (authError) return authError;

  if (!isAdmin(session)) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Get user tier from session
 */
export function getUserTier(session: Session | null): SubscriptionTier {
  if (!session?.user) return 'free';
  const user = session.user as any;
  // Check both camelCase (NextAuth session) and snake_case (database) formats
  return (user.subscriptionTier || user.subscription_tier || 'free') as SubscriptionTier;
}

/**
 * Check if user owns a resource
 */
export function checkOwnership(
  session: Session | null,
  resourceUserId: number | string
): boolean {
  if (!session?.user) return false;
  const user = session.user as any;
  return String(user.id) === String(resourceUserId);
}

/**
 * Middleware to require ownership of a resource
 */
export function requireOwnership(
  session: Session | null,
  resourceUserId: number | string
) {
  const authError = requireAuth(session);
  if (authError) return authError;

  // Admins can access any resource
  if (isAdmin(session)) return null;

  if (!checkOwnership(session, resourceUserId)) {
    return NextResponse.json(
      { error: 'Access denied. You do not own this resource.' },
      { status: 403 }
    );
  }

  return null;
}
