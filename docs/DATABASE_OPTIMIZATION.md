# Database Optimization for Turso Cost Reduction

## Current Situation
- Turso charges per read/write operation
- Many queries are repeated across user sessions
- Static data (institutions, financial_data) rarely changes
- User-specific data needs fresh reads

## Optimization Strategies

### 1. **Implement Next.js Cache for Static Data** (Recommended)

Cache institution data, financial data, and other rarely-changing data using Next.js built-in caching:

```typescript
// Use React Server Components with cache
import { cache } from 'react'
import { getCollegeDb } from '@/lib/db-helper'

export const getInstitutions = cache(async () => {
  const db = getCollegeDb()
  const result = await db.execute('SELECT * FROM institutions')
  return result.rows
})

// Or use Next.js fetch with revalidation
export async function getInstitutionData(unitid: string) {
  // Revalidate every hour
  const res = await fetch(`/api/institutions/${unitid}`, {
    next: { revalidate: 3600 }
  })
  return res.json()
}
```

**Estimated Savings**: 70-80% reduction in reads for institution/financial data

### 2. **Add Redis/Vercel KV for Frequently Accessed Data**

Cache computed results like:
- Top colleges by ROI
- Scholarship matches
- Analytics aggregations

```typescript
import { kv } from '@vercel/kv'

export async function getTopCollegesByROI() {
  // Try cache first
  const cached = await kv.get('top_colleges_roi')
  if (cached) return cached
  
  // Query database
  const db = getCollegeDb()
  const result = await db.execute(...)
  
  // Cache for 1 hour
  await kv.setex('top_colleges_roi', 3600, result.rows)
  return result.rows
}
```

**Estimated Savings**: 60-70% reduction in complex query reads

### 3. **Batch User Analytics Writes**

Instead of writing on every page view, batch analytics:

```typescript
// Client-side batching
let analyticsBatch = []

export function trackEvent(event) {
  analyticsBatch.push(event)
  
  // Flush every 10 events or 30 seconds
  if (analyticsBatch.length >= 10) {
    flushAnalytics()
  }
}

async function flushAnalytics() {
  if (analyticsBatch.length === 0) return
  
  await fetch('/api/analytics/batch', {
    method: 'POST',
    body: JSON.stringify(analyticsBatch)
  })
  
  analyticsBatch = []
}
```

**Estimated Savings**: 80-90% reduction in analytics writes

### 4. **Use Materialized Views for Aggregations**

Pre-calculate common aggregations:

```sql
-- Create aggregated table (run nightly)
CREATE TABLE institution_stats AS
SELECT 
  i.unitid,
  i.name,
  i.state,
  i.institution_avg_roi,
  COUNT(DISTINCT ss.id) as salary_submission_count,
  AVG(ss.starting_salary) as avg_starting_salary,
  COUNT(DISTINCT eo.id) as earnings_data_points
FROM institutions i
LEFT JOIN salary_submissions ss ON i.unitid = ss.unitid
LEFT JOIN earnings_outcomes eo ON i.unitid = eo.unitid
GROUP BY i.unitid;

-- Query the pre-computed table instead of joining live
SELECT * FROM institution_stats WHERE state = 'CA' LIMIT 10;
```

**Estimated Savings**: 50-60% reduction for analytics queries

### 5. **Implement Query Result Pagination**

Instead of fetching all results:

```typescript
// Bad: Fetches all 6000+ institutions
SELECT * FROM institutions ORDER BY name

// Good: Fetch 50 at a time
SELECT * FROM institutions 
ORDER BY name 
LIMIT 50 OFFSET 0
```

**Estimated Savings**: 90%+ reduction in large dataset queries

### 6. **Add Database Indexes** (Already done in migrations)

Ensure indexes exist on:
- `institutions(unitid)` ✅
- `financial_data(unitid, year)` ✅
- `salary_submissions(user_id)` ✅
- `user_analytics(user_id, timestamp)` ✅

### 7. **Client-Side Caching with SWR**

Use `useSWR` for data fetching with built-in caching:

```typescript
import useSWR from 'swr'

function CollegeDetails({ unitid }) {
  const { data, error } = useSWR(
    `/api/institutions/${unitid}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )
  
  // SWR caches result, deduplicates requests
}
```

**Estimated Savings**: 40-50% reduction in duplicate API calls

## Implementation Priority

### Phase 1 (Quick Wins - This PR)
1. ✅ Add Next.js cache to institution queries
2. ✅ Implement pagination for large lists
3. ✅ Add SWR to frequently accessed pages

### Phase 2 (Medium Effort)
1. Add Vercel KV for hot data
2. Batch analytics writes
3. Create materialized views

### Phase 3 (Long Term)
1. Evaluate alternative providers (Neon, PlanetScale)
2. Consider self-hosted Postgres on Vercel
3. Implement read replicas

## Cost Impact Estimate

Current monthly reads: ~500K-1M
Target reduction: 60-70%
New monthly reads: ~200K-400K

**Potential Monthly Savings**: $30-50 (depending on current costs)

## Next Steps

1. Implement Phase 1 optimizations
2. Monitor Turso dashboard for read/write reduction
3. Profile slow queries
4. Consider KV storage if costs remain high
