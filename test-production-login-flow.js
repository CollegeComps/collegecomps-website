#!/usr/bin/env node

async function testProductionLogin() {
  console.log('🔐 Testing Production Credential Login Flow\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Step 1: Get CSRF token
  console.log('1️⃣  Getting CSRF token...\n');
  
  const csrfResponse = await fetch('https://www.collegecomps.com/api/auth/csrf');
  const csrfData = await csrfResponse.json();
  const csrfCookies = csrfResponse.headers.get('set-cookie') || '';
  
  // Parse CSRF token from cookie
  const csrfCookieMatch = csrfCookies.match(/__Host-authjs\.csrf-token=([^;]+)/);
  const csrfCookieValue = csrfCookieMatch ? csrfCookieMatch[1] : '';
  
  console.log(`   CSRF Token: ${csrfData.csrfToken ? '✅ Received' : '❌ Missing'}`);
  console.log(`   CSRF Cookie: ${csrfCookieValue ? '✅ Received' : '❌ Missing'}\n`);

  if (!csrfData.csrfToken || !csrfCookieValue) {
    console.log('❌ Failed to get CSRF token\n');
    return;
  }

  // Step 2: Attempt login
  console.log('2️⃣  Attempting login with credentials...\n');
  console.log('   Email: admin@collegecomps.com');
  console.log('   Password: Admin123!@#\n');

  const loginBody = new URLSearchParams({
    email: 'admin@collegecomps.com',
    password: 'Admin123!@#',
    csrfToken: csrfData.csrfToken,
    callbackUrl: '/',
    json: 'true'
  });

  const loginResponse = await fetch('https://www.collegecomps.com/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': `__Host-authjs.csrf-token=${csrfCookieValue}`,
    },
    body: loginBody.toString(),
    redirect: 'manual' // Don't follow redirects
  });

  console.log(`   Response Status: ${loginResponse.status}`);
  console.log(`   Response: ${loginResponse.statusText}\n`);

  // Check for session cookie
  const loginCookies = loginResponse.headers.get('set-cookie') || '';
  console.log('3️⃣  Checking for session cookie...\n');
  
  const hasSessionCookie = loginCookies.includes('authjs.session-token') || 
                          loginCookies.includes('__Secure-authjs.session-token');
  
  if (hasSessionCookie) {
    console.log('   ✅ Session cookie set!');
    console.log('   Cookie preview:', loginCookies.substring(0, 100) + '...\n');
  } else {
    console.log('   ❌ No session cookie found\n');
    console.log('   Response cookies:', loginCookies || 'None\n');
  }

  // Check redirect location
  const redirectLocation = loginResponse.headers.get('location');
  console.log('4️⃣  Checking redirect...\n');
  
  if (redirectLocation) {
    console.log(`   Redirect to: ${redirectLocation}`);
    
    if (redirectLocation.includes('/auth/signin?error')) {
      console.log('   ❌ Login failed - redirected to signin with error\n');
      
      // Parse error from URL
      const errorMatch = redirectLocation.match(/error=([^&]+)/);
      if (errorMatch) {
        console.log(`   Error: ${decodeURIComponent(errorMatch[1])}\n`);
      }
    } else if (redirectLocation === '/' || redirectLocation.includes('collegecomps.com')) {
      console.log('   ✅ Login successful - redirected to home page\n');
    } else {
      console.log(`   ⚠️  Unexpected redirect: ${redirectLocation}\n`);
    }
  } else {
    console.log('   ❌ No redirect header found\n');
  }

  // Step 5: Test session endpoint with the cookie
  if (hasSessionCookie) {
    console.log('5️⃣  Testing session endpoint...\n');
    
    const sessionCookieMatch = loginCookies.match(/(__Secure-authjs\.session-token|authjs\.session-token)=([^;]+)/);
    const sessionCookie = sessionCookieMatch ? `${sessionCookieMatch[1]}=${sessionCookieMatch[2]}` : '';
    
    const sessionResponse = await fetch('https://www.collegecomps.com/api/auth/session', {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    const sessionData = await sessionResponse.json();
    
    if (sessionData && sessionData.user) {
      console.log('   ✅ Session valid!');
      console.log('   User:', JSON.stringify(sessionData.user, null, 2));
    } else {
      console.log('   ❌ Session invalid or empty');
      console.log('   Response:', JSON.stringify(sessionData, null, 2));
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📋 SUMMARY:');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  if (hasSessionCookie && redirectLocation && !redirectLocation.includes('error')) {
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('\nNext steps:');
    console.log('1. Test in browser: https://www.collegecomps.com/auth/signin');
    console.log('2. Use: admin@collegecomps.com / Admin123!@#');
    console.log('3. Should redirect to home page after login\n');
  } else {
    console.log('❌ LOGIN FAILED');
    console.log('\nDiagnose:');
    console.log('1. Check browser DevTools Network tab');
    console.log('2. Look for POST /api/auth/callback/credentials');
    console.log('3. Check request/response details');
    console.log('4. Verify database password hash is correct\n');
  }
}

testProductionLogin().catch(console.error);
