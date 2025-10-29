#!/usr/bin/env node
/**
 * Comprehensive production credential login test
 */

async function testCredentialLogin() {
  console.log('=== Testing Production Credential Login ===\n');
  
  const baseURL = 'https://www.collegecomps.com';
  const credentials = {
    email: 'admin@collegecomps.com',
    password: 'Admin123!@#'
  };
  
  try {
    // Step 1: Get CSRF token
    console.log('1. Getting CSRF token...');
    const csrfRes = await fetch(`${baseURL}/api/auth/csrf`);
    const csrfData = await csrfRes.json();
    console.log('   CSRF Token obtained:', !!csrfData.csrfToken);
    
    const csrfCookies = csrfRes.headers.getSetCookie();
    console.log('   CSRF cookies:', csrfCookies.length);
    
    // Step 2: Attempt signin
    console.log('\n2. Attempting credential signin...');
    const formData = new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      email: credentials.email,
      password: credentials.password,
      callbackUrl: baseURL,
      json: 'true'
    });
    
    const signinRes = await fetch(`${baseURL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': csrfCookies.map(c => c.split(';')[0]).join('; '),
        'Origin': baseURL,
        'Referer': `${baseURL}/auth/signin`
      },
      body: formData.toString(),
      redirect: 'manual'
    });
    
    console.log('   Status:', signinRes.status);
    console.log('   Redirect:', signinRes.headers.get('location'));
    
    const signinCookies = signinRes.headers.getSetCookie();
    console.log('   New cookies set:', signinCookies.length);
    
    signinCookies.forEach((cookie, i) => {
      const name = cookie.split('=')[0];
      const hasSecure = cookie.includes('Secure');
      const hasHttpOnly = cookie.includes('HttpOnly');
      const hasSameSite = cookie.includes('SameSite');
      console.log(`   Cookie ${i + 1}: ${name}`);
      console.log(`      Secure: ${hasSecure}, HttpOnly: ${hasHttpOnly}, SameSite: ${hasSameSite}`);
    });
    
    // Step 3: Check if redirect indicates error
    const redirectUrl = signinRes.headers.get('location');
    if (redirectUrl && redirectUrl.includes('error')) {
      console.log('\n❌ ERROR: Signin redirected to error page');
      console.log('   Error URL:', redirectUrl);
      return;
    }
    
    // Step 4: Check session with all cookies
    console.log('\n3. Checking session...');
    const allCookies = [...csrfCookies, ...signinCookies].map(c => c.split(';')[0]).join('; ');
    
    const sessionRes = await fetch(`${baseURL}/api/auth/session`, {
      headers: { 'Cookie': allCookies }
    });
    
    const session = await sessionRes.json();
    
    if (session && session.user) {
      console.log('   ✅ Session exists!');
      console.log('   User:', session.user.email);
      console.log('   Tier:', session.user.subscriptionTier);
      console.log('   Expires:', session.expires);
    } else {
      console.log('   ❌ NO SESSION - Login failed!');
      console.log('   Response:', session);
    }
    
    // Step 5: Test session persistence (simulate browser refresh)
    console.log('\n4. Testing session persistence...');
    const persistRes = await fetch(`${baseURL}/api/auth/session`, {
      headers: { 'Cookie': allCookies }
    });
    
    const persistSession = await persistRes.json();
    
    if (persistSession && persistSession.user) {
      console.log('   ✅ Session persists!');
    } else {
      console.log('   ❌ Session does NOT persist!');
    }
    
    // Step 6: Analyze what might be wrong
    console.log('\n5. Diagnostic Info:');
    console.log('   Total cookies from signin:', signinCookies.length);
    console.log('   Looking for session-token cookie...');
    
    const sessionTokenCookie = signinCookies.find(c => c.includes('session-token'));
    if (sessionTokenCookie) {
      console.log('   ✅ Found session-token cookie');
      console.log('   Details:', sessionTokenCookie.substring(0, 100) + '...');
    } else {
      console.log('   ❌ NO session-token cookie found!');
      console.log('   Available cookies:');
      signinCookies.forEach(c => {
        console.log('      -', c.split('=')[0]);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

testCredentialLogin();
