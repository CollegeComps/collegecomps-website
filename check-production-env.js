#!/usr/bin/env node
/**
 * Check production environment configuration
 */

console.log('🔍 Checking Production Environment\n');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('Environment variables that should be set in Vercel:\n');

const required = [
  { name: 'AUTH_SECRET', description: 'NextAuth secret key', critical: true },
  { name: 'NEXTAUTH_URL', description: 'Site URL (https://www.collegecomps.com)', critical: true },
  { name: 'USERS_DB_URL', description: 'Turso users database URL', critical: true },
  { name: 'USERS_DB_TOKEN', description: 'Turso users database token', critical: true },
  { name: 'GOOGLE_CLIENT_ID', description: 'Google OAuth client ID', critical: false },
  { name: 'GOOGLE_CLIENT_SECRET', description: 'Google OAuth client secret', critical: false },
];

console.log('CRITICAL (required for credential login):');
required.filter(v => v.critical).forEach(v => {
  console.log(`  - ${v.name}`);
  console.log(`    ${v.description}`);
});

console.log('\nOPTIONAL (for Google OAuth):');
required.filter(v => !v.critical).forEach(v => {
  console.log(`  - ${v.name}`);
  console.log(`    ${v.description}`);
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🔧 TROUBLESHOOTING STEPS:');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('1. Check Vercel environment variables:');
console.log('   - Go to: https://vercel.com/collegecomps/project/settings/environment-variables');
console.log('   - Verify all CRITICAL variables are set');
console.log('   - Make sure they are for "Production" environment');
console.log('');

console.log('2. Check AUTH_SECRET:');
console.log('   - Must be set in production');
console.log('   - Should be a long random string');
console.log('   - Generate with: openssl rand -base64 32');
console.log('');

console.log('3. Check NEXTAUTH_URL:');
console.log('   - Should be: https://www.collegecomps.com');
console.log('   - Or: https://collegecomps.com');
console.log('   - Must match the domain you are accessing');
console.log('');

console.log('4. Check database credentials:');
console.log('   - USERS_DB_URL should be: libsql://collegecomps-users-*.turso.io');
console.log('   - USERS_DB_TOKEN should be a JWT token');
console.log('');

console.log('5. After updating env vars:');
console.log('   - Redeploy the application');
console.log('   - Wait ~3 minutes for deployment');
console.log('   - Clear browser cache and cookies');
console.log('   - Try login again');
console.log('');

console.log('6. Test in browser (not programmatic):');
console.log('   - Go to https://www.collegecomps.com/auth/signin');
console.log('   - Open DevTools (F12) → Network tab');
console.log('   - Clear filter');
console.log('   - Enter credentials and click Sign In');
console.log('   - Look for:');
console.log('     • POST /api/auth/callback/credentials');
console.log('     • Check response status (should be 302)');
console.log('     • Check for Set-Cookie header');
console.log('     • Check redirect location');
console.log('');

console.log('7. If still failing, check browser console:');
console.log('   - F12 → Console tab');
console.log('   - Look for JavaScript errors');
console.log('   - Look for CORS errors');
console.log('   - Look for cookie blocking warnings');
console.log('');
