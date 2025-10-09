# Historical Trends Performance Analysis

**Issue:** Historical Trends page takes 3min 43sec to load

## Potential Bottlenecks

### 1. **Auth Middleware (High Probability)**
```typescript
const session = await auth(); // Hits users DB every request
```
- NextAuth queries users database on every API call
- No session caching
- Turso remote connection latency

### 2. **Database Queries** 
- Query 1: `v_yearly_cost_trends` view
- Query 2: `v_salary_submissions_summary` view  
- Query 3: `v_top_programs_by_completions` view
- Each Turso query has network latency (~100-500ms per query)

### 3. **No Response Caching**
- Same data returned for all users
- No CDN caching headers
- Regenerated on every request

## Solutions

### Quick Wins (Immediate)

1. **Add Response Caching**
```typescript
export const revalidate = 300; // Cache for 5 minutes
```

2. **Skip Auth for Cached Data**
```typescript
// Check cache first, skip auth if cached
const cached = await getCache('historical-trends');
if (cached) return cached;
// Then do auth check
```

3. **Parallel Queries**
```typescript
const [actualData, userSalary, topPrograms] = await Promise.all([
  db.prepare(...).get(),
  usersDb.prepare(...).get(),
  db.prepare(...).all()
]);
```

### Medium Term

4. **Move to Edge Runtime**
```typescript
export const runtime = 'edge';
```
- Faster cold starts
- Better global distribution

5. **Pre-compute Trends**
- Generate trends data in background job
- Store in Redis/Vercel KV
- API just fetches pre-computed data

### Long Term

6. **GraphQL with DataLoader**
- Batch database queries
- Reduce N+1 problems

7. **Materialized Views**
- Pre-aggregate all trend data
- Update on schedule, not on request

## Testing Plan

1. Add timing logs (DONE)
2. Deploy and check logs
3. Identify slowest operation
4. Apply targeted fix
5. Re-test

## Expected Results

- **Current**: 3min 43sec
- **After caching**: <2 seconds
- **After edge runtime**: <500ms
- **After pre-compute**: <100ms
