#!/usr/bin/env node
/**
 * Test the LIVE production signin flow
 */

async function testLiveLogin() {
  console.log('🔍 Testing LIVE production credential login...\n');
  
  const baseURL = 'https://www.collegecomps.com';
  
  try {
    // Step 1: Get CSRF token
    console.log('1️⃣  Getting CSRF token...');
    const csrfRes = await fetch(`${baseURL}/api/auth/csrf`);
    const csrfData = await csrfRes.json();
    const csrfCookies = csrfRes.headers.getSetCookie();
    console.log('   ✅ CSRF Token obtained');
    console.log('   Cookies:', csrfCookies.map(c => c.split('=')[0]).join(', '));
    
    // Step 2: POST to callback/credentials
    console.log('\n2️⃣  POSTing to /api/auth/callback/credentials...');
    const formData = new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      email: 'admin@collegecomps.com',
      password: 'Admin123!@#',
      callbackUrl: baseURL
    });
    
    const signinRes = await fetch(`${baseURL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': csrfCookies.map(c => c.split(';')[0]).join('; ')
      },
      body: formData.toString(),
      redirect: 'manual'
    });
    
    console.log('   Status:', signinRes.status);
    console.log('   Status Text:', signinRes.statusText);
    
    const location = signinRes.headers.get('location');
    console.log('   Redirect Location:', location);
    
    const setCookies = signinRes.headers.getSetCookie();
    console.log('   Set-Cookie headers:', setCookies.length);
    
    setCookies.forEach((cookie, i) => {
      const name = cookie.split('=')[0];
      const hasSessionToken = name.includes('session-token');
      console.log(`   Cookie ${i + 1}: ${name}${hasSessionToken ? ' ⭐ SESSION' : ''}`);
    });
    
    // Step 3: Check if there's an error in redirect
    if (location) {
      const redirectUrl = new URL(location);
      const error = redirectUrl.searchParams.get('error');
      
      if (error) {
        console.log('\n❌ ERROR IN REDIRECT');
        console.log('   Error:', error);
        console.log('   Full URL:', location);
        return;
      } else {
        console.log('\n✅ Redirect looks good (no error param)');
      }
    }
    
    // Step 4: Test session with the cookies
    console.log('\n3️⃣  Testing session with received cookies...');
    const allCookies = [...csrfCookies, ...setCookies].map(c => c.split(';')[0]).join('; ');
    
    const sessionRes = await fetch(`${baseURL}/api/auth/session`, {
      headers: { 'Cookie': allCookies }
    });
    
    const session = await sessionRes.json();
    
    if (session && session.user) {
      console.log('   ✅ SESSION EXISTS!');
      console.log('   User:', session.user.email);
      console.log('   Tier:', session.user.subscriptionTier);
      console.log('   Expires:', new Date(session.expires).toLocaleString());
    } else {
      console.log('   ❌ NO SESSION FOUND');
      console.log('   Response:', session);
    }
    
    // Step 5: Check what the signin page JavaScript says
    console.log('\n4️⃣  Checking deployed signin page code...');
    const pageRes = await fetch(`${baseURL}/auth/signin`);
    const pageHtml = await pageRes.text();
    const jsMatch = pageHtml.match(/page-([a-f0-9]+)\.js/);
    
    if (jsMatch) {
      console.log('   Bundle:', jsMatch[0]);
      const bundleRes = await fetch(`${baseURL}/_next/static/chunks/app/auth/signin/${jsMatch[0]}`);
      const bundleJs = await bundleRes.text();
      
      if (bundleJs.includes('redirect:!1')) {
        console.log('   ❌ OLD CODE DEPLOYED (has redirect:false)');
      } else if (bundleJs.includes('callbackUrl:s') || bundleJs.includes('callbackUrl:')) {
        console.log('   ✅ NEW CODE DEPLOYED (no redirect:false)');
      } else {
        console.log('   ⚠️  Could not determine code version');
      }
    }
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    console.error(error.stack);
  }
}

testLiveLogin();
