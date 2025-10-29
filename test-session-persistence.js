#!/usr/bin/env node

async function testFullSessionFlow() {
  console.log('🔍 Testing Full Session Persistence Flow\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Step 1: Get CSRF token
  console.log('1️⃣  Getting CSRF token...\n');
  const csrfResponse = await fetch('https://www.collegecomps.com/api/auth/csrf');
  const csrfData = await csrfResponse.json();
  const csrfCookieHeader = csrfResponse.headers.get('set-cookie') || '';
  
  // Extract CSRF cookie value
  const csrfCookieMatch = csrfCookieHeader.match(/__Host-authjs\.csrf-token=([^;]+)/);
  const csrfCookie = csrfCookieMatch ? csrfCookieMatch[0] : '';
  
  console.log(`   CSRF Token: ${csrfData.csrfToken ? '✅' : '❌'}`);
  console.log(`   CSRF Cookie: ${csrfCookie ? '✅' : '❌'}\n`);

  // Step 2: Login
  console.log('2️⃣  Logging in...\n');
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
      'Cookie': csrfCookie
    },
    body: formData.toString(),
    redirect: 'manual'
  });

  const loginCookies = loginResponse.headers.get('set-cookie') || '';
  const redirectLocation = loginResponse.headers.get('location');
  
  console.log(`   Status: ${loginResponse.status}`);
  console.log(`   Redirect: ${redirectLocation || 'None'}\n`);

  // Extract session cookie
  const sessionCookieMatch = loginCookies.match(/__Secure-authjs\.session-token=([^;]+)/);
  const sessionCookie = sessionCookieMatch ? `__Secure-authjs.session-token=${sessionCookieMatch[1]}` : '';
  
  if (sessionCookie) {
    console.log('   ✅ Session cookie received\n');
  } else {
    console.log('   ❌ No session cookie received\n');
    console.log('   Cookies:', loginCookies.substring(0, 200), '\n');
    return;
  }

  // Step 3: Check session immediately after login
  console.log('3️⃣  Checking session immediately after login...\n');
  const sessionResponse1 = await fetch('https://www.collegecomps.com/api/auth/session', {
    headers: {
      'Cookie': sessionCookie
    }
  });
  const sessionData1 = await sessionResponse1.json();
  
  if (sessionData1 && sessionData1.user) {
    console.log('   ✅ Session valid!');
    console.log(`   User: ${sessionData1.user.email}\n`);
  } else {
    console.log('   ❌ Session invalid or empty');
    console.log(`   Response: ${JSON.stringify(sessionData1)}\n`);
  }

  // Step 4: Follow the redirect and check session
  console.log('4️⃣  Following redirect to home page...\n');
  const homeResponse = await fetch('https://www.collegecomps.com/', {
    headers: {
      'Cookie': sessionCookie
    }
  });
  
  console.log(`   Status: ${homeResponse.status}`);
  
  // Check if home page sets any cookies
  const homeCookies = homeResponse.headers.get('set-cookie') || '';
  if (homeCookies) {
    console.log(`   Home page sets cookies: ${homeCookies.substring(0, 100)}...\n`);
  } else {
    console.log('   Home page does not set cookies\n');
  }

  // Step 5: Check session again from home page
  console.log('5️⃣  Checking session from home page context...\n');
  const sessionResponse2 = await fetch('https://www.collegecomps.com/api/auth/session', {
    headers: {
      'Cookie': sessionCookie,
      'Referer': 'https://www.collegecomps.com/'
    }
  });
  const sessionData2 = await sessionResponse2.json();
  
  if (sessionData2 && sessionData2.user) {
    console.log('   ✅ Session still valid!');
    console.log(`   User: ${sessionData2.user.email}\n`);
  } else {
    console.log('   ❌ Session lost after navigation');
    console.log(`   Response: ${JSON.stringify(sessionData2)}\n`);
  }

  // Step 6: Check cookie attributes
  console.log('6️⃣  Analyzing session cookie attributes...\n');
  const cookieParts = loginCookies.split(';').map(p => p.trim());
  console.log('   Cookie attributes:');
  cookieParts.forEach(part => {
    if (part) console.log(`   - ${part}`);
  });
  console.log('');

  // Step 7: Test with www vs non-www
  console.log('7️⃣  Testing cookie domain compatibility...\n');
  
  // Test session on non-www
  const sessionResponseNoWWW = await fetch('https://collegecomps.com/api/auth/session', {
    headers: {
      'Cookie': sessionCookie
    }
  });
  const sessionDataNoWWW = await sessionResponseNoWWW.json();
  
  if (sessionDataNoWWW && sessionDataNoWWW.user) {
    console.log('   ✅ Session works on collegecomps.com (no www)');
  } else {
    console.log('   ❌ Session does NOT work on collegecomps.com (no www)');
    console.log('   This is a cookie domain issue!');
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📋 SUMMARY:');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  if (sessionData1 && sessionData1.user && sessionData2 && sessionData2.user) {
    console.log('✅ Session persists correctly after login');
    console.log('✅ Session survives navigation');
    
    if (sessionDataNoWWW && sessionDataNoWWW.user) {
      console.log('✅ Session works across www/non-www domains\n');
    } else {
      console.log('⚠️  Session does NOT work across www/non-www domains\n');
      console.log('ACTION NEEDED: The cookie domain needs to be set correctly.');
      console.log('Check that domain: .collegecomps.com is set in production.\n');
    }
  } else {
    console.log('❌ Session persistence issue detected\n');
    console.log('Possible causes:');
    console.log('1. Cookie not being set with correct domain');
    console.log('2. Cookie being cleared by subsequent requests');
    console.log('3. Session token not being validated correctly\n');
  }
}

testFullSessionFlow().catch(console.error);
