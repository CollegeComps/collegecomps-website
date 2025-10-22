#!/bin/bash
# Script to populate Turso database with real scholarship data
# Run this to add the scholarship schema and seed data to production

set -e  # Exit on error

echo "🎓 Populating CollegeComps scholarship database..."

# Check if Turso CLI is installed
if ! command -v turso &> /dev/null; then
    echo "❌ Error: Turso CLI not found. Please install it first."
    echo "   brew install chiselstrike/tap/turso"
    exit 1
fi

# Set database name
DB_NAME="collegecomps"

echo "📋 Step 1: Creating scholarship tables..."
turso db shell $DB_NAME < database/scholarship_schema.sql

echo "✅ Schema created successfully!"

echo "📋 Step 2: Populating scholarship data..."
turso db shell $DB_NAME < database/scholarship_seeds.sql

echo "✅ Scholarship data populated successfully!"

# Verify data
echo "📊 Verifying data..."
SCHOLARSHIP_COUNT=$(turso db shell $DB_NAME "SELECT COUNT(*) FROM scholarships WHERE active = 1;" | tail -n 1)

echo "✅ Database now contains $SCHOLARSHIP_COUNT active scholarships!"
echo ""
echo "🎉 Scholarship database population complete!"
echo ""
echo "You can now use the scholarship finder with real data at:"
echo "https://www.collegecomps.com/scholarships"
