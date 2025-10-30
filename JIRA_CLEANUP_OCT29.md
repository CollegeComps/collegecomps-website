# Jira Ticket Cleanup - October 29, 2025

## ✅ Completed Tickets (Ready to Close)

### Authentication Fixes - All Resolved by NextAuth v4 Migration (ENG-258)
- **ENG-258** ✅ NextAuth v4 Migration - Auth working, login confirmed
- **ENG-260** ✅ Enhanced logging - Made obsolete by v4 migration
- **ENG-247** ✅ Credentials provider debug - Resolved by v4
- **ENG-248** ✅ Database connection debug - Resolved by v4
- **ENG-249** ✅ User lookup debug - Resolved by v4
- **ENG-250** ✅ Password hash debug - Resolved by v4
- **ENG-251** ✅ Verify request debug - Resolved by v4
- **ENG-252** ✅ Multiple signin debug - Resolved by v4
- **ENG-253** ✅ Auth middleware debug - Resolved by v4
- **ENG-254** ✅ Session data debug - Resolved by v4
- **ENG-255** ✅ Auth redirect debug - Resolved by v4

**Action**: Close all these tickets with comment: "Resolved by NextAuth v4 stable migration (ENG-258). Login now working in production."

---

## 🔍 Tickets to Review (Potentially Fixed)

These may have been resolved by the v4 migration and should be tested:

- **ENG-243** - OAuth login issues (test Google OAuth)
- **ENG-244** - Session persistence (test session cookies)
- **ENG-245** - Password reset flow (test reset flow)
- **ENG-207** - OAuth state error (test OAuth flows)
- **ENG-214** - Login error handling (test error cases)
- **ENG-217** - Session timeout (test session duration)
- **ENG-218** - Auth callback errors (test callbacks)
- **ENG-195** - General auth issues (review if still relevant)
- **ENG-205** - Auth-related issue (review if still relevant)

**Action**: Test each scenario, close if working, reopen if still broken

---

## 🔄 New Tickets (In Review - Pending PR Merge)

### UI Improvements
- **ENG-261** - Hide mobile nav buttons (PR #157) ✅
- **ENG-262** - Fix college filter layout (PR #158) ✅  
- **ENG-263** - Admin support ticket detail page (PR #159) ✅

**Action**: Merge PRs, then close tickets as Done

---

## 📊 Data Collection Tickets (NOT TOUCHING per user request)

- **ENG-230** - ROI coverage improvement
- **ENG-215** - Acceptance rate coverage
- **ENG-211** - Data quality checks
- **ENG-178** - BLS OEWS integration
- **ENG-154** - BLS salary data

**Action**: Leave these alone for now

---

## Summary

- **To Close Immediately**: 11 auth debug tickets (ENG-247 through ENG-260)
- **To Test & Review**: 9 auth-related tickets (may be fixed)
- **Pending PR Merge**: 3 UI tickets (ENG-261, 262, 263)
- **On Hold**: 5 data collection tickets

**Total tickets to clean up**: 20+ tickets
