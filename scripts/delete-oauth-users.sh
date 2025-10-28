#!/bin/bash

# Delete OAuth users from production database
# Usage: TURSO_DATABASE_NAME=collegecomps-users ./delete-oauth-users.sh

set -e

echo "========================================="
echo "OAuth User Deletion Script"
echo "========================================="
echo ""

# Check if TURSO_DATABASE_NAME is set
if [ -z "$TURSO_DATABASE_NAME" ]; then
    echo "ERROR: TURSO_DATABASE_NAME environment variable not set"
    echo "Usage: TURSO_DATABASE_NAME=collegecomps-users ./delete-oauth-users.sh"
    exit 1
fi

echo "Using database: $TURSO_DATABASE_NAME"
echo ""
echo "Step 1: Checking OAuth users in database..."
echo ""

# Count OAuth users
OAUTH_COUNT=$(turso db shell "$TURSO_DATABASE_NAME" "SELECT COUNT(*) FROM users WHERE email_verified = 1 AND (password IS NULL OR password = '')" 2>/dev/null | tail -1)

echo "Found $OAUTH_COUNT OAuth users"
echo ""

if [ "$OAUTH_COUNT" = "0" ]; then
    echo "No OAuth users found. Exiting."
    exit 0
fi

echo "Step 2: Listing OAuth users..."
echo ""

turso db shell "$TURSO_DATABASE_NAME" "SELECT id, email, name, created_at FROM users WHERE email_verified = 1 AND (password IS NULL OR password = '')"

echo ""
echo "========================================="
echo "WARNING: You are about to delete $OAUTH_COUNT users"
echo "========================================="
echo ""
read -p "Type 'DELETE' to confirm deletion: " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
    echo "Deletion cancelled."
    exit 0
fi

echo ""
echo "Step 3: Deleting OAuth users..."

turso db shell "$TURSO_DATABASE_NAME" "DELETE FROM users WHERE email_verified = 1 AND (password IS NULL OR password = '')"

echo ""
echo "OAuth users deleted successfully"
echo ""

# Verify deletion
REMAINING=$(turso db shell "$TURSO_DATABASE_NAME" "SELECT COUNT(*) FROM users WHERE email_verified = 1 AND (password IS NULL OR password = '')" 2>/dev/null | tail -1)

echo "Remaining OAuth users: $REMAINING"
echo "========================================="
