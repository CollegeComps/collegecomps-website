'use client';

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export async function createCheckoutSession(tier: string, billingCycle: 'monthly' | 'annual') {
  console.log('[createCheckoutSession] Starting with:', { tier, billingCycle });
  
  try {
    console.log('[createCheckoutSession] Fetching /api/stripe/checkout');
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, billingCycle }),
    });

    console.log('[createCheckoutSession] Response status:', response.status, response.ok);
    const data = await response.json();
    console.log('[createCheckoutSession] Response data:', data);

    if (!response.ok) {
      console.error('[createCheckoutSession] Request failed:', data);
      throw new Error(data.error || 'Failed to create checkout session');
    }

    // Redirect to Stripe Checkout
    if (data.url) {
      console.log('[createCheckoutSession] Redirecting to Stripe:', data.url.substring(0, 50) + '...');
      window.location.href = data.url;
    } else {
      console.error('[createCheckoutSession] No URL in response');
    }

    return data;
  } catch (error) {
    console.error('[createCheckoutSession] Error:', error);
    throw error;
  }
}

export async function createCustomerPortalSession() {
  try {
    const response = await fetch('/api/stripe/portal', {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create portal session');
    }

    // Redirect to Stripe Customer Portal
    if (data.url) {
      window.location.href = data.url;
    }

    return data;
  } catch (error) {
    console.error('Portal error:', error);
    throw error;
  }
}
