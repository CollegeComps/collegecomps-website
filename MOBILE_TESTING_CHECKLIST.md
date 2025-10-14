# Mobile Responsive Testing Checklist

## Testing Instructions
Test all pages at the following breakpoints:
- **Mobile S**: 320px (iPhone SE)
- **Mobile M**: 375px (iPhone 12/13)
- **Mobile L**: 425px (Large phones)
- **Tablet**: 768px (iPad)
- **Desktop**: 1024px+

## Pages to Test

### ✅ Homepage (/)
- [ ] Hero section text readable on small screens
- [ ] Stats cards stack properly on mobile
- [ ] Example ROI calculation displays correctly
- [ ] Testimonials cards stack on mobile
- [ ] DataSourcesFooter doesn't overflow
- [ ] CTA buttons have adequate spacing and are tappable (≥44x44px)

### ✅ ROI Calculator (/roi-calculator)
- [ ] Institution search dropdown works on mobile
- [ ] Program search dropdown works on mobile
- [ ] Cost inputs are easy to tap and type
- [ ] Results cards stack properly
- [ ] Charts are visible and don't overflow
- [ ] Save scenario button is accessible
- [ ] All form fields have touch targets ≥44x44px

### ✅ College Explorer (/colleges)
- [ ] Search bar full width on mobile
- [ ] Filters collapse/expand properly
- [ ] Filter dropdowns work on touch devices
- [ ] College cards stack nicely
- [ ] "Load More" button is accessible
- [ ] Bookmark icons have adequate touch targets
- [ ] DataSourcesBadge displays correctly

### ✅ Compare Colleges (/compare)
- [ ] Search input full width on mobile
- [ ] Selected colleges display as list on mobile (not grid)
- [ ] Comparison table scrolls horizontally if needed
- [ ] Remove college buttons are tappable
- [ ] Save comparison button accessible

### ✅ Historical Trends (/historical-trends)
- [ ] Charts resize properly on small screens
- [ ] Chart legends don't overflow
- [ ] Category cards stack on mobile
- [ ] Top programs table scrolls if needed
- [ ] Predictions section readable

### ✅ Profile (/profile)
- [ ] Tabs work on mobile
- [ ] Saved scenarios list properly
- [ ] Load/Delete buttons have adequate touch targets
- [ ] Edit profile form inputs are accessible
- [ ] Subscription info displays correctly

### ✅ Pricing (/pricing)
- [ ] Pricing cards stack on mobile
- [ ] Feature lists readable
- [ ] Subscribe buttons accessible
- [ ] Toggle between Free/Premium clear

### ✅ Salary Insights (/salary-insights)
- [ ] Search inputs work on mobile
- [ ] Data visualization scales properly
- [ ] Submit salary form accessible
- [ ] All inputs have adequate touch targets

## Common Mobile Issues to Fix

### Navigation
- [ ] Sidebar converts to mobile menu on small screens
- [ ] Mobile menu icon visible and tappable
- [ ] Menu items have adequate spacing
- [ ] User avatar/menu works on mobile

### Typography
- [ ] Headings don't overflow containers
- [ ] Text is readable (min 14px body text)
- [ ] Line heights appropriate for mobile
- [ ] No horizontal scrolling due to text

### Buttons & Links
- [ ] All touch targets ≥ 44x44px
- [ ] Button text doesn't truncate
- [ ] Adequate spacing between interactive elements
- [ ] CTAs prominent and accessible

### Forms
- [ ] Input fields full width on mobile
- [ ] Labels clearly associated with inputs
- [ ] Error messages visible
- [ ] Submit buttons easy to tap
- [ ] Dropdowns work properly on touch

### Cards & Containers
- [ ] Cards stack properly (no side-by-side cramming)
- [ ] Proper padding/margins on mobile
- [ ] No content cut off
- [ ] Images scale responsively

### Data Display
- [ ] Tables scroll horizontally if needed
- [ ] Charts resize without breaking
- [ ] Stats displays stack on mobile
- [ ] Long numbers don't overflow

## Current Responsive Patterns in Use

Based on code review, the app uses:
- Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- Flexbox with `flex-col` → `sm:flex-row` patterns
- Grid with responsive column counts
- `max-w-*` containers for content width
- `px-4 sm:px-6 lg:px-8` responsive padding

## Known Good Patterns
- Hero sections use `text-3xl sm:text-4xl lg:text-5xl` for responsive text
- Feature grids use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Navigation hidden on mobile, shows on `md:` breakpoint
- Buttons use full width on mobile: `w-full sm:w-auto`

## Fixes to Implement

### Priority 1: Critical Mobile Issues
1. **Sidebar Navigation**: Ensure mobile menu works (likely already has hamburger menu)
2. **Homepage Example ROI**: Check if calculation section stacks properly
3. **ROI Calculator**: Verify dropdowns and inputs work on touch
4. **Compare Table**: Ensure horizontal scroll on mobile

### Priority 2: Touch Target Compliance
- Audit all buttons to ensure ≥44x44px
- Check icon buttons (bookmark, delete, etc.)
- Verify dropdown triggers have adequate size

### Priority 3: Content Overflow
- Check DataSourcesFooter on 320px width
- Verify long college names don't break layout
- Test number formatting doesn't overflow containers

## Testing Commands

```bash
# Start dev server
npm run dev

# Test responsive in browser
# Chrome DevTools → Toggle Device Toolbar (Cmd+Shift+M)
# Test at: 320px, 375px, 768px, 1024px, 1440px
```

## Sign-off Criteria
- [ ] All pages tested at 5 breakpoints
- [ ] No horizontal scrolling on any page
- [ ] All interactive elements ≥44x44px
- [ ] Text readable without zooming
- [ ] Forms fully functional on touch devices
- [ ] Charts and data displays properly
- [ ] Navigation works smoothly
- [ ] No content cut off or overlapping

## Notes
- Most pages already use Tailwind responsive utilities
- ErrorBoundary component is responsive by default
- DataSources components designed with responsive in mind
- Main concern: Tables and charts on very small screens
