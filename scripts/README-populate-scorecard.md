# College Scorecard Data Population

This script populates the Turso database with College Scorecard data including:
- Median earnings (10 years after entry)
- Acceptance rates
- SAT/ACT test score ranges (25th-75th percentile)
- Completion rates
- Student enrollment counts

## Prerequisites

1. Set up environment variables in `.env.local`:
   ```bash
   TURSO_DATABASE_URL=libsql://collegecomps-...
   TURSO_AUTH_TOKEN=your-auth-token
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Run the script to populate/update data:

```bash
npm run populate-scorecard
```

## What it does

1. Fetches data from the College Scorecard API (paginated, ~6000+ institutions)
2. Updates `earnings_outcomes` table with:
   - earnings_10_years_after_entry
   - completion_rate
   - student_count

3. Updates `admissions_data` table with:
   - applicants_total / admissions_total (to calculate acceptance rate)
   - SAT score ranges (math and verbal, 25th-75th percentile)
   - ACT score ranges (composite, 25th-75th percentile)

## Rate Limiting

- 2-second delay between requests
- 100 institutions per page
- Progress checkpoints every 10 pages
- Estimated runtime: ~15-20 minutes for full dataset

## Output

The script provides real-time progress updates:
```
[15.2%] Processing page 45/295...
   Retrieved 100 institutions
   Earnings: 67 updated, 23 inserted
   Admissions: 82 updated, 18 inserted
```

## Error Handling

- Skips institutions with no data
- Logs errors for individual institution updates
- Continues processing even if some updates fail
- Safe to run multiple times (upsert logic)

## Next Steps

After running this script, you can:
1. Add `implied_roi` calculated field to institutions table
2. Implement ROI sorting on landing page
3. Add acceptance rate and test score filters
4. Build college match questionnaire with academic data
