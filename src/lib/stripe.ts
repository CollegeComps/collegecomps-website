import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

// Stripe product IDs (different for dev/prod environments)
export const STRIPE_PRODUCTS = {
  premium: {
    monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
    annual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || '',
  },
};

// Webhook secret for verifying Stripe events
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
