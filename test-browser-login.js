#!/usr/bin/env node

async function testBrowserLogin() {
  console.log('🔍 Testing Browser-Like Login Flow\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Step 1: Visit signin page (like opening in browser)
  console.log('1️⃣  Visiting signin page...\n');
  const signinResponse = await fetch('https://www.collegecomps.com/auth/signin');
  const signinCookies = signinResponse.headers.get('set-cookie') || '';
  console.log(`   Status: ${signinResponse.status}`);
  console.log(`   Cookies from page: ${signinCookies ? 'Received' : 'None'}\n`);

  // Step 2: Get CSRF token
  console.log('2️⃣  Getting CSRF token...\n');
  const csrfResponse = await fetch('https://www.collegecomps.com/api/auth/csrf', {
    headers: {
      'Cookie': signinCookies
    }
  });
  const csrfData = await csrfResponse.json();
  const csrfCookies = csrfResponse.headers.get('set-cookie') || '';
  
  // Combine cookies
  const allCookies = [signinCookies, csrfCookies].filter(Boolean).join('; ');
  
  console.log(`   CSRF Token: ${csrfData.csrfToken ? '✅' : '❌'}`);
  console.log(`   All cookies: ${allCookies.substring(0, 100)}...\n`);

  // Step 3: Submit login form
  console.log('3️⃣  Submitting login form...\n');
  console.log('   Email: admin@collegecomps.com');
  console.log('   Password: Admin123!@#\n');

  const formData = new URLSearchParams({
    email: 'admin@collegecomps.com',
    password: 'Admin123!@#',
    csrfToken: csrfData.csrfToken,
    callbackUrl: 'https://www.collegecomps.com/'
  });

  const loginResponse = await fetch('https://www.collegecomps.com/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': allCookies,
      'Origin': 'https://www.collegecomps.com',
      'Referer': 'https://www.collegecomps.com/auth/signin'
    },
    body: formData.toString(),
    redirect: 'manual'
  });

  console.log(`   Response Status: ${loginResponse.status}`);
  
  const redirectLocation = loginResponse.headers.get('location');
  console.log(`   Redirect: ${redirectLocation || 'None'}\n`);

  // Check response body if available
  if (loginResponse.status !== 302) {
    const responseText = await loginResponse.text();
    console.log(`   Response body: ${responseText.substring(0, 200)}\n`);
  }

  // Step 4: Check what cookies were set
  console.log('4️⃣  Checking session cookies...\n');
  const loginCookies = loginResponse.headers.get('set-cookie') || '';
  
  if (loginCookies) {
    console.log('   Cookies received:');
    const cookieLines = loginCookies.split(',').map(c => c.trim());
    cookieLines.forEach(cookie => {
      const cookieName = cookie.split('=')[0];
      if (cookieName.includes('session')) {
        console.log(`   ✅ ${cookieName}: SET`);
      } else {
        console.log(`   - ${cookieName}`);
      }
    });
    console.log('');
  } else {
    console.log('   ❌ No cookies received\n');
  }

  // Step 5: Check if redirect is to error page
  if (redirectLocation) {
    if (redirectLocation.includes('error')) {
      console.log('5️⃣  ❌ LOGIN FAILED - Error in redirect\n');
      const errorMatch = redirectLocation.match(/error=([^&]+)/);
      if (errorMatch) {
        console.log(`   Error type: ${decodeURIComponent(errorMatch[1])}`);
      }
      console.log(`   Full redirect: ${redirectLocation}\n`);
    } else if (redirectLocation.includes('/auth/signin')) {
      console.log('5️⃣  ❌ LOGIN FAILED - Redirected back to signin\n');
      console.log(`   This means authentication failed on the backend\n`);
    } else {
      console.log('5️⃣  ✅ LOGIN SUCCESSFUL\n');
      console.log(`   Redirected to: ${redirectLocation}\n`);
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 DIAGNOSIS:');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (redirectLocation && redirectLocation.includes('error')) {
    console.log('The login is failing on the backend.');
    console.log('Possible causes:');
    console.log('1. Database connection issue');
    console.log('2. Password hash mismatch');
    console.log('3. User not found in database');
    console.log('4. NextAuth configuration issue\n');
    console.log('Next step: Check production logs in Vercel');
  } else if (redirectLocation && redirectLocation.includes('/auth/signin')) {
    console.log('Authentication failed but no specific error returned.');
    console.log('This usually means the authorize() function returned null.\n');
    console.log('Next step: Verify database password hash');
  } else if (!loginCookies.includes('session')) {
    console.log('Login may have succeeded but session cookie not set.');
    console.log('Check cookie configuration in auth.ts\n');
  }
}

testBrowserLogin().catch(console.error);
