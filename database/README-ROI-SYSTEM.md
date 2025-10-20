# ROI System Implementation Guide

Complete guide for the Implied ROI calculation and sorting system.

## Overview

The ROI (Return on Investment) system calculates and displays the financial value of attending each institution based on:
- **10-year median earnings** after graduation
- **4-year total cost** of attendance
- **Net financial gain** over the first 10 years of career

## Database Schema Changes

### New Fields Added to `institutions` Table

```sql
-- ROI and financial metrics
implied_roi REAL                    -- Calculated ROI percentage
last_roi_calculation TIMESTAMP      -- When ROI was last computed

-- Admissions data (derived from admissions_data table)
acceptance_rate REAL                -- Admission rate (0.0 - 1.0)
average_sat INTEGER                 -- Average SAT score
average_act INTEGER                 -- Average ACT score
athletic_conference TEXT            -- Athletic conference name
```

### Indexes Created

```sql
idx_institutions_implied_roi         -- For sorting by ROI (DESC)
idx_institutions_acceptance_rate     -- For acceptance rate filtering
idx_institutions_sat_act             -- For test score filtering
idx_institutions_athletic_conference -- For conference filtering
idx_institutions_roi_state           -- Composite for ROI + state queries
```

## ROI Calculation Formula

```
Total 10-Year Earnings = median_earnings_10yr * 10
4-Year Total Cost = (net_price * 4) OR ((tuition + room_board + books) * 4)
Net Gain = Total_Earnings - Total_Cost
Implied ROI (%) = (Net_Gain / Total_Cost) * 100
```

### Example Calculation

```
Institution: MIT
- Median Earnings (10yr): $95,000/year
- Net Price: $25,000/year

Total 10-Year Earnings = $95,000 * 10 = $950,000
4-Year Total Cost = $25,000 * 4 = $100,000
Net Gain = $950,000 - $100,000 = $850,000
Implied ROI = ($850,000 / $100,000) * 100 = 850%
```

## Setup Instructions

### Step 1: Populate College Scorecard Data

First, populate the `earnings_outcomes` and `admissions_data` tables:

```bash
npm run populate-scorecard
```

**Runtime**: ~15-20 minutes  
**What it does**: Fetches earnings and admissions data for ~6,000 institutions

### Step 2: Apply Migration

Add the new database fields:

```bash
npm run apply-roi-migration
```

**What it does**: Adds `implied_roi`, `acceptance_rate`, `average_sat`, `average_act`, and related fields with indexes

### Step 3: Calculate ROI

Calculate implied ROI for all institutions:

```bash
npm run calculate-roi
```

**Runtime**: ~2-5 minutes  
**What it does**:
- Calculates ROI for institutions with complete earnings + cost data
- Updates `implied_roi` field
- Derives `acceptance_rate`, `average_sat`, `average_act` from admissions data
- Sets `last_roi_calculation` timestamp

## Usage

### API Endpoints

#### Get Institutions Sorted by ROI (Default)

```bash
GET /api/institutions
```

Response includes `implied_roi` field:
```json
{
  "institutions": [
    {
      "unitid": 123456,
      "name": "Example University",
      "implied_roi": 425.5,
      "acceptance_rate": 0.15,
      "average_sat": 1450,
      "average_act": 32,
      ...
    }
  ]
}
```

#### Explicit ROI Sorting

```bash
GET /api/institutions?sortBy=implied_roi
GET /api/institutions?sortBy=roi_low      # Lowest ROI first
```

#### Other Sorting Options

```bash
GET /api/institutions?sortBy=name
GET /api/institutions?sortBy=tuition_low
GET /api/institutions?sortBy=tuition_high
GET /api/institutions?sortBy=earnings_high
GET /api/institutions?sortBy=acceptance_rate_low
GET /api/institutions?sortBy=acceptance_rate_high
```

### Frontend Integration

The `Institution` interface now includes ROI fields:

```typescript
interface Institution {
  // ... existing fields
  
  // New ROI fields
  implied_roi?: number;
  acceptance_rate?: number;
  average_sat?: number;
  average_act?: number;
  athletic_conference?: string;
  last_roi_calculation?: string;
}
```

Display ROI in UI:

```tsx
{institution.implied_roi && (
  <div className="roi-badge">
    {institution.implied_roi > 0 ? '+' : ''}
    {institution.implied_roi.toFixed(1)}% ROI
  </div>
)}
```

## Data Quality

### ROI Distribution (Typical)

After running `calculate-roi`, expect distribution like:

```
Negative ROI: ~5-10%        (ROI < 0%)
Low ROI: ~20-25%            (0-50%)
Medium ROI: ~30-35%         (50-100%)
High ROI: ~25-30%           (100-200%)
Very High ROI: ~10-15%      (200%+)
```

### Data Coverage

- **Institutions with earnings data**: ~3,000-4,000 (out of 6,163)
- **Institutions with admissions data**: ~2,000-3,000
- **Institutions with complete ROI**: ~2,500-3,500

Institutions without sufficient data will have `NULL` values for `implied_roi`.

## Validation Queries

### Check ROI Calculation Status

```sql
SELECT 
  COUNT(*) as total_institutions,
  COUNT(implied_roi) as institutions_with_roi,
  ROUND(AVG(implied_roi), 2) as avg_roi,
  MIN(implied_roi) as min_roi,
  MAX(implied_roi) as max_roi
FROM institutions;
```

### View Top 10 ROI Institutions

```sql
SELECT 
  name,
  state,
  ROUND(implied_roi, 1) as roi_percentage,
  acceptance_rate,
  average_sat
FROM institutions
WHERE implied_roi IS NOT NULL
ORDER BY implied_roi DESC
LIMIT 10;
```

### Find Institutions Missing ROI

```sql
SELECT 
  unitid,
  name,
  state,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM earnings_outcomes WHERE unitid = i.unitid) THEN 'No earnings data'
    WHEN NOT EXISTS (SELECT 1 FROM financial_data WHERE unitid = i.unitid) THEN 'No cost data'
    ELSE 'Unknown'
  END as reason
FROM institutions i
WHERE implied_roi IS NULL
LIMIT 20;
```

## Maintenance

### Updating ROI Data

Re-run ROI calculation periodically (e.g., monthly or quarterly):

```bash
# 1. Update earnings/admissions data from College Scorecard
npm run populate-scorecard

# 2. Recalculate ROI
npm run calculate-roi
```

The `last_roi_calculation` timestamp tracks when each institution's ROI was last updated.

### Performance Considerations

- **Indexes**: All sortable/filterable fields are indexed
- **Query optimization**: `COALESCE` used to handle NULL values in sorting
- **Pagination**: API supports `limit` and `offset` parameters
- **Caching**: Consider adding Redis/CDN caching for frequently accessed data

## Troubleshooting

### ROI values seem incorrect

```sql
-- Debug specific institution
SELECT 
  i.name,
  i.implied_roi,
  e.earnings_10_years_after_entry,
  f.net_price,
  f.tuition_in_state,
  i.last_roi_calculation
FROM institutions i
LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
LEFT JOIN financial_data f ON i.unitid = f.unitid
WHERE i.unitid = [UNITID];
```

### No institutions appearing when sorted by ROI

Check if ROI calculation completed successfully:

```sql
SELECT COUNT(*) FROM institutions WHERE implied_roi IS NOT NULL;
```

If count is 0, re-run `npm run calculate-roi`.

### Acceptance rates showing as very small decimals

Acceptance rates are stored as decimals (0.0-1.0). Multiply by 100 for percentage:

```typescript
const acceptancePercent = (institution.acceptance_rate * 100).toFixed(1) + '%';
```

## Related Files

### Migration Scripts
- `database/migrations/002_add_implied_roi_fields.sql` - Schema changes
- `scripts/apply-roi-migration.js` - Migration application script

### Data Population Scripts
- `scripts/populate-scorecard-data.js` - Fetch College Scorecard data
- `scripts/calculate-roi.js` - Calculate and update ROI values

### Application Code
- `src/lib/database.ts` - Updated to include ROI fields and sorting
- `src/app/api/institutions/route.ts` - Default sort changed to `implied_roi`

## Future Enhancements

- [ ] Add ROI visualization charts
- [ ] Show ROI trends over time
- [ ] Compare ROI by major/program
- [ ] Filter institutions by minimum ROI threshold
- [ ] Add "value" badge for high ROI + low cost institutions
- [ ] Calculate ROI by student demographic (first-gen, low-income, etc.)

---

**Last Updated**: October 19, 2025  
**Tickets**: ENG-16, ENG-17, ENG-18
