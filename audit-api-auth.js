#!/usr/bin/env node

/**
 * API Route Authentication Audit
 * 
 * This script checks all API routes for proper authentication and authorization.
 */

const fs = require('fs');
const path = require('path');

const routeFiles = [
  'src/app/api/admin/support/tickets/route.ts',
  'src/app/api/ai/recommendations/route.ts',
  'src/app/api/ai/suggestions/route.ts',
  'src/app/api/alerts/preferences/route.ts',
  'src/app/api/analytics/stats/route.ts',
  'src/app/api/analytics/track/route.ts',
  'src/app/api/bookmarks/colleges/check/route.ts',
  'src/app/api/bookmarks/colleges/route.ts',
  'src/app/api/colleges/search/route.ts',
  'src/app/api/comparison-folders/route.ts',
  'src/app/api/dashboard/stats/route.ts',
  'src/app/api/earnings-data/route.ts',
  'src/app/api/exports/comparison/route.ts',
  'src/app/api/exports/share/route.ts',
  'src/app/api/financial-data/route.ts',
  'src/app/api/institutions/[unitid]/programs/route.ts',
  'src/app/api/institutions/[unitid]/route.ts',
  'src/app/api/institutions/route.ts',
  'src/app/api/institutions/search/route.ts',
  'src/app/api/majors/search/route.ts',
  'src/app/api/programs/institutions/route.ts',
  'src/app/api/programs/route.ts',
  'src/app/api/programs/search/route.ts',
  'src/app/api/programs/stats/route.ts',
  'src/app/api/roi/scenarios/route.ts',
  'src/app/api/salary-analytics/route.ts',
  'src/app/api/salary-data/route.ts',
  'src/app/api/saved-comparisons/move/route.ts',
  'src/app/api/saved-comparisons/route.ts',
  'src/app/api/saved-comparisons/tags/route.ts',
  'src/app/api/stats/route.ts',
  'src/app/api/support/tickets/route.ts',
  'src/app/api/trends/historical/route.ts',
  'src/app/api/user/onboarding/route.ts',
  'src/app/api/user/password/route.ts',
  'src/app/api/user/profile/route.ts',
  'src/app/api/user/salary-submissions/route.ts',
  'src/app/api/user/usage-stats/route.ts',
];

console.log('🔒 API Route Authentication Audit\n');
console.log('=' .repeat(80));

const results = {
  hasAuth: [],
  noAuth: [],
  hasTierCheck: [],
  noTierCheck: [],
  adminOnly: [],
};

routeFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check for authentication
  const hasAuthImport = content.includes('import { auth }') || content.includes('import { getServerSession }');
  const hasAuthCall = content.includes('await auth()') || content.includes('await getServerSession');
  const hasSessionCheck = content.includes('if (!session)') || content.includes('!session?.user');
  
  // Check for tier verification
  const hasTierCheck = content.includes('subscription_tier') || content.includes('tier === ') || content.includes('PREMIUM');
  
  // Check for admin routes
  const isAdminRoute = file.includes('/admin/');
  
  const requiresAuth = file.includes('/user/') || 
                      file.includes('/bookmarks/') || 
                      file.includes('/saved-comparisons/') || 
                      file.includes('/dashboard/') ||
                      file.includes('/roi/scenarios') ||
                      file.includes('/support/tickets') ||
                      file.includes('/alerts/');

  const requiresTier = file.includes('/salary-data') || 
                       file.includes('/trends/historical') ||
                       file.includes('/ai/') ||
                       file.includes('/salary-analytics');

  if (hasAuthCall && hasSessionCheck) {
    results.hasAuth.push(file);
  } else if (requiresAuth) {
    results.noAuth.push(file);
  }

  if (hasTierCheck && requiresTier) {
    results.hasTierCheck.push(file);
  } else if (requiresTier) {
    results.noTierCheck.push(file);
  }

  if (isAdminRoute) {
    results.adminOnly.push({
      file,
      hasAdminCheck: content.includes('admin') && hasSessionCheck
    });
  }
});

console.log('\n✅ Routes WITH proper authentication:');
results.hasAuth.forEach(file => console.log(`  - ${file}`));

console.log('\n❌ Routes MISSING authentication (but likely need it):');
if (results.noAuth.length === 0) {
  console.log('  None found!');
} else {
  results.noAuth.forEach(file => console.log(`  - ${file}`));
}

console.log('\n✅ Routes WITH tier verification:');
if (results.hasTierCheck.length === 0) {
  console.log('  None found!');
} else {
  results.hasTierCheck.forEach(file => console.log(`  - ${file}`));
}

console.log('\n⚠️  Routes that should check tier (premium features):');
if (results.noTierCheck.length === 0) {
  console.log('  None found!');
} else {
  results.noTierCheck.forEach(file => console.log(`  - ${file}`));
}

console.log('\n🔐 Admin routes:');
if (results.adminOnly.length === 0) {
  console.log('  None found!');
} else {
  results.adminOnly.forEach(({ file, hasAdminCheck }) => {
    const status = hasAdminCheck ? '✅' : '❌';
    console.log(`  ${status} ${file}`);
  });
}

console.log('\n' + '='.repeat(80));
console.log('\n📊 Summary:');
console.log(`  - ${results.hasAuth.length} routes with authentication`);
console.log(`  - ${results.noAuth.length} routes missing authentication`);
console.log(`  - ${results.hasTierCheck.length} routes with tier checks`);
console.log(`  - ${results.noTierCheck.length} routes needing tier checks`);
console.log(`  - ${results.adminOnly.length} admin routes`);

if (results.noAuth.length > 0 || results.noTierCheck.length > 0) {
  console.log('\n⚠️  ACTION REQUIRED: Fix the routes flagged above!');
  process.exit(1);
} else {
  console.log('\n✅ All routes properly secured!');
  process.exit(0);
}
