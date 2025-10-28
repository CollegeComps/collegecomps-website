-- Migration: Add stripe_customer_id column to users table
-- This column stores the Stripe customer ID for each user to manage subscriptions

ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
