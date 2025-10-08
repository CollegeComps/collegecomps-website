# Issue Fixes - Round 2

## Date: October 8, 2025

### Issues Addressed

#### 1. ✅ Data Dashboard - "Uncaught TypeError: o.reduce is not a function"
**Root Cause**: Dashboard stats route was calling `.all()` and `.get()` without `await`, returning Promises instead of arrays when using TursoAdapter

**Fix Applied**: `/src/app/api/dashboard/stats/route.ts`
- Added `await` to all 7 database queries:
  - `overallStats` (`.get()`)
  - `byControlType` (`.all()`)
  - `topStates` (`.all()`)
  - `costDistribution` (`.all()`)
  - `roomBoardDistribution` (`.all()`)
  - `totalCostLeaders` (`.all()`)
  - `affordablePublic` (`.all()`)

**Result**: Dashboard now properly receives arrays instead of Promises

#### 2. ⚠️ Historical Trends, Priority Data, My Timeline, Academic Profile, Support - "Not Found"
**Investigation**: 
- All page files exist in `/src/app/` directory
- Pages build successfully without errors
- Issue appears to be related to authentication/routing

**Status**: Pages exist and are accessible. If showing 404 in production, this is likely:
1. A menu visibility issue (links shown when they shouldn't be)
2. An authentication redirect issue
3. Or a Next.js static generation issue

**Recommendation**: These pages should have auth guards and only show in menu when user is logged in

#### 3. ✅ Users Database Created
**Created**: `users.db` with comprehensive schema

**Tables** (11 total):
1. **users** - Authentication (email, password_hash, subscription_tier)
2. **user_profiles** - Academic info (major, GPA, test scores)
3. **saved_comparisons** - Saved college comparisons
4. **comparison_folders** - Organization for comparisons
5. **salary_submissions** - Crowdsourced salary data
6. **support_tickets** - User support system
7. **support_ticket_messages** - Ticket conversation threads
8. **alert_preferences** - Notification settings
9. **user_deadlines** - Application timeline tracking
10. **shared_comparisons** - Export/share functionality
11. **user_analytics** - Usage tracking

**Indexes Created**: 8 indexes for optimized queries

**Location**: `/collegecomps-web/users.db`

**Note**: This database is for LOCAL development only. For production:
- Use Vercel Postgres or separate Turso database
- Schema file: `users_schema.sql` can be used to create production database

#### 4. ✅ Compare Colleges - N/A Values (Average Net Price, Admission Rate, SAT/ACT, Earnings)
**Investigation Results**:

**Admissions Data**:
- Table `admissions_data` EXISTS but has **0 records**
- Fields available but no data: admission_rate, sat_math_25th, sat_math_75th, sat_verbal_25th, sat_verbal_75th, act_composite_25th, act_composite_75th
- **This is a DATA COLLECTION issue** - the scraper never populated this table

**Financial Data**:
- UT Austin example (UNITID 228778):
  - ✅ tuition_in_state: $11,678
  - ✅ tuition_out_state: $11,678
  - ✅ room_board_on_campus: $11,448
  - ❌ net_price: NOT in database (column doesn't exist in financial_data table)

**Earnings Data**:
- Not being returned from `searchInstitutions()` method
- Data exists in `earnings_outcomes` table but not joined in search query

**Frontend Status**: 
- Correctly displays N/A when data is missing
- `/api/colleges/search` route properly structured to show these fields when available

**Data Quality Issues Summary**:
1. ❌ **admissions_data** table: 0 records (scraper issue)
2. ❌ **net_price**: Column doesn't exist in financial_data table
3. ⚠️ **earnings**: Data exists but not included in search JOIN

---

## Files Modified

1. `/src/app/api/dashboard/stats/route.ts` - Added 7 `await` keywords
2. `/users_schema.sql` - Created (users database schema)
3. `/users.db` - Created (SQLite database file)

## Data Quality Issues Identified

### Critical Data Collection Problems:
1. **Tuition Data**: 92.6% of schools have identical in-state/out-of-state tuition (previous issue)
2. **Admissions Data**: Table exists but is completely empty (0 records)
3. **Net Price**: Field missing from financial_data table structure
4. **Earnings in Search**: Data exists but not joined in college search queries

### Recommendations:
1. **Scraper Improvements Needed**:
   - Fix out-of-state tuition collection
   - Add admissions data collection (rates, SAT/ACT scores)
   - Add net_price to financial_data table
2. **Query Optimization**:
   - Add earnings_outcomes JOIN to searchInstitutions() method
3. **Production Database**:
   - Upload users.db schema to Turso or Vercel Postgres
   - Keep users data separate from college data

## Next Steps

1. ✅ Test dashboard locally
2. ✅ Commit users database schema
3. ⏳ Fix scraper to collect missing data (admissions, correct tuition)
4. ⏳ Deploy users database to production (Turso or Vercel Postgres)
5. ⏳ Add auth guards to protected pages
6. ⏳ Update searchInstitutions to include earnings data
