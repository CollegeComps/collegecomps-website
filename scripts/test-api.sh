#!/bin/bash
# Comprehensive API Testing Script for CollegeComps Features
# Tests ROI sorting, proximity filtering, and combined filters

echo "🧪 CollegeComps API Test Suite"
echo "=============================="
echo ""

API_BASE="http://localhost:3000/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
pass_count=0
fail_count=0

# Helper function to run test
run_test() {
  local test_name="$1"
  local endpoint="$2"
  local expected_pattern="$3"
  
  test_count=$((test_count + 1))
  echo -e "${YELLOW}Test $test_count: $test_name${NC}"
  echo "  Endpoint: $endpoint"
  
  response=$(curl -s "$API_BASE/$endpoint")
  
  if echo "$response" | grep -q "$expected_pattern"; then
    echo -e "  ${GREEN}✓ PASS${NC}"
    pass_count=$((pass_count + 1))
  else
    echo -e "  ${RED}✗ FAIL${NC}"
    echo "  Expected pattern: $expected_pattern"
    echo "  Response: ${response:0:200}..."
    fail_count=$((fail_count + 1))
  fi
  echo ""
}

echo "🔧 Prerequisites Check"
echo "----------------------"
echo "Checking if dev server is running..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Dev server is running${NC}"
else
  echo -e "${RED}✗ Dev server not running. Please start with: npm run dev${NC}"
  exit 1
fi
echo ""

echo "📊 Part 1: ROI Sorting Tests"
echo "-----------------------------"

run_test "Default sort (should be ROI)" \
  "institutions?limit=5" \
  "implied_roi"

run_test "Explicit ROI sort (high to low)" \
  "institutions?sortBy=implied_roi&limit=5" \
  "institutions"

run_test "ROI sort (low to high)" \
  "institutions?sortBy=roi_low&limit=5" \
  "institutions"

run_test "Verify ROI values present" \
  "institutions?sortBy=implied_roi&limit=1" \
  "implied_roi"

echo "📍 Part 2: Proximity Filter Tests"
echo "----------------------------------"

run_test "Cambridge, MA - 50 mile radius" \
  "institutions?proximityZip=02138&radiusMiles=50" \
  "distance_miles"

run_test "New York, NY - 25 mile radius" \
  "institutions?proximityZip=10001&radiusMiles=25" \
  "distance_miles"

run_test "San Francisco, CA - 100 mile radius" \
  "institutions?proximityZip=94102&radiusMiles=100" \
  "distance_miles"

run_test "Invalid zip code handling" \
  "institutions?proximityZip=00000&radiusMiles=50" \
  "error"

run_test "Small radius (should have fewer results)" \
  "institutions?proximityZip=02138&radiusMiles=5" \
  "institutions"

echo "🔀 Part 3: Combined Filter Tests"
echo "---------------------------------"

run_test "Proximity + Max Tuition" \
  "institutions?proximityZip=02138&radiusMiles=50&maxTuition=30000" \
  "institutions"

run_test "Proximity + Public schools" \
  "institutions?proximityZip=10001&radiusMiles=50&control=1" \
  "institutions"

run_test "Proximity + Min Earnings" \
  "institutions?proximityZip=94102&radiusMiles=100&minEarnings=60000" \
  "institutions"

run_test "State + ROI sort" \
  "institutions?state=MA&sortBy=implied_roi&limit=10" \
  "implied_roi"

run_test "Proximity + ROI sort" \
  "institutions?proximityZip=60601&radiusMiles=50&sortBy=implied_roi&limit=10" \
  "distance_miles"

echo "🎓 Part 4: Specific Institution Tests"
echo "--------------------------------------"

run_test "Get institution by UNITID (Harvard)" \
  "institutions?unitid=166027" \
  "Harvard"

run_test "Search by name" \
  "institutions?search=MIT&limit=5" \
  "Massachusetts Institute"

run_test "Filter by state" \
  "institutions?state=CA&limit=10" \
  "California"

echo ""
echo "📊 Test Summary"
echo "==============="
echo -e "Total Tests: $test_count"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"

if [ $fail_count -eq 0 ]; then
  echo -e "\n${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}⚠️  Some tests failed. Please review.${NC}"
  exit 1
fi
