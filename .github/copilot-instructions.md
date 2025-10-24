# GitHub Copilot Instructions for CollegeComps Web

You are a senior full-stack engineer working on the CollegeComps platform. Follow these guidelines strictly.

## 🎯 Core Principles

1. **Test Everything**: Always test changes locally before committing
2. **Branch Workflow**: Create feature branches and PRs for all changes
3. **Jira Integration**: Use Jira ticket numbers (ENG-XX) in branch names and PR titles
4. **Documentation**: Only create markdown files when explicitly requested
5. **Commit Quality**: Short, focused commit messages (max 72 characters)
6. **Testing**: Write integration tests for new features and critical workflows
7. **Validation**: Always validate database queries, API responses, and user flows

---

## 📋 Workflow

### Before Making Changes

1. **Create Jira Ticket**:
   ```bash
   # Use acli to create ticket
   acli jira create --project ENG --type Task --summary "Your task description"
   # Get ticket number (e.g., ENG-123)
   ```

2. **Create Feature Branch**:
   ```bash
   git checkout -b ENG-123/short-description
   # Example: ENG-123/add-roi-calculator-validation
   ```

### Making Changes

3. **Test Locally**:
   ```bash
   # Always run these before committing
   npm run build          # Verify build works
   npm run lint           # Check for linting errors
   npm run test           # Run test suite (if exists)
   ```

4. **Validate Changes**:
   - **Database queries**: Test with real data using Turso CLI
   - **API endpoints**: Test with curl or Postman
   - **User workflows**: Click through the entire flow
   - **Edge cases**: Test error states, empty states, loading states

5. **Write Tests** (when applicable):
   ```typescript
   // For new features or critical business logic
   // Example: __tests__/roi-calculator.test.ts
   describe('ROI Calculator', () => {
     it('should calculate correct net ROI', () => {
       // Test implementation
     });
   });
   ```

### Committing

6. **Commit Format**:
   ```bash
   # Format: type: short description
   # Max 72 characters, lowercase, no period
   
   # Good examples:
   git commit -m "fix: resolve duplicate degree search results"
   git commit -m "feat: add email verification to signup flow"
   git commit -m "refactor: simplify roi calculation logic"
   git commit -m "test: add integration tests for auth flow"
   
   # Bad examples (DON'T DO THIS):
   git commit -m "Fixed the bug where the degree search was returning duplicate results and also updated the UI to show better error messages and refactored some code"
   git commit -m "Updates"
   git commit -m "WIP"
   ```

   **Commit Types**:
   - `feat`: New feature
   - `fix`: Bug fix
   - `refactor`: Code refactoring (no functionality change)
   - `test`: Adding or updating tests
   - `docs`: Documentation only
   - `perf`: Performance improvement
   - `chore`: Maintenance (dependencies, configs)

### Creating PR

7. **Push and Create PR**:
   ```bash
   git push origin ENG-123/short-description
   ```

8. **PR Title Format**:
   ```
   ENG-123: Short description of changes
   
   # Examples:
   ENG-123: Add email verification to signup flow
   ENG-456: Fix duplicate degree search results
   ENG-789: Improve ROI calculator performance
   ```

9. **PR Description Template**:
   ```markdown
   ## Summary
   Brief description of what this PR does.
   
   ## Jira Ticket
   [ENG-123](https://collegecomps.atlassian.net/browse/ENG-123)
   
   ## Changes
   - Bullet point list of specific changes
   - Each change should be clear and concise
   
   ## Testing Done
   - [ ] Tested locally (npm run build successful)
   - [ ] Tested user flow end-to-end
   - [ ] Validated database queries
   - [ ] Added/updated integration tests
   - [ ] Checked mobile responsiveness (if UI change)
   
   ## Screenshots (if UI change)
   [Add screenshots here]
   
   ## Deployment Notes
   - Any special deployment steps
   - Environment variable changes needed
   - Database migrations required
   ```

---

## 🚫 Never Do This

1. **Don't create markdown files unless requested**:
   - No `CHANGELOG.md`, `TODO.md`, `NOTES.md`, etc.
   - Only create docs when explicitly asked

2. **Don't commit directly to main**:
   - Always use feature branches
   - Always create PRs

3. **Don't use generic commit messages**:
   - ❌ "updates", "fixes", "changes", "wip"
   - ✅ "fix: resolve email verification token expiry"

4. **Don't skip testing**:
   - Never commit without running `npm run build`
   - Never deploy without testing the workflow

5. **Don't merge without validation**:
   - Ensure all tests pass
   - Verify the PR checklist is complete

---

## ✅ Always Do This

### Database Changes

```bash
# Always test queries with Turso CLI before implementing
turso db shell collegecomps

# Example validation:
sqlite> SELECT COUNT(*) FROM institutions WHERE name IS NULL;
# Should return 0

# Test the actual query you're implementing:
sqlite> SELECT * FROM institutions WHERE state = 'CA' LIMIT 5;
```

- Always test database changes against dev if it works and nothing breaks before deploying to production.

### API Endpoints

```bash
# Test locally first
curl http://localhost:3000/api/your-endpoint

# Test on production (after deploy)
curl https://www.collegecomps.com/api/your-endpoint

# Validate response structure, error handling, edge cases
```

### User Workflows

**Example: Email Verification Flow**
1. Sign up with new email
2. Check email received
3. Click verification link
4. Verify redirect works
5. Verify database updated (email_verified = 1)
6. Test expired token scenario
7. Test invalid token scenario

### Integration Tests

```typescript
// Example: tests/integration/auth.test.ts
describe('Authentication Flow', () => {
  it('should complete full signup and verification flow', async () => {
    // 1. Sign up
    const signupResponse = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'pass123' })
    });
    expect(signupResponse.status).toBe(201);
    
    // 2. Verify email sent (mock or check logs)
    // 3. Simulate clicking verification link
    // 4. Verify user can sign in
  });
  
  it('should reject expired verification tokens', async () => {
    // Test implementation
  });
});
```

---

## 🔍 Code Review Checklist

Before requesting review, ensure:

- [ ] **Builds successfully**: `npm run build` passes
- [ ] **No lint errors**: `npm run lint` passes
- [ ] **Tests pass**: `npm run test` (if tests exist)
- [ ] **Queries validated**: Tested with Turso CLI
- [ ] **API tested**: Tested with curl/Postman
- [ ] **User flow tested**: Clicked through entire feature
- [ ] **Edge cases handled**: Error states, loading states, empty states
- [ ] **Mobile responsive**: Checked on mobile viewport (if UI)
- [ ] **Performance checked**: No obvious performance issues
- [ ] **Security reviewed**: No credentials exposed, inputs sanitized
- [ ] **Integration test added**: For critical business logic
- [ ] **Commit messages clean**: Short, descriptive, proper format
- [ ] **PR description complete**: Summary, ticket link, testing checklist

---

## 📊 Testing Standards

### What Needs Tests

**Always write tests for**:
- ROI calculation logic (critical business logic)
- Authentication flows (signup, login, verification, password reset)
- Payment/subscription logic (if applicable)
- Data validation functions
- API endpoint critical paths

**Consider tests for**:
- UI components (if time permits)
- Utility functions
- Database queries (complex joins, aggregations)

**Don't need tests for**:
- Simple CRUD operations
- Static pages
- One-off scripts

### Test File Naming

```
src/
  lib/
    roi-calculator.ts
  __tests__/
    roi-calculator.test.ts
    
app/
  api/
    auth/
      signup/
        route.ts
  __tests__/
    api/
      auth/
        signup.test.ts
```

---

## 🛠️ Common Validation Patterns

### Database Query Validation

```typescript
// Before implementing in code, test in Turso CLI:
turso db shell collegecomps

-- Check for NULL values
SELECT COUNT(*) FROM table WHERE critical_field IS NULL;

-- Verify data quality
SELECT * FROM table WHERE state = 'CA' LIMIT 5;

-- Test JOIN performance
EXPLAIN QUERY PLAN
SELECT * FROM institutions i
JOIN academic_programs ap ON i.unitid = ap.unitid
WHERE i.state = 'CA';
```

### API Response Validation

```typescript
// Always validate:
// 1. Success case
// 2. Error cases (400, 401, 403, 404, 500)
// 3. Edge cases (empty results, malformed input)

// Example test:
const response = await fetch('/api/colleges?state=CA');
const data = await response.json();

// Validate structure
expect(data).toHaveProperty('colleges');
expect(Array.isArray(data.colleges)).toBe(true);
expect(data.colleges[0]).toHaveProperty('name');

// Validate data quality
expect(data.colleges.length).toBeGreaterThan(0);
expect(data.colleges[0].name).not.toBeNull();
```

### User Flow Validation

```typescript
// Document the expected flow in comments:

/**
 * Email Verification Flow:
 * 1. User signs up → verification_token created (24h expiry)
 * 2. Email sent with verification link
 * 3. User clicks link → token validated
 * 4. Database updated → email_verified = true
 * 5. User redirected to dashboard
 * 
 * Edge cases:
 * - Expired token (> 24h old) → show error, offer resend
 * - Invalid token → show error, redirect to login
 * - Already verified → redirect to dashboard
 */
```

---

## 🎯 Examples of Good PRs

### Example 1: Bug Fix

```
Title: ENG-234: Fix duplicate degree search results

## Summary
Fixed SQL query that was returning duplicate programs due to incorrect GROUP BY clause.

## Jira Ticket
[ENG-234](https://collegecomps.atlassian.net/browse/ENG-234)

## Changes
- Updated programs/search API to GROUP BY cip_title
- Removed FTS5 query, replaced with LIKE-based search
- Added relevance scoring for better result ordering

## Testing Done
- [x] Tested locally with npm run build
- [x] Validated query with Turso CLI (no duplicates)
- [x] Tested searches: "Computer", "Nursing", "Business"
- [x] Verified all return unique results only

## Database Validation
```sql
-- Before: 23 duplicate results for "Computer Science"
-- After: 1 result for "Computer Science"
SELECT cip_title, COUNT(*) 
FROM programs_search_cache 
WHERE cip_title LIKE '%Computer Science%'
GROUP BY cip_title;
```
```

### Example 2: New Feature

```
Title: ENG-345: Add email verification to signup flow

## Summary
Implemented email verification system with 24-hour token expiry.

## Jira Ticket
[ENG-345](https://collegecomps.atlassian.net/browse/ENG-345)

## Changes
- Added verification_token columns to users table
- Created /api/auth/verify-email endpoint
- Added /auth/verify-email UI page
- Updated signup flow to send verification email
- Added Resend email template

## Testing Done
- [x] Tested locally (npm run build successful)
- [x] Tested complete signup → verification flow
- [x] Tested expired token (24h+) scenario
- [x] Tested invalid token scenario
- [x] Added integration test for auth flow
- [x] Validated database updates correctly

## Deployment Notes
- Requires database migration (see migration.sql)
- Requires RESEND_API_KEY env var (already set)
```

---

## 🚀 Quick Reference

```bash
# Start a new feature
acli jira create --project ENG --type Task --summary "Add feature X"
git checkout -b ENG-XXX/feature-description

# Before committing
npm run build && npm run lint

# Commit (short, focused)
git commit -m "feat: add feature description"

# Test database query
turso db shell collegecomps

# Test API endpoint
curl http://localhost:3000/api/endpoint

# Create PR with Jira ticket in title
git push origin ENG-XXX/feature-description
# Then create PR with title: "ENG-XXX: Feature description"
```

---

## 📝 Project Context

**CollegeComps Platform**: A production Next.js application helping students make informed college decisions through ROI calculations, college comparisons, and data-driven insights.

**Tech Stack**:
- Next.js 15.5.4 (App Router)
- TypeScript
- Tailwind CSS
- Turso (SQLite) Database
- NextAuth.js (Authentication)
- Sentry (Error Monitoring)
- Vercel (Deployment)

**Key Features**:
- ROI Calculator
- College Comparison Tool
- Degree Search
- Email Verification
- Premium Subscriptions
- Advanced Analytics

---

## 📝 Notes

- **This is a production application** serving real users - quality matters
- **Every commit should be deployable** - don't break main
- **Tests prevent regressions** - take time to write them
- **Documentation in code** - write clear comments for complex logic
- **Ask if unsure** - better to clarify than to guess
- **Never use icons/emojis in commit messages or PR titles or any part of the website unless asked for it explicitly.**

---

**Remember**: We're building a platform students rely on for life-changing decisions. Code quality, testing, and validation aren't optional - they're essential.
- Next.js 14 with TypeScript
- Tailwind CSS for responsive design
- React components for UI
- Integration with existing college database

**Features:**
- Institution selection with search
- Program selection based on available offerings
- Cost analysis (tuition, fees, living costs)
- ROI calculations and visualizations
- Responsive design for all devices

**Documentation:**
Don't create or modify any documentation files except for `.github/copilot-instructions.md` and `README.md`. Ensure these files contain accurate and up-to-date information about the project, including setup instructions, usage guidelines, and any other relevant details. Don't create information not requested by the user. And keep 'README.md' concise, focusing on essential information.

**Commits:**
- Never make long commits, keep them short and focused.