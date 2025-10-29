#!/usr/bin/env node
/**
 * Test actual login flow to production site
 * Simulates browser login to see where it fails
 */

const https = require('https');
const http = require('http');

console.log('🔍 Testing Production Login Flow\n');
console.log('═══════════════════════════════════════════════════════════\n');

const credentials = {
  email: 'admin@collegecomps.com',
  password: 'Admin123!@#'
};

// Test 1: Check if signin page loads
function testSigninPage() {
  return new Promise((resolve) => {
    console.log('1️⃣  Testing signin page...');
    
    https.get('https://www.collegecomps.com/auth/signin', (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers:`, res.headers);
      
      if (res.statusCode === 200) {
        console.log('   ✅ Signin page loads\n');
        resolve(true);
      } else {
        console.log(`   ❌ Unexpected status: ${res.statusCode}\n`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}\n`);
      resolve(false);
    });
  });
}

// Test 2: Try to login with credentials
function testCredentialLogin() {
  return new Promise((resolve) => {
    console.log('2️⃣  Attempting credential login...');
    
    const postData = new URLSearchParams({
      email: credentials.email,
      password: credentials.password,
      callbackUrl: '/',
    }).toString();

    const options = {
      hostname: 'www.collegecomps.com',
      port: 443,
      path: '/api/auth/callback/credentials',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length,
      }
    };

    const req = https.request(options, (res) => {
      console.log(`   Response status: ${res.statusCode}`);
      console.log(`   Response headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Response body (first 500 chars):`, data.substring(0, 500));
        
        // Check for cookies
        const cookies = res.headers['set-cookie'];
        if (cookies) {
          console.log('\n   📦 Cookies received:');
          cookies.forEach(cookie => {
            console.log(`      ${cookie}`);
            
            // Parse cookie to check details
            if (cookie.includes('session-token')) {
              console.log('      ✅ Session cookie found!');
              
              // Check domain
              if (cookie.includes('Domain=.collegecomps.com')) {
                console.log('      ✅ Domain is .collegecomps.com');
              } else {
                console.log('      ⚠️  Domain may be incorrect');
              }
              
              // Check secure
              if (cookie.includes('Secure')) {
                console.log('      ✅ Secure flag set');
              }
              
              // Check httpOnly
              if (cookie.includes('HttpOnly')) {
                console.log('      ✅ HttpOnly flag set');
              }
              
              // Check SameSite
              if (cookie.includes('SameSite')) {
                console.log('      ✅ SameSite flag set');
              }
            }
          });
        } else {
          console.log('\n   ❌ No cookies received!');
          console.log('   This means session is not being created');
        }
        
        // Check redirect
        if (res.statusCode === 302 || res.statusCode === 307) {
          const location = res.headers['location'];
          console.log(`\n   🔄 Redirect to: ${location}`);
          
          if (location && location.includes('error')) {
            console.log('   ❌ Redirected to error page - login failed!');
            console.log('   Check auth.ts authorize() function');
          } else if (location && (location === '/' || location.includes('collegecomps.com'))) {
            console.log('   ✅ Redirected to success page - login likely worked!');
          }
        }
        
        console.log('');
        resolve(true);
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}\n`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test 3: Check session endpoint
function testSessionEndpoint(cookies) {
  return new Promise((resolve) => {
    console.log('3️⃣  Checking session endpoint...');
    
    const options = {
      hostname: 'www.collegecomps.com',
      port: 443,
      path: '/api/auth/session',
      method: 'GET',
      headers: cookies ? {
        'Cookie': cookies.join('; ')
      } : {}
    };

    https.get(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response:`, data);
        
        try {
          const session = JSON.parse(data);
          if (session && session.user) {
            console.log('   ✅ Session exists!');
            console.log('   User:', session.user);
          } else {
            console.log('   ❌ No session found');
          }
        } catch (e) {
          console.log('   ❌ Could not parse session response');
        }
        
        console.log('');
        resolve(true);
      });
    }).on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}\n`);
      resolve(false);
    });
  });
}

// Run all tests
async function runTests() {
  await testSigninPage();
  await testCredentialLogin();
  await testSessionEndpoint();
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 DIAGNOSIS:');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('If login fails, check:');
  console.log('');
  console.log('1. No session cookie received:');
  console.log('   - Check auth.ts authorize() function');
  console.log('   - Check database connection in production');
  console.log('   - Check USERS_DB_URL and USERS_DB_TOKEN env vars');
  console.log('');
  console.log('2. Cookie received but session not persisting:');
  console.log('   - Browser blocking third-party cookies');
  console.log('   - Cookie domain mismatch');
  console.log('   - SameSite attribute too restrictive');
  console.log('');
  console.log('3. Redirected to error page:');
  console.log('   - Password mismatch (check database)');
  console.log('   - User not found');
  console.log('   - authorize() returning null');
  console.log('');
}

runTests();
