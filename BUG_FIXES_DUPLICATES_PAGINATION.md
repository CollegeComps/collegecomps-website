# 🐛 Bug Fixes - Duplicate Institutions & Performance Issues

**Date:** October 9, 2025  
**Status:** ✅ Complete

---

## 🔍 Issues Identified

### 1. **Duplicate Institutions in Search Results**
**Problem:** Institutions appearing multiple times in:
- ROI Calculator
- College Explorer  
- Compare Colleges page

**Root Cause:** Database queries joined `financial_data` table without filtering by year. Since we now have 5 years of data (2019-2023), each institution appeared once per year.

**Example:**
```sql
-- OLD (Wrong) - Creates 5 duplicates per school
LEFT JOIN financial_data f ON i.unitid = f.unitid

-- NEW (Fixed) - Gets only latest year
LEFT JOIN financial_data f ON i.unitid = f.unitid 
  AND f.year = (SELECT MAX(year) FROM financial_data WHERE unitid = i.unitid)
```

---

### 2. **Load More Button Repeating Initial Results**
**Problem:** Clicking "Load More Results" showed the same first 30 institutions again.

**Root Cause:** Frontend was sending `offset` parameter, but API expected `page` parameter.

**Before:**
```typescript
const offset = (currentPage - 1) * limit;
params.append('offset', offset.toString());
```

**After:**
```typescript
params.append('page', currentPage.toString());
params.append('limit', '30');
```

---

### 3. **Console Warning: setInterval Handler Slow**
**Problem:** `[Violation] 'setInterval' handler took 361ms` warning in console.

**Root Cause:** Search triggered immediately on every keystroke, causing rapid API calls without debouncing.

**Solution:** Added 500ms debounce to search input:
```typescript
useEffect(() => {
  const debounceTimer = setTimeout(() => {
    fetchInstitutions();
    setPage(1);
  }, filters.search ? 500 : 0); // Debounce search only

  return () => clearTimeout(debounceTimer);
}, [filters]);
```

---

## ✅ Files Modified

### 1. **src/lib/database.ts** (3 functions updated)

#### `getInstitutions()`
```typescript
// Line 124-125: Added year filter
LEFT JOIN financial_data f ON i.unitid = f.unitid 
  AND f.year = (SELECT MAX(year) FROM financial_data WHERE unitid = i.unitid)
```

#### `getInstitutionByUnitid()`
```typescript
// Line 204-205: Added year filter
LEFT JOIN financial_data f ON i.unitid = f.unitid 
  AND f.year = (SELECT MAX(year) FROM financial_data WHERE unitid = i.unitid)
```

#### `searchInstitutions()`
```typescript
// Line 340-341: Added year filter
LEFT JOIN financial_data f ON i.unitid = f.unitid 
  AND f.year = (SELECT MAX(year) FROM financial_data WHERE unitid = i.unitid)
```

### 2. **src/app/colleges/page.tsx** (2 improvements)

#### Fixed Pagination
```typescript
// Line 103-105: Changed from offset to page
params.append('page', currentPage.toString());
params.append('limit', limit.toString());
```

#### Added Search Debouncing
```typescript
// Line 97-104: Debounce search queries
useEffect(() => {
  const debounceTimer = setTimeout(() => {
    fetchInstitutions();
    setPage(1);
  }, filters.search ? 500 : 0);
  
  return () => clearTimeout(debounceTimer);
}, [filters]);
```

---

## 🎯 Impact

### Before Fixes
- ❌ Each institution appeared 5 times (once per year of data)
- ❌ Load more showed same 30 results repeatedly
- ❌ Search triggered API call on every keystroke
- ❌ Console warnings about slow handlers
- ❌ Poor user experience with duplicates

### After Fixes
- ✅ Each institution appears exactly once
- ✅ Load more correctly fetches next 30 results
- ✅ Search waits 500ms after typing stops
- ✅ No console warnings
- ✅ Clean, efficient user experience

---

## 🚀 Performance Improvements

1. **Reduced Database Load:** 80% fewer rows returned (1 row vs 5 rows per institution)
2. **Faster Queries:** Subquery with MAX(year) uses indexed year column
3. **Better UX:** Debouncing reduces API calls from ~10/search to 1/search
4. **Cleaner Results:** No duplicate handling needed in frontend

---

## 🔍 Query Performance

### Latest Year Subquery
```sql
f.year = (SELECT MAX(year) FROM financial_data WHERE unitid = i.unitid)
```

**Performance Notes:**
- Uses existing `idx_financial_year` index
- Executes once per institution
- Returns single most recent year
- Fast even with 18K+ financial records

**Alternative Considered:**
```sql
-- Could also use window function (more complex, similar performance)
ROW_NUMBER() OVER (PARTITION BY unitid ORDER BY year DESC) = 1
```

---

## 📊 Data Verification

### Expected Behavior

**College Explorer:**
- Each institution appears once
- Shows latest financial data (2023 for most schools)
- Pagination works correctly (30, 60, 90, etc.)

**ROI Calculator:**
- No duplicate institutions in autocomplete
- Uses latest available year's costs

**Compare Colleges:**
- Each institution selectable only once
- Latest financial data for comparisons

**Historical Trends (Exception):**
- Still uses ALL years (2019-2023)
- This is correct - needs multi-year data for trends

---

## 🧪 Testing Checklist

- [x] College Explorer shows unique institutions
- [x] Load More pagination works correctly
- [x] Search debouncing prevents rapid API calls
- [x] ROI Calculator no duplicates
- [x] Compare Colleges no duplicates
- [x] Historical Trends still shows multi-year data
- [x] Console warnings resolved
- [x] Query performance acceptable

---

## 📝 Additional Notes

### Historical Trends Exception
The `/api/trends/historical` endpoint is **intentionally excluded** from these fixes because it needs multi-year data to show trends over time. That query correctly retrieves 2019-2023 data.

### Future Considerations
1. Consider adding a materialized view for "latest financial data" if queries become slow
2. Monitor query performance as data grows beyond 5 years
3. May want to add caching for frequently accessed institution data

---

## 🎉 Summary

All three reported issues have been resolved:
1. ✅ Duplicate institutions fixed via year filtering
2. ✅ Load More pagination corrected
3. ✅ Search performance improved with debouncing

The application now correctly shows each institution exactly once with its most recent financial data, while maintaining the ability to view historical trends where needed.
