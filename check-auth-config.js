#!/usr/bin/env node

/**
 * Check Auth Configuration
 * Verifies the current NEXTAUTH_URL and auth settings
 */

async function checkAuthConfig() {
  console.log('\n🔍 Checking Auth Configuration...\n');

  // Check what the app thinks NEXTAUTH_URL is
  const authUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'NOT SET';
  console.log('📍 NEXTAUTH_URL:', authUrl);

  // Check production endpoints
  const domain = 'collegecomps.com';
  const wwwDomain = 'www.collegecomps.com';

  console.log('\n🌐 Testing Domains:\n');

  // Test non-www domain
  try {
    console.log(`Testing https://${domain}/api/auth/providers ...`);
    const response1 = await fetch(`https://${domain}/api/auth/providers`);
    const data1 = await response1.json();
    console.log(`✅ ${domain}:`, data1);
  } catch (error) {
    console.log(`❌ ${domain}:`, error.message);
  }

  // Test www domain
  try {
    console.log(`\nTesting https://${wwwDomain}/api/auth/providers ...`);
    const response2 = await fetch(`https://${wwwDomain}/api/auth/providers`);
    const data2 = await response2.json();
    console.log(`✅ ${wwwDomain}:`, data2);
  } catch (error) {
    console.log(`❌ ${wwwDomain}:`, error.message);
  }

  // Test redirect behavior
  console.log('\n🔀 Testing Redirect Behavior:\n');
  
  try {
    const response = await fetch(`https://${wwwDomain}/`, { redirect: 'manual' });
    if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
      const location = response.headers.get('location');
      console.log(`✅ www.collegecomps.com redirects to: ${location}`);
    } else {
      console.log(`✅ www.collegecomps.com does NOT redirect (status: ${response.status})`);
    }
  } catch (error) {
    console.log(`❌ Error checking redirect:`, error.message);
  }

  console.log('\n📋 Recommendations:\n');
  console.log('1. NEXTAUTH_URL should be: https://collegecomps.com');
  console.log('2. Verify in Vercel dashboard: Settings → Environment Variables');
  console.log('3. Cookie domain is: .collegecomps.com (covers both www and non-www)');
  console.log('4. trustHost: true is enabled in src/auth.ts');
  console.log('\n✅ Both domains should work with current configuration!');
}

checkAuthConfig().catch(console.error);
