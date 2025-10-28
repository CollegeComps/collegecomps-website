'use client';

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export async function createCheckoutSession(tier: string, billingCycle: 'monthly' | 'annual') {
  try {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, billingCycle }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create checkout session');
    }

    // Redirect to Stripe Checkout
    if (data.url) {
      window.location.href = data.url;
    }

    return data;
  } catch (error) {
    console.error('Checkout error:', error);
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
