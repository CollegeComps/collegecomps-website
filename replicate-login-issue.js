#!/usr/bin/env node

/**
 * Replicate User Login Issue
 * This script simulates the exact login flow from the HAR file
 */

async function testLogin() {
  console.log('🧪 Replicating login issue from collegecomps.com\n');
  
  const baseUrl = 'https://collegecomps.com';
  const credentials = {
    email: 'admin@collegecomps.com',
    password: 'Admin123!@#'
  };

  // Step 1: Get CSRF token
  console.log('1️⃣ Getting CSRF token...');
  const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
  const csrfData = await csrfResponse.json();
  console.log('CSRF Token:', csrfData.csrfToken);

  // Step 2: Login
  console.log('\n2️⃣ Attempting login...');
  
  // NextAuth needs the CSRF cookie to be sent with the request
  const cookieHeader = csrfResponse.headers.get('set-cookie');
  console.log('CSRF Cookie:', cookieHeader);
  
  const loginResponse = await fetch(`${baseUrl}/api/auth/signin/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookieHeader || ''
    },
    body: new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      email: credentials.email,
      password: credentials.password,
      callbackUrl: '/',
      json: 'true'
    }),
    redirect: 'manual' // Don't follow redirects
  });

  console.log('Login Response Status:', loginResponse.status);
  console.log('Login Response Headers:');
  for (const [key, value] of loginResponse.headers.entries()) {
    console.log(`  ${key}: ${value}`);
  }

  // Check for Set-Cookie headers
  const cookies = loginResponse.headers.get('set-cookie');
  if (cookies) {
    console.log('\n🍪 Cookies Set:');
    console.log(cookies);
  } else {
    console.log('\n❌ NO COOKIES SET!');
  }

  let loginData;
  try {
    const text = await loginResponse.text();
    console.log('\nRaw Response:', text);
    if (text) {
      loginData = JSON.parse(text);
      console.log('\nLogin Response Body:', loginData);
    }
  } catch (e) {
    console.log('\nCouldn\'t parse response:', e.message);
  }

  // Step 3: Check session
  console.log('\n3️⃣ Checking session...');
  const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
    headers: {
      'Cookie': cookies || ''
    }
  });
  const sessionData = await sessionResponse.json();
  console.log('Session Data:', sessionData);

  if (sessionData === null) {
    console.log('\n❌ PROBLEM REPLICATED: Session is NULL after login!');
    console.log('\n📋 Possible Causes:');
    console.log('1. Session cookie not being set');
    console.log('2. Session cookie domain mismatch');
    console.log('3. Session cookie SameSite issue');
    console.log('4. Session cookie not being sent back');
    console.log('5. Login actually failed but returned 200');
  } else {
    console.log('\n✅ Login successful! Session:', sessionData);
  }
}

testLogin().catch(console.error);
