-- Delete users created via OAuth (Google, GitHub, etc.)
-- These users have email_verified = 1 and no password hash
-- Run this against production database after backup

-- First, check how many users will be deleted
SELECT COUNT(*) as oauth_users_count
FROM users 
WHERE email_verified = 1 
  AND (password IS NULL OR password = '');

-- View the users that will be deleted (for verification)
SELECT id, email, name, created_at
FROM users 
WHERE email_verified = 1 
  AND (password IS NULL OR password = '');

-- Delete OAuth users
-- UNCOMMENT THE LINE BELOW TO EXECUTE THE DELETION
-- DELETE FROM users WHERE email_verified = 1 AND (password IS NULL OR password = '');
