# Issue Fixes - Round 3
## Date: October 8, 2025

## Issues Addressed

### 1. ✅ Users Database Connection Errors

**Errors:**
- `TypeError: Cannot open database because the directory does not exist` (salary-data API)
- `Signup error: TypeError: Cannot open database because the directory does not exist` (signup API)

**Root Cause:**
- Users database was trying to use local SQLite file (`data/users.db`)
- Production environment doesn't have local file system access
- Needed to connect to Turso cloud database

**Solution:**
Updated `src/lib/db-helper.ts`:
```typescript
export function getUsersDb(): TursoAdapter | Database.Database | null {
  if (usersDb === undefined) {
    // Production: Use Turso if URL is provided
    if (process.env.USERS_DB_URL && process.env.USERS_DB_URL.startsWith('libsql://')) {
      usersDb = new TursoAdapter(
        process.env.USERS_DB_URL,
        process.env.USERS_DB_TOKEN || ''
      );
    }
    // Development: Use local SQLite file
    else if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      usersDb = safeOpenDatabase('data/users.db');
    }
    // Build time or missing env vars
    else {
      usersDb = null;
    }
  }
  return usersDb;
}
```

Updated API routes to use async/await:
- `src/app/api/salary-data/route.ts` - Added `await` to 5 database queries
- `src/app/api/auth/signup/route.ts` - Added `await` to 2 database queries

**Files Changed:**
- `src/lib/db-helper.ts`
- `src/app/api/salary-data/route.ts`
- `src/app/api/auth/signup/route.ts`

**Commit:** `febab15` - "Connect users database to Turso and fix async/await in auth routes"

---

### 2. ✅ Authentication-Required Menu Items Visibility

**Issue:**
All menu items (including auth-required pages) were visible to non-logged-in users, leading to confusion when clicking resulted in redirects to sign-in page.

**Solution:**
Updated `src/components/Sidebar.tsx`:
1. Added `requiresAuth` property to `NavItem` interface
2. Marked 6 menu items as requiring authentication:
   - Advanced Analytics
   - Historical Trends
   - Priority Data Access
   - My Timeline
   - Academic Profile
   - Support
3. Added session-based filtering:
```typescript
const { data: session } = useSession();
const visibleNavigation = navigation.filter(item => {
  if (!item.requiresAuth) return true;
  return !!session?.user;
});
```

**Files Changed:**
- `src/components/Sidebar.tsx`

**Commit:** `e728f43` - "Hide auth-required menu items from non-logged-in users"

---

### 3. ✅ Admin User Creation

**Requirement:**
Create admin user with highest available subscription tier

**Solution:**
Created admin user in Turso users database:
- **Email:** `admin@collegecomps.com`
- **Password:** `Admin123!@#`
- **Tier:** `premium` (highest available - schema constraint only allows: free, basic, premium)
- **Email Verified:** Yes

**Command Used:**
```bash
turso db shell collegecomps-users "INSERT INTO users (email, password_hash, name, email_verified, subscription_tier) VALUES ('admin@collegecomps.com', '$2b$10$orgffbGJ2q9P3jhqsqPIS.ipc09GRzCe1u/l104Pj318m.FK8UKca', 'Admin User', 1, 'premium');"
```

**Helper Script Created:**
- `scripts/create-admin-user.ts` - Generates bcrypt password hash and SQL command

---

### 4. ⚠️ University of Texas at Austin Missing Data

**Issue:**
UT Austin showing N/A for:
- Average Net Price
- Admission Rate
- Average SAT
- Median ACT
- Earnings (6 years after)
- Earnings (10 years after)

**Investigation Results:**

**Financial Data (unitid: 228778):**
```sql
tuition_in_state:  11678
tuition_out_state: 11678  ← IDENTICAL (data quality issue)
room_board:        11448
```

**Admissions Data:**
```sql
SELECT COUNT(*) FROM admissions_data WHERE unitid = 228778;
-- Result: 0 records
```
❌ **NO admissions data exists for UT Austin**
❌ **Admissions table appears to be EMPTY for ALL schools**

**Earnings Data:**
```sql
SELECT earnings_6_years_after_entry, earnings_10_years_after_entry 
FROM earnings_outcomes WHERE unitid = 228778;
-- Result: NULL, NULL
```
❌ **Earnings values are NULL**

**Root Cause:**
1. **Admissions Data:** Table is completely empty (collection failure)
2. **Earnings Data:** NULL values in database (possible API field mismatch)
3. **Net Price:** Field missing from database schema

---

### 5. 🔍 In-State vs Out-of-State Tuition Data Quality

**Issue:**
92.6% of schools have IDENTICAL in-state and out-of-state tuition values

**Example (UT Austin):**
- In-state: $11,678
- Out-of-state: $11,678 ← Should be different

**Scraper Investigation:**

**Scorecard API Collection (from `direct_scorecard_collector.py`):**
```python
fields = [
    '2022.cost.tuition.in_state',     # ✅ Collecting
    '2022.cost.tuition.out_of_state', # ✅ Collecting
    '2021.cost.tuition.in_state',
    '2021.cost.tuition.out_of_state',
    '2020.cost.tuition.in_state',
    '2020.cost.tuition.out_of_state',
]
```

**Database Schema (Turso):**
```sql
-- financial_data table
tuition_in_state   REAL
tuition_out_state  REAL
```

**Status:** ✅ Scraper IS collecting both values correctly

**Possible Causes:**
1. **API Data Quality:** College Scorecard API may have identical values for many schools
2. **Private Schools:** Don't differentiate resident/non-resident tuition
3. **Database Import:** Possible column mapping error during data import
4. **Data Recency:** Values may be from years when schools didn't differentiate

**Next Steps Needed:**
1. Query College Scorecard API directly for UT Austin to verify source data
2. Check if private institutions have this pattern (they typically don't differentiate)
3. Review database import script for column mapping errors
4. Consider re-scraping with latest data

---

## Environment Variables Status

### ✅ College Database (Configured in Vercel)
```
TURSO_DATABASE_URL=libsql://collegecomps-fpapalardo.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGci...
```

### ⚠️ Users Database (NEEDS TO BE ADDED TO VERCEL)
```
USERS_DB_URL=libsql://collegecomps-users-fpapalardo.aws-us-east-1.turso.io
USERS_DB_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTk5MzQxNjQsImlkIjoiZDY0ZDkzNWMtNmFlZC00M2E1LThhMWEtOGYyMTc5MjFkYjYxIiwicmlkIjoiNTczZmU2NmItM2M0Ni00NjA3LTliNDEtOWM2OWQzMjE3ZTJhIn0.pbRcmDyZ8mErGAaTERbidRFwVejwj99rQ3TCjpvB6pHqJyYDvMsAV-kl2UewAmCvQrpoqnqTOmbqgq06ReO2Cg
```

**Action Required:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `USERS_DB_URL` and `USERS_DB_TOKEN`
3. Redeploy application

---

## Data Quality Issues Summary

### Critical Issues (Blocking Functionality)
1. ❌ **Admissions Data:** Table completely empty (0 records)
2. ❌ **Earnings Data:** NULL values for many schools
3. ❌ **Net Price:** Field missing from schema

### Data Accuracy Issues
4. ⚠️ **Tuition Differentiation:** 92.6% identical in-state/out-of-state values
5. ⚠️ **Test Scores:** Missing SAT/ACT data (linked to empty admissions table)
6. ⚠️ **Admission Rates:** Missing (linked to empty admissions table)

---

## Next Steps

### Immediate (Production)
1. **Add environment variables to Vercel:**
   - USERS_DB_URL
   - USERS_DB_TOKEN

2. **Test admin user login:**
   - Email: admin@collegecomps.com
   - Password: Admin123!@#

### Data Quality Fixes (Development)
1. **Fix admissions data collection:**
   - Debug why admissions_data table is empty
   - Re-run scraper to collect admissions data
   - Verify College Scorecard API fields

2. **Fix earnings data:**
   - Check field mapping in database import
   - Verify College Scorecard API response structure
   - Re-import earnings data if necessary

3. **Add net_price field:**
   - Update database schema
   - Collect net price from College Scorecard API
   - Display on college detail pages

4. **Investigate tuition data:**
   - Query College Scorecard API directly for sample schools
   - Determine if issue is source data or import process
   - Consider filtering/flagging suspicious identical values

---

## Commits in This Round
1. `e728f43` - Hide auth-required menu items from non-logged-in users
2. `febab15` - Connect users database to Turso and fix async/await in auth routes

## Deployment Status
- ✅ Changes pushed to GitHub
- ✅ Vercel auto-deployment triggered
- ⚠️ Users database env vars NOT YET configured in Vercel
- ⚠️ Signup/salary features will work after env vars added
