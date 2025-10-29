#!/bin/bash

echo "🔍 Monitoring for login attempts..."
echo "📝 This will show real-time logs from the production deployment"
echo ""
echo "Please attempt to login at: https://collegecomps.com/auth/signin"
echo "Email: admin@collegecomps.com"
echo "Password: Admin123!@#"
echo ""
echo "Watching logs..."
echo "=================================================="
echo ""

# Get the latest production deployment
DEPLOYMENT_URL=$(vercel ls | grep "Production" | head -1 | awk '{print $2}')

if [ -z "$DEPLOYMENT_URL" ]; then
    echo "❌ Could not find production deployment"
    exit 1
fi

echo "Monitoring deployment: $DEPLOYMENT_URL"
echo ""

# Stream logs
vercel logs "$DEPLOYMENT_URL" --json | jq -r 'select(.message | contains("[Auth]")) | "\(.timestamp) - \(.message)"'
