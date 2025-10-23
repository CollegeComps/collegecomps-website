#!/bin/bash
# Deploy scholarship data to production database
# Run this script after merging scholarship PR to deploy the SQL seeds

set -e  # Exit on error

echo "========================================"
echo "Scholarship Data Deployment"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "database/scholarship_schema.sql" ]; then
    echo "Error: Run this script from the collegecomps-web directory"
    exit 1
fi

# Confirm deployment
echo "This will deploy scholarship data to PRODUCTION database: collegecomps"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "Starting deployment..."
echo ""

# Deploy schema (if not exists)
echo "1. Deploying scholarship schema..."
turso db shell collegecomps < database/scholarship_schema.sql
echo "   ✓ Schema deployed"

# Deploy initial seeds
echo "2. Deploying initial scholarship seeds..."
turso db shell collegecomps < database/scholarship_seeds.sql
echo "   ✓ Initial seeds deployed"

# Deploy expanded seeds
echo "3. Deploying expanded scholarship seeds..."
turso db shell collegecomps < database/scholarship_seeds_expanded.sql
echo "   ✓ Expanded seeds deployed"

# Deploy phase 2 seeds
echo "4. Deploying phase 2 scholarship seeds..."
turso db shell collegecomps < database/scholarship_seeds_phase2.sql
echo "   ✓ Phase 2 seeds deployed"

# Deploy phase 3 seeds
echo "5. Deploying phase 3 scholarship seeds..."
turso db shell collegecomps < database/scholarship_seeds_phase3.sql
echo "   ✓ Phase 3 seeds deployed"

echo ""
echo "========================================"
echo "Verifying deployment..."
echo "========================================"

# Verify scholarship count
echo ""
echo "Scholarship counts:"
turso db shell collegecomps "SELECT COUNT(*) as total FROM scholarships;"
turso db shell collegecomps "SELECT COUNT(*) as active FROM scholarships WHERE active = 1;"

echo ""
echo "Top 5 scholarships by amount:"
turso db shell collegecomps "SELECT name, organization, amount_max FROM scholarships ORDER BY amount_max DESC LIMIT 5;"

echo ""
echo "========================================"
echo "✓ Deployment complete!"
echo "========================================"
echo ""
echo "Summary:"
echo "- All scholarship phases deployed"
echo "- Database: collegecomps (production)"
echo "- Total scholarships should be 250+"
echo ""
