#!/usr/bin/env node

const https = require('https');

async function testLogin() {
  console.log('🧪 Testing NextAuth Login Flow\n');
  
  // Step 1: Get CSRF token
  console.log('1️⃣ Getting CSRF token...');
  const csrfResponse = await fetch('https://collegecomps.com/api/auth/csrf');
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.csrfToken;
  const csrfCookie = csrfResponse.headers.get('set-cookie');
  
  console.log('CSRF Token:', csrfToken.substring(0, 20) + '...');
  console.log('CSRF Cookie:', csrfCookie?.substring(0, 50) + '...\n');
  
  // Step 2: Attempt login
  console.log('2️⃣ Attempting login...');
  const loginResponse = await fetch('https://collegecomps.com/api/auth/signin/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': csrfCookie || ''
    },
    body: new URLSearchParams({
      email: 'admin@collegecomps.com',
      password: 'Admin123!@#',
      csrfToken: csrfToken,
      callbackUrl: 'https://collegecomps.com/',
      json: 'true'
    }),
    redirect: 'manual'
  });
  
  console.log('Login Status:', loginResponse.status);
  console.log('Login Headers:');
  for (const [key, value] of loginResponse.headers.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  
  const loginBody = await loginResponse.text();
  console.log('\nLogin Response Body:', loginBody);
  
  // Parse the JSON response
  try {
    const loginJson = JSON.parse(loginBody);
    console.log('\nParsed Response:', JSON.stringify(loginJson, null, 2));
    
    if (loginJson.url && loginJson.url.includes('/signin')) {
      console.log('\n❌ LOGIN FAILED - Redirected to signin page');
      console.log('This means authorize() returned null or false');
      
      // Check if there's an error parameter
      const url = new URL(loginJson.url);
      const error = url.searchParams.get('error');
      if (error) {
        console.log('Error type:', error);
      }
    } else if (loginJson.url && loginJson.url === 'https://collegecomps.com/') {
      console.log('\n✅ LOGIN SUCCESS - Would redirect to homepage');
    }
  } catch (e) {
    console.log('Could not parse as JSON:', e.message);
  }
  
  // Step 3: Check session
  console.log('\n3️⃣ Checking session...');
  const sessionCookies = loginResponse.headers.get('set-cookie');
  console.log('Session Cookies:', sessionCookies || 'NONE');
  
  const sessionResponse = await fetch('https://collegecomps.com/api/auth/session', {
    headers: {
      'Cookie': sessionCookies || csrfCookie || ''
    }
  });
  
  const sessionData = await sessionResponse.json();
  console.log('Session Data:', JSON.stringify(sessionData, null, 2));
}

testLogin().catch(console.error);
