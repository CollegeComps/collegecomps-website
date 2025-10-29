#!/usr/bin/env node
/**
 * Test production authentication after OAuth fix deployment
 * Run this after waiting 3 minutes for Vercel to deploy
 */

async function testProductionAuth() {
  console.log('=== Testing Production Authentication ===\n');
  console.log('Waiting for Vercel deployment (3 minutes)...\n');
  
  const baseURL = 'https://www.collegecomps.com';
  
  // Wait 3 minutes
  await new Promise(resolve => setTimeout(resolve, 180000));
  
  try {
    // Test 1: Credential Login
    console.log('TEST 1: Credential Login');
    console.log('========================\n');
    
    const csrfRes = await fetch(`${baseURL}/api/auth/csrf`);
    const { csrfToken } = await csrfRes.json();
    const csrfCookies = csrfRes.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
    
    const formData = new URLSearchParams({
      csrfToken,
      email: 'admin@collegecomps.com',
      password: 'Admin123!@#',
      callbackUrl: baseURL,
      json: 'true'
    });
    
    const signinRes = await fetch(`${baseURL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': csrfCookies,
        'Origin': baseURL,
        'Referer': `${baseURL}/auth/signin`
      },
      body: formData.toString(),
      redirect: 'manual'
    });
    
    const signinCookies = signinRes.headers.getSetCookie();
    const allCookies = [...csrfCookies.split('; '), ...signinCookies.map(c => c.split(';')[0])].join('; ');
    
    const sessionRes = await fetch(`${baseURL}/api/auth/session`, {
      headers: { 'Cookie': allCookies }
    });
    
    const session = await sessionRes.json();
    
    if (session && session.user) {
      console.log('✅ Credential Login: WORKING');
      console.log('   User:', session.user.email);
      console.log('   Tier:', session.user.subscriptionTier);
    } else {
      console.log('❌ Credential Login: FAILED');
      console.log('   Redirect:', signinRes.headers.get('location'));
    }
    
    // Test 2: Google OAuth Configuration
    console.log('\n\nTEST 2: Google OAuth');
    console.log('=====================\n');
    
    const googleRes = await fetch(`${baseURL}/api/auth/signin/google`, {
      redirect: 'manual'
    });
    
    const googleLocation = googleRes.headers.get('location');
    
    if (googleLocation && googleLocation.includes('accounts.google.com')) {
      console.log('✅ Google OAuth: WORKING');
      console.log('   Redirects to Google correctly');
    } else if (googleLocation && googleLocation.includes('error=Configuration')) {
      console.log('❌ Google OAuth: CONFIGURATION ERROR');
      console.log('   Location:', googleLocation);
    } else {
      console.log('⚠️  Google OAuth: UNEXPECTED');
      console.log('   Location:', googleLocation);
    }
    
    // Test 3: Providers Endpoint
    console.log('\n\nTEST 3: Available Providers');
    console.log('============================\n');
    
    const providersRes = await fetch(`${baseURL}/api/auth/providers`);
    const providers = await providersRes.json();
    
    console.log('Configured providers:', JSON.stringify(providers, null, 2));
    
    console.log('\n\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testProductionAuth();
