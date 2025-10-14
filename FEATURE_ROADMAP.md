# CollegeComps Feature Roadmap

## Status Overview
- ✅ **Completed**: 1 feature
- 🔄 **In Progress**: 0 features
- 📋 **Planned**: 5 features

---

## ✅ Completed Features

### 1. Homepage States Count Label
**Status**: ✅ Deployed (Commit: 50b755e)
**Date**: October 13, 2025

**Problem**: Homepage showed dynamic count from database which could be 59+ (includes territories like PR, GU, VI), causing confusion.

**Solution**: 
- Changed label from "States Covered" to "States & Territories"
- Updated description from "50 states" to "all U.S. states"
- Number remains dynamic based on actual database coverage

---

## 📋 Planned Features

### 2. Bookmark/Save Colleges in College Explorer
**Priority**: High
**Estimated Effort**: 2-3 days
**Dependencies**: User authentication (exists), Profile page updates

**User Story**:
> "As a student exploring colleges, I want to bookmark colleges from the College Explorer so I can easily find and compare them later without searching again."

**Technical Requirements**:

#### Database Schema
```sql
-- Option 1: Use existing saved_comparisons table with new type
ALTER TABLE saved_comparisons ADD COLUMN comparison_type TEXT DEFAULT 'full_roi'; -- 'bookmark', 'full_roi'

-- Option 2: Create dedicated table
CREATE TABLE IF NOT EXISTS bookmarked_colleges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    unitid INTEGER NOT NULL,
    institution_name TEXT NOT NULL,
    bookmarked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    tags TEXT, -- JSON array of user tags
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, unitid)
);

CREATE INDEX idx_bookmarked_user ON bookmarked_colleges(user_id);
CREATE INDEX idx_bookmarked_unitid ON bookmarked_colleges(unitid);
```

#### UI Changes

**College Explorer (`src/app/colleges/page.tsx`)**:
- Add bookmark button to each college card (star icon)
- Show filled star if bookmarked, outline if not
- Click toggles bookmark status
- Toast notification: "Added to bookmarks" / "Removed from bookmarks"

**Profile Page (`src/app/profile/page.tsx`)**:
- Add new section: "Bookmarked Colleges" (collapsible)
- Show list of bookmarked colleges with:
  - Institution name
  - Location
  - Quick stats (tuition, acceptance rate)
  - Remove bookmark button
  - "Compare All" button to send to comparison page

**API Endpoints**:
```typescript
// POST /api/bookmarks/colleges
// Body: { unitid, action: 'add' | 'remove' }

// GET /api/bookmarks/colleges
// Returns: [{ unitid, institution_name, ... }]

// GET /api/bookmarks/colleges/check
// Query: unitid
// Returns: { isBookmarked: boolean }
```

#### Implementation Steps
1. ✅ Create database table/migration
2. ✅ Create API endpoints
3. ✅ Add bookmark button component
4. ✅ Integrate with College Explorer
5. ✅ Add to Profile page
6. ✅ Add bulk comparison feature

---

### 3. Compare Saved ROI Profiles
**Priority**: High
**Estimated Effort**: 4-5 days
**Dependencies**: Enhanced saved comparisons system

**User Story**:
> "As a student comparing financial options, I want to compare different ROI scenarios (full tuition vs scholarship vs financial aid) for the same or different colleges side-by-side."

**Current State**:
- "Compare Colleges" only shows basic institutional attributes
- No way to save ROI calculation scenarios
- No scenario comparison capability

**Target State**:
- Save multiple ROI scenarios per college
- Name scenarios (e.g., "Stanford - Full Scholarship", "Stanford - No Aid", "Berkeley - In-State")
- Compare up to 4 scenarios side-by-side
- Visual diff highlighting (green = better, red = worse)

**Technical Requirements**:

#### Database Schema Enhancement
```sql
CREATE TABLE IF NOT EXISTS roi_scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    unitid INTEGER NOT NULL,
    institution_name TEXT NOT NULL,
    scenario_name TEXT NOT NULL, -- User-defined name
    major TEXT,
    degree_level TEXT,
    
    -- Cost Inputs
    tuition_cost REAL,
    room_board REAL,
    books_supplies REAL,
    other_costs REAL,
    total_cost_per_year REAL,
    years_to_complete INTEGER DEFAULT 4,
    
    -- Aid Inputs
    scholarship_amount REAL DEFAULT 0,
    grants_amount REAL DEFAULT 0,
    work_study REAL DEFAULT 0,
    loans_amount REAL DEFAULT 0,
    net_cost_per_year REAL,
    
    -- Earnings Inputs
    starting_salary REAL,
    salary_growth_rate REAL DEFAULT 0.03,
    years_to_calculate INTEGER DEFAULT 10,
    
    -- Calculated Outputs
    total_investment REAL,
    total_lifetime_earnings REAL,
    roi_value REAL,
    roi_percentage REAL,
    break_even_years REAL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public INTEGER DEFAULT 0,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_roi_scenarios_user ON roi_scenarios(user_id);
CREATE INDEX idx_roi_scenarios_unitid ON roi_scenarios(unitid);
```

#### UI Changes

**ROI Calculator Page (`src/app/roi-calculator/page.tsx`)**:
- Add "Save Scenario" button after calculation
- Modal to name the scenario
- Toast: "Scenario saved successfully"

**New Page: ROI Comparison (`src/app/compare-roi/page.tsx`)**:
```typescript
// Select up to 4 scenarios to compare
// Side-by-side table view:
// | Metric              | Scenario 1 | Scenario 2 | Scenario 3 | Scenario 4 |
// |---------------------|------------|------------|------------|------------|
// | Institution         | Stanford   | Berkeley   | Stanford   | UCLA       |
// | Scenario            | Full Aid   | In-State   | No Aid     | Partial    |
// | Net Cost/Year       | $10,000    | $15,000    | $75,000    | $30,000    |
// | Total Investment    | $40,000    | $60,000    | $300,000   | $120,000   |
// | Starting Salary     | $95,000    | $88,000    | $95,000    | $85,000    |
// | 10-Year ROI         | $910,000   | $820,000   | $650,000   | $730,000   |
// | Break-Even          | 2.5 years  | 3.1 years  | 8.4 years  | 4.7 years  |

// Color coding:
// - Green: Best in category
// - Red: Worst in category
// - Yellow: Middle range
```

**API Endpoints**:
```typescript
// POST /api/roi/scenarios
// Body: { scenario data }

// GET /api/roi/scenarios
// Returns: [{ id, scenario_name, institution_name, ... }]

// GET /api/roi/scenarios/compare
// Query: ids=1,2,3,4
// Returns: { scenarios: [...], analysis: { best_roi, cheapest, fastest_breakeven } }

// DELETE /api/roi/scenarios/:id
```

#### Implementation Steps
1. ✅ Create roi_scenarios table
2. ✅ Add "Save Scenario" to ROI Calculator
3. ✅ Create scenario management page
4. ✅ Build comparison UI
5. ✅ Add color-coded analysis
6. ✅ Export comparison to PDF

---

### 4. Degree-First Enrollment Flow (ROI Calculator)
**Priority**: Medium
**Estimated Effort**: 3-4 days
**Dependencies**: Academic programs search

**User Story**:
> "As a student who knows what I want to study, I want to start by selecting a degree/major and then see which colleges offer it with their respective ROI calculations."

**Current Flow**:
1. Select Institution
2. Select Program (filtered by institution)
3. Calculate ROI

**New Flow Option**:
1. Select Degree/Major (from all programs)
2. See list of institutions offering that degree
3. Select institution(s) to calculate ROI
4. Compare ROI across institutions for same degree

**Technical Requirements**:

#### UI Changes

**ROI Calculator Entry (`src/app/roi-calculator/page.tsx`)**:
```typescript
// Add toggle at top:
// [Start with Institution] <---> [Start with Degree]

// INSTITUTION FIRST (current):
// Search Box: "Search for a college or university..."

// DEGREE FIRST (new):
// Search Box: "Search for a major or degree program..."
// Dropdown: [All Institutions] [Top 100] [Public Only] [Private Only]
// Shows: List of institutions offering the selected degree
```

#### Database Queries

**Find Institutions by Program**:
```sql
SELECT DISTINCT 
    i.unitid,
    i.instnm as institution_name,
    i.city,
    i.stabbr as state,
    i.control as institution_type,
    ap.cip_title as program_name,
    ap.completions,
    f.tuition_in_state,
    f.tuition_out_state,
    e.earnings_10_years_after_entry as avg_salary
FROM academic_programs ap
JOIN institutions i ON ap.unitid = i.unitid
LEFT JOIN financial_data f ON i.unitid = f.unitid
LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
WHERE LOWER(ap.cip_title) LIKE '%computer science%'
  AND ap.completions > 0
ORDER BY ap.completions DESC, i.instnm ASC
LIMIT 50;
```

#### New Component: `DegreeFirstFlow.tsx`
```typescript
interface DegreeFirstFlowProps {
  onInstitutionSelect: (unitid: string, degree: string) => void;
}

// Features:
// 1. Degree search with autocomplete
// 2. Institution list with key stats
// 3. Quick comparison checkboxes
// 4. "Calculate ROI for Selected" button
// 5. Sort by: Completions, Cost, Salary, ROI
```

#### API Endpoints
```typescript
// GET /api/programs/search
// Query: q=computer%20science&limit=20
// Returns: [{ cipcode, program_name, institution_count }]

// GET /api/programs/:cipcode/institutions
// Returns: [{ unitid, institution_name, completions, tuition, salary }]

// POST /api/roi/bulk-calculate
// Body: { cipcode, unitids: [123, 456, 789], user_assumptions: {...} }
// Returns: [{ unitid, roi_results: {...} }]
```

#### Implementation Steps
1. ✅ Add toggle switch to ROI Calculator
2. ✅ Create degree search component
3. ✅ Build institution list view
4. ✅ Add multi-select comparison
5. ✅ Create bulk ROI calculation endpoint
6. ✅ Add results visualization

---

### 5. Data Source Citations (ROI Calculator)
**Priority**: Medium-High
**Estimated Effort**: 1-2 days
**Dependencies**: None

**User Story**:
> "As a student making important financial decisions, I want to know where the data comes from so I can trust the ROI calculations."

**Requirements**:
- Add citations/footnotes below each data input section
- Link to official sources
- Explain assumptions and methodology
- Show data freshness (last updated date)

**Technical Requirements**:

#### Data Sources to Cite

**Education Costs**:
- Source: IPEDS (Integrated Postsecondary Education Data System)
- Dataset: Institutional Characteristics, Student Charges
- Year: 2023-2024
- Update Frequency: Annual
- URL: https://nces.ed.gov/ipeds/

**Earnings Data**:
- Source 1: College Scorecard (U.S. Department of Education)
- Metric: Median earnings 10 years after entry
- Year: 2022 data (most recent available)
- URL: https://collegescorecard.ed.gov/

- Source 2: User-submitted salary data (when available)
- Minimum submissions: 3 approved submissions per program
- Displays: "Based on X real salary submissions"

**Financial Aid**:
- Source: IPEDS, Federal Student Aid
- Metrics: Average grant aid, net price
- Year: 2023-2024

**Inflation & Growth Rates**:
- Salary Growth: 3.5% annually (BLS historical average)
- Source: Bureau of Labor Statistics
- URL: https://www.bls.gov/

- Tuition Inflation: 4.5% annually (NCES historical trend)
- Source: National Center for Education Statistics

**Employment Rates**:
- Source: College Scorecard
- Metric: Employment rate 2 years after graduation
- Year: 2022

#### UI Implementation

**Citation Component**: `<DataCitation />`
```typescript
interface DataCitationProps {
  sources: {
    name: string;
    description: string;
    year: string;
    url?: string;
    lastUpdated?: string;
  }[];
  assumptions?: string[];
}

// Example usage:
<DataCitation 
  sources={[
    { 
      name: "IPEDS", 
      description: "Tuition and fees data",
      year: "2023-2024",
      url: "https://nces.ed.gov/ipeds/",
      lastUpdated: "September 2024"
    }
  ]}
  assumptions={[
    "Tuition increases 4.5% annually",
    "Full-time enrollment for 4 years"
  ]}
/>
```

**Placement in ROI Calculator**:

```tsx
{/* Education Costs Section */}
<div className="bg-white rounded-lg shadow p-6 mb-6">
  <h2>Education Costs</h2>
  
  {/* Input fields */}
  <input name="tuition" ... />
  <input name="room_board" ... />
  
  {/* Citation at bottom of section */}
  <DataCitation 
    sources={[
      { name: "IPEDS 2023-2024", description: "Institutional cost data", url: "..." }
    ]}
    assumptions={[
      "Based on published sticker prices (before aid)",
      "Room & board based on on-campus housing costs"
    ]}
  />
</div>

{/* Earnings Projections Section */}
<div className="bg-white rounded-lg shadow p-6 mb-6">
  <h2>Earnings Projections</h2>
  
  {/* Input fields */}
  <input name="starting_salary" ... />
  
  <DataCitation 
    sources={[
      { name: "College Scorecard", description: "Graduate earnings data", year: "2022", url: "..." },
      { name: "User Submissions", description: "Real salary data from alumni", year: "2024-2025" }
    ]}
    assumptions={[
      "Salary increases 3.5% annually (BLS average)",
      "Assumes full-time employment"
    ]}
  />
</div>
```

#### Citation Modal
- Add "Learn More" link in citation
- Opens modal with detailed methodology
- Includes:
  - Full data collection process
  - Limitations and caveats
  - How to report data issues
  - Last database update timestamp

#### Implementation Steps
1. ✅ Create `DataCitation` component
2. ✅ Add citation data constants
3. ✅ Place citations in ROI Calculator
4. ✅ Create methodology modal
5. ✅ Add "Report Data Issue" link
6. ✅ Update footer with data freshness

---

### 6. Auto-Save ROI Calculations on Page Leave
**Priority**: High
**Estimated Effort**: 2 days
**Dependencies**: ROI scenario system (Feature #3)

**User Story**:
> "As a student exploring different scenarios, I don't want to lose my work if I accidentally navigate away or close the tab."

**Requirements**:
- Detect when user navigates away from ROI Calculator
- Show confirmation modal: "Save this calculation?"
- Auto-save draft every 30 seconds
- Restore draft when returning
- Limit: 5 draft calculations per user

**Technical Requirements**:

#### Auto-Save Mechanism

**Draft Storage**:
```sql
-- Use roi_scenarios table with is_draft flag
ALTER TABLE roi_scenarios ADD COLUMN is_draft INTEGER DEFAULT 0;

-- Draft scenarios:
-- - Not shown in main scenarios list
-- - Auto-deleted after 7 days
-- - Limit 5 per user (delete oldest when exceeded)
```

#### Browser Storage (Fallback)
```typescript
// Use localStorage for immediate persistence
interface DraftCalculation {
  unitid: string;
  institution_name: string;
  formData: {
    tuition: number;
    room_board: number;
    // ... all form fields
  };
  timestamp: number;
  isDraft: true;
}

// Save to localStorage every 30 seconds
localStorage.setItem('roi-draft', JSON.stringify(draft));

// Restore on page load
const draft = localStorage.getItem('roi-draft');
if (draft && shouldRestore(draft)) {
  // Show "Continue where you left off?" banner
}
```

#### Page Leave Detection

**Navigation Guard**:
```typescript
// src/app/roi-calculator/page.tsx

const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [showSaveModal, setShowSaveModal] = useState(false);

// Detect form changes
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = ''; // Chrome requires this
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);

// Detect Next.js navigation
useEffect(() => {
  const handleRouteChange = () => {
    if (hasUnsavedChanges) {
      setShowSaveModal(true);
      // Prevent navigation temporarily
      return false;
    }
  };
  
  router.events?.on('beforeHistoryChange', handleRouteChange);
  return () => router.events?.off('beforeHistoryChange', handleRouteChange);
}, [hasUnsavedChanges]);
```

#### Save Modal Component

```typescript
<Modal 
  isOpen={showSaveModal}
  onClose={() => setShowSaveModal(false)}
  title="Save Your Calculation?"
>
  <p>You have unsaved changes. Would you like to save this ROI calculation?</p>
  
  <input 
    placeholder="Name this scenario (optional)" 
    value={scenarioName}
    onChange={(e) => setScenarioName(e.target.value)}
  />
  
  <div className="flex gap-4">
    <button onClick={handleSave}>Save</button>
    <button onClick={handleSaveDraft}>Save as Draft</button>
    <button onClick={handleDiscard}>Discard</button>
  </div>
</Modal>
```

#### Auto-Save Indicator
```typescript
// Small indicator in top-right
<div className="text-sm text-gray-500">
  {autoSaveStatus === 'saving' && 'Saving draft...'}
  {autoSaveStatus === 'saved' && '✓ Draft saved'}
  {autoSaveStatus === 'error' && '⚠ Failed to save'}
</div>
```

#### Draft Management Page

**Profile → Drafts Section**:
```typescript
<div className="bg-white rounded-lg p-6">
  <h3>Draft Calculations (5 max)</h3>
  
  {drafts.map(draft => (
    <div key={draft.id} className="border-b py-3">
      <div className="flex justify-between">
        <div>
          <p className="font-semibold">{draft.institution_name}</p>
          <p className="text-sm text-gray-500">
            {draft.major} • {timeAgo(draft.timestamp)}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => restoreDraft(draft)}>Continue</button>
          <button onClick={() => deleteDraft(draft.id)}>Delete</button>
        </div>
      </div>
    </div>
  ))}
</div>
```

#### API Endpoints
```typescript
// POST /api/roi/drafts
// Body: { formData, isDraft: true }
// Auto-called every 30 seconds

// GET /api/roi/drafts
// Returns: [{ id, institution_name, timestamp, formData }]

// DELETE /api/roi/drafts/:id

// POST /api/roi/drafts/:id/convert
// Converts draft to saved scenario
```

#### Implementation Steps
1. ✅ Add is_draft column to roi_scenarios
2. ✅ Implement localStorage backup
3. ✅ Add beforeunload handler
4. ✅ Create save modal
5. ✅ Add auto-save timer (30s)
6. ✅ Add draft restoration on page load
7. ✅ Create drafts management in profile
8. ✅ Add auto-save indicator

---

## Implementation Priority

### Phase 1: User Experience Enhancements (Week 1-2)
1. ✅ Fix homepage states label (DONE)
2. 🔄 Bookmark colleges feature
3. 🔄 Auto-save ROI calculations

### Phase 2: Comparison & Analysis (Week 3-4)
4. 🔄 Compare saved ROI profiles
5. 🔄 Data source citations

### Phase 3: Alternative Flows (Week 5)
6. 🔄 Degree-first enrollment flow

---

## Success Metrics

### Bookmark Feature
- Target: 30% of active users bookmark at least 1 college
- Metric: bookmarked_colleges table row count
- Success: Increased time on site, higher comparison rate

### ROI Comparison
- Target: Users create average of 2.5 scenarios per college
- Metric: roi_scenarios table row count / unique unitids
- Success: Better informed decisions (measured by survey)

### Degree-First Flow
- Target: 20% of ROI calculations start with degree search
- Metric: Track flow_type in analytics
- Success: Higher completion rate for degree-focused users

### Data Citations
- Target: 50% reduction in "data source?" support tickets
- Metric: Support ticket analysis
- Success: Increased trust scores (measured by survey)

### Auto-Save
- Target: 90% draft recovery rate (no lost work)
- Metric: drafts created vs drafts restored
- Success: Reduced "lost my work" complaints

---

## Technical Debt Considerations

### Database Migrations
- All new tables should use migrations
- Version control schema changes
- Test rollback procedures

### Performance
- Index new tables properly
- Monitor query performance
- Consider caching for comparison views

### Testing
- Unit tests for new API endpoints
- Integration tests for save/restore flows
- E2E tests for critical user journeys

### Documentation
- Update API documentation
- Create user guides for new features
- Document data source methodology

---

## Questions for Product Owner

1. **Bookmark Feature**: Should bookmarks have tags/folders for organization?
2. **ROI Comparison**: Limit to 4 scenarios or allow more?
3. **Degree-First**: Should this be a separate page or toggle in existing ROI Calculator?
4. **Citations**: How detailed should methodology documentation be?
5. **Auto-Save**: Should drafts be shareable (public/private links)?

---

## Next Steps

1. Review and prioritize features with team
2. Create detailed technical specs for Phase 1 features
3. Set up project tracking (GitHub Issues / Jira)
4. Assign development resources
5. Begin implementation of Phase 1

---

*Last Updated: October 13, 2025*
*Document Owner: Development Team*
