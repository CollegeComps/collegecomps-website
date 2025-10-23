# CollegeComps Platform Documentation

**Last Updated:** October 22, 2025  
**Purpose:** Technical documentation for all platform pages, data sources, and calculations

---

## Table of Contents

1. [Home Page](#home-page)
2. [College Explorer](#college-explorer)
3. [College Detail Page](#college-detail-page)
4. [Career Finder](#career-finder)
5. [Scholarship Finder](#scholarship-finder)
6. [ROI Calculator](#roi-calculator)
7. [Analytics Dashboard](#analytics-dashboard)
8. [Comparison Tool](#comparison-tool)
9. [EFC Calculator](#efc-calculator)
10. [Programs Search](#programs-search)

---

## Home Page

**Route:** `/`  
**File:** `src/app/page.tsx`

### Purpose
Landing page introducing platform features and value proposition.

### Data Displayed
- Platform feature cards (College Explorer, ROI Calculator, Career Finder, Scholarship Finder)
- Quick stats (6,163 colleges, ROI calculations, scholarships)
- Call-to-action for user signup

### Data Sources
- Static content
- Database counts fetched from API endpoints

### User Flow
1. User lands on homepage
2. Reads feature descriptions
3. Clicks feature card to navigate to specific tool
4. Or signs up/logs in from header

---

## College Explorer

**Route:** `/colleges`  
**File:** `src/app/colleges/page.tsx`  
**API:** `/api/institutions`

### Purpose
Browse and filter 6,163+ colleges with comprehensive data and ROI sorting.

### Data Displayed
**Per College Card:**
- Institution name, city, state
- ROI badge (institution_avg_roi or implied_roi as %)
- School category badges (HBCU, Ivy League, Public Flagship, etc.)
- Tuition (in-state/out-of-state)
- Room & board costs
- Control type (Public, Private Nonprofit, Private For-Profit)
- Median earnings (6 years and 10 years after entry)
- Acceptance rate
- Average SAT/ACT scores
- Bookmark status (if logged in)

### Data Sources
**Database Tables:**
- `institutions` - Core institution data
- `financial_data` - Tuition, fees, room & board
- `earnings_outcomes` - Post-graduation earnings
- `admissions_data` - Acceptance rates, test scores

**Primary Fields:**
- `institution_avg_roi` - 30-year ROI calculation
- `implied_roi` - Fallback ROI calculation
- `tuition_in_state`, `tuition_out_state`
- `room_board_on_campus`
- `earnings_6_years_after_entry`, `earnings_10_years_after_entry`
- `acceptance_rate`
- `average_sat`, `average_act`

### Data Processing
**Default Sorting:** ROI (High to Low)
- Uses `COALESCE(institution_avg_roi, -999999) DESC` in SQL
- Prioritizes schools with highest 30-year ROI
- Schools without ROI data appear last

**Filtering:**
- State: Exact match on `state` column
- City: Case-insensitive LIKE match
- ZIP Code: Exact match on `zip_code` column
- Proximity: Haversine distance calculation from latitude/longitude
- Major Category: STEM, Business, Health, Education, Humanities, Social Sciences, Arts
- Institution Type: Public (1), Private Nonprofit (2), Private For-Profit (3)
- Max Tuition: Filter `tuition_in_state` OR `tuition_out_state` <= value
- Min Earnings: Filter `earnings_6_years_after_entry` >= value

**Pagination:**
- 30 institutions per page
- "Load More" button appends next page
- Tracks `hasMore` state based on result count

### ROI Calculation
**institution_avg_roi:**
- 30-year net present value calculation
- Formula: `(Median Earnings * 30 years) - (Total Cost * 4 years) - Loan Interest`
- Discounted to present value using 3% inflation rate
- Values range from -$500k (poor ROI) to $4M+ (excellent ROI)

**Coverage:**
- 3,209 of 6,163 institutions (52%) have ROI data
- Requires both earnings data and cost data

### User Flow
1. Page loads with ROI-sorted colleges (default)
2. User can apply filters (state, type, cost, etc.)
3. Results update instantly with debounced search (500ms delay)
4. User clicks college card → navigates to detail page
5. User can bookmark colleges (requires login)
6. Load More button fetches additional results

### Recommendations
**Algorithm:** Implicit ROI-based ranking
- Higher ROI = Higher ranking
- Filters allow user to narrow by personal preferences
- No explicit recommendation engine (yet)

---

## College Detail Page

**Route:** `/colleges/[unitid]`  
**File:** `src/app/colleges/[unitid]/page.tsx`  
**API:** `/api/institutions/[unitid]`

### Purpose
Comprehensive view of a single institution with all available data.

### Data Displayed
**Overview Section:**
- Institution name, location (city, state, zip)
- Control type, Carnegie classification
- Website link
- Enrollment (total, undergrad, grad)
- Gender breakdown (% male/female)
- School categories (HBCU, HSI, Ivy League, etc.)

**Financial Information:**
- Tuition (in-state, out-of-state)
- Fees
- Room & board (on-campus, off-campus)
- Books & supplies estimate
- Net price calculator link

**Admissions:**
- Acceptance rate
- SAT range (25th-75th percentile)
- ACT range (25th-75th percentile)
- Application deadlines (if available)

**Outcomes:**
- Median earnings 6 years after entry
- Median earnings 10 years after entry
- Completion rate (4-year)
- Default rate (federal loans)

**Programs:**
- Top 10 most popular majors by completions
- Total number of programs offered
- Link to full program search

**ROI Analysis:**
- 30-year ROI (institution_avg_roi)
- ROI vs cost scatter plot position
- Comparison to state/national averages

**Endowment (if available):**
- Total endowment value
- Endowment per student

**Athletic Conference (if available):**
- NCAA division and conference name

### Data Sources
**Primary:** `institutions` table joined with:
- `financial_data` - Multi-year cost data (latest year displayed)
- `earnings_outcomes` - Graduate earnings
- `admissions_data` - Admission statistics  
- `academic_programs` - Degree programs offered
- `programs_search_cache` - Aggregated program completions

**External Links:**
- College Scorecard for net price calculator
- IPEDS for detailed statistics
- Institution website

### Data Processing
**Multi-Year Data:**
- Financial data stored by year
- Query selects most recent year with `ORDER BY year DESC LIMIT 1`
- Historical trends available via separate API

**Program Rankings:**
- Ordered by `total_completions DESC`
- Shows CIP code, title, credential level
- Aggregates associate, bachelor's, master's, doctoral separately

**ROI Display:**
- Formats as currency: $3,846,736 → $3.8M
- Color-coded badge: Green for high ROI, yellow for medium, red for low
- Tooltip explains 30-year net present value

### User Flow
1. User clicks college from explorer or search
2. Page loads with unitid parameter
3. All sections render with available data
4. Missing data shows "Not Available" gracefully
5. User can bookmark, compare, or navigate to programs
6. "Back to Explorer" button in breadcrumb

---

## Career Finder

**Route:** `/career-finder`  
**File:** `src/app/career-finder/page.tsx`  
**Data:** `src/data/career-database.ts`, `src/data/personality-descriptions.ts`

### Purpose
Myers-Briggs personality assessment to match users with suitable careers.

### Data Displayed
**Assessment Questions:** 10 questions across 4 dimensions
- Extraversion (E) vs Introversion (I)
- Sensing (S) vs Intuition (N)
- Thinking (T) vs Feeling (F)
- Judging (J) vs Perceiving (P)

**Results:**
- MBTI personality type (e.g., INTJ, ENFP)
- Personality description and category
- 10-15 matched careers with:
  - Job title
  - Median annual salary (BLS data)
  - Job growth outlook (BLS projections)
  - Brief description
- "Show All Careers" toggle (displays 6 initially, expandable to all)

### Data Sources
**Static Data:** `COMPREHENSIVE_CAREER_MAPPINGS`
- 160+ careers across 16 MBTI types
- Salary data from Bureau of Labor Statistics (2024)
- Growth data from BLS Employment Projections (2023-2033)

**Example:**
```typescript
INTJ: [
  {
    title: "Software Developer",
    salary: "$127,260",
    growth: "25% (Much faster than average)",
    description: "Design and develop software applications..."
  },
  // 10-14 more careers
]
```

### Data Processing
**Question Scoring:**
- Each answer adds to dimension score (E/I, S/N, T/F, J/P)
- Highest score in each dimension determines letter
- Four letters combine to form MBTI type

**Career Matching:**
- Direct lookup in COMPREHENSIVE_CAREER_MAPPINGS
- No algorithmic ranking - all careers shown for the type
- Careers pre-curated by MBTI compatibility

**Progressive Disclosure:**
- Shows 6 careers by default
- "Show All X Careers" button expands to full list
- Improves UX by not overwhelming users

### User Flow
1. User starts assessment
2. Answers 10 multiple-choice questions
3. Submits assessment
4. Results page shows personality type
5. Scrolls through matched careers
6. Clicks "Show All" to see complete list
7. Can retake assessment to try different answers

### Recommendations
**Algorithm:** MBTI-based career matching
- Lookup table approach (type → careers)
- Based on established MBTI career research
- Careers chosen for strong alignment with personality traits
- No personalization beyond personality type (yet)

---

## Scholarship Finder

**Route:** `/scholarships`  
**File:** `src/app/scholarships/page.tsx`  
**API:** `/api/scholarships/match`  
**Database:** `scholarships` table

### Purpose
Match students with scholarships based on profile criteria.

### Data Displayed
**Search Filters:**
- GPA (pre-filled from profile if logged in)
- SAT score (pre-filled from profile)
- ACT score (pre-filled from profile)
- State of residence
- Intended major category (STEM, Business, Health, Arts, etc.)
- Minimum award amount

**Scholarship Cards:**
- Scholarship name
- Amount range (e.g., "$5,000 - $10,000")
- Eligibility requirements
- Application deadline
- Organization/sponsor
- Application link (if available)

### Data Sources
**Database:** `scholarships` table with 146+ scholarships
- National scholarships (Microsoft, Meta, Amazon, Apple, Palantir, Google, etc.)
- State-specific scholarships (all 50 states covered)
- Major-specific scholarships (STEM, Business, Health, Arts, Humanities, etc.)

**Schema:**
```sql
CREATE TABLE scholarships (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  amount_min INTEGER,
  amount_max INTEGER,
  eligibility_criteria TEXT,
  state TEXT,  -- NULL for national scholarships
  major_category TEXT,
  min_gpa REAL,
  min_sat INTEGER,
  min_act INTEGER,
  deadline TEXT,
  application_url TEXT
);
```

**Recent Expansion:** (ENG-97)
- Expanded from 46 to 146 scholarships (317% increase)
- Added all 50 states (previously only 12)
- Enhanced STEM, Business, Health, Arts categories
- Added major tech company scholarships

### Data Processing
**Matching Algorithm:**
```sql
SELECT * FROM scholarships 
WHERE 
  (state IS NULL OR state = :user_state) AND
  (major_category IS NULL OR major_category = :user_major) AND
  (min_gpa IS NULL OR :user_gpa >= min_gpa) AND
  (min_sat IS NULL OR :user_sat >= min_sat) AND
  (min_act IS NULL OR :user_act >= min_act) AND
  (amount_min >= :min_award OR amount_min IS NULL)
ORDER BY amount_max DESC NULLS LAST;
```

**Ranking Logic:**
- Sorted by maximum award amount (highest first)
- National scholarships shown alongside state scholarships
- NULL requirements = scholarship available to all

**Session Integration:**
- If user logged in, pre-fills GPA, SAT, ACT from `student_profiles` table
- Updates in real-time as user modifies profile
- Not logged in = manual entry required

### User Flow
1. User navigates to scholarship finder
2. Filters pre-populated if logged in
3. User adjusts filters (state, major, test scores)
4. Results update instantly
5. User reviews matched scholarships
6. Clicks "Apply" → opens application URL
7. Can bookmark scholarships (if logged in)

### Recommendations
**Algorithm:** Rules-based eligibility matching
- Direct SQL WHERE clause filtering
- No machine learning or personalization
- Simple, transparent matching logic
- Future enhancement: add recommendation score based on profile fit

**Data Quality Notes:**
- Scholarship amounts updated annually (manual process)
- Deadlines require periodic verification
- Application URLs validated before database entry

---

## ROI Calculator

**Route:** `/roi-calculator`  
**File:** `src/app/roi-calculator/page.tsx`

### Purpose
Calculate 30-year return on investment for any college based on user inputs.

### Data Displayed
**Input Section:**
- Institution selection (search from 6,163 colleges)
- Program selection (based on institution's offerings)
- Attendance duration (1-6 years)
- Living situation (on-campus, off-campus, commute)
- Loan amount (if applicable)
- Interest rate
- Expected starting salary (auto-filled from major data)

**Output Section:**
- Total cost of attendance (4-year or custom duration)
- Total loan payments (principal + interest)
- Expected lifetime earnings (30-year projection)
- Net ROI (lifetime earnings - total cost)
- ROI percentage ((earnings - cost) / cost * 100)
- Payback period (years to break even)
- Visual chart comparing cost vs earnings over time

### Data Sources
**Institution Data:**
- `institutions` table: base costs
- `financial_data` table: tuition, fees, room & board

**Earnings Data:**
- `earnings_outcomes` table: median earnings by institution
- `academic_programs` table: major-specific earnings (when available)
- BLS data: occupation-specific salary projections

**Financial Calculations:**
- Loan amortization: standard formula
- Net present value: 3% discount rate
- Inflation adjustment: 2.5% annual increase

### Data Processing
**Cost Calculation:**
```typescript
const totalCost = (
  tuition + 
  fees + 
  (livingArrangement === 'on-campus' ? roomBoard : 
   livingArrangement === 'off-campus' ? roomBoard * 0.9 : 
   roomBoard * 0.5)
) * attendanceYears;
```

**Loan Calculation:**
```typescript
// Monthly payment using standard amortization formula
const monthlyPayment = 
  loanAmount * 
  (interestRate / 12) / 
  (1 - Math.pow(1 + interestRate / 12, -loanTermMonths));

const totalLoanPayments = monthlyPayment * loanTermMonths;
const totalInterest = totalLoanPayments - loanAmount;
```

**Earnings Projection:**
```typescript
// 30-year career earnings with 2.5% annual growth
let careerEarnings = 0;
for (let year = 0; year < 30; year++) {
  careerEarnings += startingSalary * Math.pow(1.025, year);
}
```

**ROI Calculation:**
```typescript
const netROI = careerEarnings - totalCost - totalInterest;
const roiPercentage = (netROI / totalCost) * 100;
```

**Payback Period:**
```typescript
// Years until earnings cover cost
let cumulativeEarnings = 0;
let yearsToBreakEven = 0;
while (cumulativeEarnings < totalCost && yearsToBreakEven < 30) {
  cumulativeEarnings += startingSalary * Math.pow(1.025, yearsToBreakEven);
  yearsToBreakEven++;
}
```

### User Flow
1. User selects institution from dropdown
2. Programs load for that institution
3. User selects program and adjusts inputs
4. Calculator updates in real-time
5. User can save comparison or export results
6. Can compare multiple scenarios side-by-side

### Recommendations
**Algorithm:** Direct ROI calculation
- No recommendation engine
- User-driven what-if analysis
- Future: suggest similar programs with better ROI

---

## Analytics Dashboard

**Route:** `/analytics`  
**File:** `src/app/analytics/page.tsx`

### Purpose
Interactive scatter plot visualization of cost vs ROI across all institutions.

### Data Displayed
**Scatter Plot:**
- X-axis: Total annual cost (tuition + fees + room & board)
- Y-axis: 30-year ROI ($)
- Each dot = one institution
- Color-coded by institution type:
  - Blue = Public
  - Green = Private Nonprofit
  - Red = Private For-Profit

**Filters:**
- State dropdown (all 50 states)
- Institution type (Public, Private Nonprofit, Private For-Profit)
- Minimum ROI slider
- Maximum cost slider

**Summary Statistics:**
- Count of institutions per type
- Average ROI per type
- Total institutions shown vs filtered

### Data Sources
**API Call:** `/api/institutions?sortBy=roi_high&limit=10000`
- Fetches all institutions with ROI data
- Filters out institutions missing cost or ROI
- Returns ~3,200 data points (52% of database)

**Fields Used:**
- `institution_avg_roi`: Y-axis
- `tuition_in_state` OR `tuition_out_state`: Cost component
- `fees`, `room_board_on_campus`: Additional cost components
- `control_of_institution`: Color grouping
- `state`: Filter option

### Data Processing
**Data Preparation:**
```typescript
const dataPoints = institutions
  .filter(inst => 
    inst.institution_avg_roi != null && 
    (inst.tuition_in_state || inst.tuition_out_state)
  )
  .map(inst => ({
    name: inst.name,
    cost: (inst.tuition_in_state || inst.tuition_out_state) + 
          (inst.fees || 0) + 
          (inst.room_board_on_campus || 0),
    roi: inst.institution_avg_roi,
    control: getControlLabel(inst.control_of_institution),
    state: inst.state,
    unitid: inst.unitid
  }));
```

**Filtering:**
- Client-side filtering for performance
- Filters applied on pre-fetched data
- Real-time updates as sliders/dropdowns change

**Chart Library:** Recharts
- ResponsiveContainer for mobile support
- Custom tooltip showing institution details
- Legend for institution types
- Formatted axis labels ($50k, $3.8M)

### User Flow
1. Page loads, fetches all institutions
2. Scatter plot renders with all data
3. User applies filters (state, type, ROI, cost)
4. Chart updates instantly (client-side)
5. User hovers over dots → tooltip shows details
6. User can click dot → navigate to college detail page (future enhancement)

### Insights
**Pattern Analysis:**
- Public institutions cluster in lower cost, moderate ROI
- Private nonprofit span wide range (some high ROI, some negative)
- Private for-profit generally lower ROI
- Outliers: Elite institutions with very high ROI despite high cost

---

## Comparison Tool

**Route:** `/compare`  
**File:** `src/app/compare/page.tsx`  
**API:** `/api/saved-comparisons`

### Purpose
Side-by-side comparison of multiple colleges across key metrics.

### Data Displayed
**Comparison Table:**
- Institution names and locations
- Control type
- Total cost (tuition + fees + room & board)
- Net price (after average aid)
- Acceptance rate
- SAT/ACT ranges
- Median earnings (6-year, 10-year)
- 30-year ROI
- Completion rate
- Student-faculty ratio
- Enrollment size
- Top 3 majors

**Per Institution:**
- All metrics displayed in aligned columns
- Color-coded indicators (green = good, red = concerning)
- Quick links to full detail pages

### Data Sources
**Primary:** `/api/institutions?unitid=X,Y,Z`
- Fetches selected institutions by comma-separated unitids
- Joins financial, admissions, earnings data
- Returns normalized comparison data

**Schema:**
- Same as College Detail Page
- Optimized query for multiple institutions

### Data Processing
**Normalization:**
- All costs formatted as currency
- Percentages formatted with 1 decimal place
- Missing data shown as "N/A"
- Rankings calculated client-side (1st, 2nd, 3rd)

**Comparison Metrics:**
- Best value: Lowest cost with highest ROI
- Best outcomes: Highest earnings, completion rate
- Most selective: Lowest acceptance rate
- Best aid: Lowest net price vs sticker price

### User Flow
1. User adds colleges to comparison from explorer
2. Comparison tool shows selected colleges
3. User can add/remove colleges (up to 5)
4. Table updates dynamically
5. User can save comparison (if logged in)
6. Can export comparison as PDF or share link

### Recommendations
**Algorithm:** Metric-based ranking
- Each metric ranked independently
- "Best Overall" calculated from weighted average:
  - ROI: 40%
  - Cost: 30%
  - Outcomes: 20%
  - Selectivity: 10%
- Highlights recommended choice with badge

---

## EFC Calculator

**Route:** `/efc-calculator`  
**File:** `src/app/efc-calculator/page.tsx`

### Purpose
Calculate Expected Family Contribution for federal financial aid eligibility.

### Data Displayed
**Input Form:**
- Student income
- Student assets
- Parent income
- Parent assets
- Number of parents in household
- Number of dependents
- Number of siblings in college
- Household size

**Output:**
- Expected Family Contribution (EFC)
- Simplified needs test result (if applicable)
- Auto-zero EFC indicator
- Estimated Pell Grant eligibility
- Breakdown of contribution:
  - Parent contribution
  - Student contribution
- Explanation of results

### Data Sources
**Formula:** Federal EFC Formula (2024-2025)
- Based on FAFSA methodology
- Simplified Needs Test thresholds
- Auto-zero EFC qualifications
- Pell Grant eligibility tables

**External References:**
- Federal Student Aid publications
- FAFSA guidelines
- Income protection allowances
- Asset assessment rates

### Data Processing
**EFC Calculation:**
```typescript
// Simplified example
const parentContribution = 
  Math.max(0, (parentIncome - incomeProtectionAllowance) * 0.47);

const studentContribution =
  Math.max(0, studentIncome - 6970) * 0.50 +
  studentAssets * 0.20;

const totalEFC = parentContribution + studentContribution;
```

**Simplified Needs Test:**
- If parent income < $50,000 AND eligible form (1040A/EZ)
- → Assets not considered
- Reduces EFC significantly for low-income families

**Auto-Zero EFC:**
- If parent income < $27,000 AND eligible form
- → EFC = $0 automatically
- Qualifies for maximum Pell Grant ($7,395 in 2024)

**Pell Grant Estimation:**
```typescript
const maxPell = 7395;  // 2024-2025 max award
const pellGrant = Math.max(0, maxPell - (efc * 0.5));
```

### User Flow
1. User enters financial information
2. Calculator validates inputs
3. EFC calculated in real-time
4. Results shown with detailed breakdown
5. User can adjust values to see impact
6. Can save results to profile (if logged in)
7. Export results for FAFSA reference

### Recommendations
**Algorithm:** Federal formula implementation
- No proprietary logic - follows FAFSA exactly
- Educational explanations for each result
- Suggestions for reducing EFC:
  - Move student assets to parent name
  - Pay off consumer debt before filing
  - Time income/bonuses strategically

---

## Programs Search

**Route:** `/programs`  
**File:** `src/app/programs/page.tsx`  
**API:** `/api/programs/search`

### Purpose
Search and explore academic programs across all institutions.

### Data Displayed
**Search Results:**
- Program name (CIP title)
- Credential level (Associate, Bachelor's, Master's, Doctoral)
- Number of institutions offering the program
- Total annual completions nationwide
- Median earnings for program graduates
- Top 5 institutions offering the program

**Per Program Card:**
- CIP code (Classification of Instructional Programs)
- Program description
- Related careers
- Typical earnings range
- List of institutions with links

### Data Sources
**Database Tables:**
- `academic_programs`: Individual program offerings per institution
- `programs_search_cache`: Aggregated program data for search
- `earnings_outcomes`: Major-specific earnings when available

**Schema:**
```sql
CREATE TABLE academic_programs (
  id INTEGER PRIMARY KEY,
  unitid INTEGER,
  cip_code TEXT,
  cip_title TEXT,
  credential_level INTEGER,
  total_completions INTEGER
);

CREATE TABLE programs_search_cache (
  cip_code TEXT PRIMARY KEY,
  cip_title TEXT,
  total_completions INTEGER,
  institution_count INTEGER,
  avg_earnings REAL
);
```

### Data Processing
**Search Query:**
```sql
SELECT DISTINCT cip_title, cip_code
FROM programs_search_cache
WHERE cip_title LIKE '%' || :searchTerm || '%'
GROUP BY cip_title
ORDER BY total_completions DESC
LIMIT 50;
```

**Institution Lookup:**
```sql
SELECT i.name, i.unitid, ap.total_completions
FROM academic_programs ap
JOIN institutions i ON ap.unitid = i.unitid
WHERE ap.cip_code = :cipCode
ORDER BY ap.total_completions DESC
LIMIT 10;
```

**Deduplication:**
- GROUP BY cip_title to avoid duplicate programs
- Same program may have multiple CIP codes
- Aggregates completions across codes

**Ranking:**
- Sorted by total_completions DESC
- Most popular programs appear first
- Relevance could be improved with FTS5 (future)

### User Flow
1. User enters search term (e.g., "Computer Science")
2. Search executes with debounce (300ms)
3. Results show matching programs
4. User clicks program → expands to show institutions
5. User can filter by credential level
6. Clicks institution → navigates to college detail page
7. Can bookmark programs (if logged in)

### Recommendations
**Algorithm:** Popularity-based ranking
- total_completions = popularity metric
- No personalization (yet)
- Future: recommend based on user profile, career goals

**Data Quality:**
- Programs updated annually from IPEDS
- Earnings data may be missing for some programs
- Institution counts accurate as of last data refresh

---

## Summary Statistics

### Data Coverage (as of Oct 22, 2025)

| Metric | Count | Coverage |
|--------|-------|----------|
| Total Institutions | 6,163 | 100% |
| With ROI Data | 3,209 | 52.07% |
| With Endowment Data | 2,682 | 43.5% |
| With Athletic Conference | 212 | 3.4% |
| With Earnings Data | 5,500+ | 89% |
| With Acceptance Rate | 4,800+ | 78% |
| Total Academic Programs | 50,000+ | - |
| Total Scholarships | 146 | All 50 states |
| Career Database | 160 | 16 MBTI types |

### Data Refresh Schedule

- **Institutions:** Annual (September) via IPEDS
- **Financial Data:** Annual (October) via College Scorecard
- **Earnings Data:** Annual (October) via College Scorecard
- **Scholarships:** Quarterly manual review
- **Programs:** Annual (November) via IPEDS
- **ROI Calculations:** Monthly batch recalculation

### Key Data Sources

1. **College Scorecard API** (primary)
   - Earnings, completion rates, costs
   - Updated by U.S. Department of Education

2. **IPEDS (Integrated Postsecondary Education Data System)**
   - Institutional characteristics
   - Enrollment, programs, faculty

3. **BLS (Bureau of Labor Statistics)**
   - Career salary data
   - Employment projections

4. **Manual Curation**
   - Scholarships
   - School categories (Ivy, flagship, etc.)
   - Athletic conferences

5. **User Submissions**
   - Salary reports (future)
   - Scholarship discoveries (future)

---

## Technical Architecture

### Frontend
- **Framework:** Next.js 15.5.4 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Authentication:** NextAuth.js

### Backend
- **Database:** Turso (SQLite)
- **ORM:** Direct SQL via libsql
- **API:** Next.js API Routes
- **Caching:** React Query (future)

### Deployment
- **Hosting:** Vercel
- **Database:** Turso Cloud
- **Monitoring:** Sentry
- **Analytics:** Vercel Analytics

### Performance Optimizations
- Server-side rendering for SEO
- Client-side filtering for interactivity
- Pagination for large datasets
- Debounced search inputs
- Lazy loading for images

---

## Future Enhancements

### High Priority
1. **Personalized Recommendations**
   - ML-based college matching
   - User profile-driven suggestions
   - Collaborative filtering

2. **Enhanced Search**
   - Full-text search with FTS5
   - Fuzzy matching
   - Natural language queries

3. **Real-time Data**
   - Live admission notifications
   - Scholarship deadline alerts
   - Price changes tracking

### Medium Priority
4. **Social Features**
   - User reviews and ratings
   - Discussion forums
   - Student ambassadors

5. **Financial Aid Calculator**
   - Institution-specific aid estimates
   - Merit scholarship predictions
   - Net price comparison

6. **Mobile App**
   - Native iOS/Android
   - Push notifications
   - Offline mode

### Low Priority
7. **Advanced Analytics**
   - Predictive admission chances
   - Career path simulations
   - Salary trajectory forecasting

---

**Document Maintained By:** Engineering Team  
**Last Review:** October 22, 2025  
**Next Review:** January 2026
