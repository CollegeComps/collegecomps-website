-- Add email verification and unsubscribe fields
-- Run this on the users database

-- Add email verification token fields if they don't exist
ALTER TABLE users ADD COLUMN verification_token TEXT;
ALTER TABLE users ADD COLUMN verification_token_expires TIMESTAMP;

-- Add email preferences (for unsubscribe functionality)
ALTER TABLE users ADD COLUMN email_preferences TEXT DEFAULT '{"marketing":true,"productUpdates":true,"weeklyDigest":true}';

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
