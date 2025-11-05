-- Add subscription management columns to users table
-- These columns support subscription cancellation and expiration tracking

ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN subscription_expires_at DATETIME;

-- Create index for efficient querying of subscription status
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_tier, subscription_status);

-- Update existing premium users to have 'active' status
UPDATE users 
SET subscription_status = 'active' 
WHERE subscription_tier = 'premium' AND subscription_status IS NULL;
