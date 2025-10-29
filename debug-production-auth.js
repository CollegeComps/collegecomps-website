#!/usr/bin/env node
/**
 * Deep dive debugging - Check actual production auth behavior
 */

const https = require('https');

console.log('🔍 Deep Debugging Production Auth\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Test the actual CSRF token flow
async function testCSRFFlow() {
  console.log('1️⃣  Testing CSRF token flow (how browsers actually login)...\n');
  
  // Step 1: Get CSRF token from signin page
  return new Promise((resolve) => {
    https.get('https://www.collegecomps.com/api/auth/csrf', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('   CSRF endpoint response:');
        console.log(`   Status: ${res.statusCode}`);
        
        try {
          const csrfData = JSON.parse(data);
          console.log(`   CSRF Token: ${csrfData.csrfToken ? '✅ Present' : '❌ Missing'}`);
          
          if (csrfData.csrfToken) {
            console.log(`   Token value: ${csrfData.csrfToken.substring(0, 20)}...`);
          }
          
          // Check cookies
          const cookies = res.headers['set-cookie'];
          if (cookies) {
            console.log('\n   Cookies from CSRF endpoint:');
            cookies.forEach(cookie => {
              if (cookie.includes('csrf')) {
                console.log(`   ✅ ${cookie.split(';')[0]}`);
              }
            });
          }
          
          console.log('');
          resolve(csrfData.csrfToken);
        } catch (e) {
          console.log('   ❌ Failed to parse CSRF response');
          console.log(`   Response: ${data}`);
          console.log('');
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}\n`);
      resolve(null);
    });
  });
}

// Test providers endpoint
async function testProviders() {
  return new Promise((resolve) => {
    console.log('2️⃣  Checking available auth providers...\n');
    
    https.get('https://www.collegecomps.com/api/auth/providers', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const providers = JSON.parse(data);
          console.log('   Available providers:');
          console.log(`   ${JSON.stringify(providers, null, 2)}`);
          
          if (providers.credentials) {
            console.log('   ✅ Credentials provider available');
          } else {
            console.log('   ❌ Credentials provider NOT found');
            console.log('   This means credential login is disabled!');
          }
          
          if (providers.google) {
            console.log('   ✅ Google provider available');
          }
          
          console.log('');
          resolve(providers);
        } catch (e) {
          console.log('   ❌ Failed to parse providers response');
          console.log(`   Response: ${data}`);
          console.log('');
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}\n`);
      resolve(null);
    });
  });
}

// Check what domain cookies are being set for
async function testCookieDomain() {
  return new Promise((resolve) => {
    console.log('3️⃣  Testing cookie domain configuration...\n');
    
    // Try accessing from both www and non-www
    const domains = [
      'https://www.collegecomps.com',
      'https://collegecomps.com'
    ];
    
    let completed = 0;
    
    domains.forEach(domain => {
      https.get(`${domain}/api/auth/csrf`, (res) => {
        console.log(`   ${domain}:`);
        console.log(`   Status: ${res.statusCode}`);
        
        const cookies = res.headers['set-cookie'];
        if (cookies) {
          cookies.forEach(cookie => {
            if (cookie.includes('csrf') || cookie.includes('callback')) {
              const domainMatch = cookie.match(/Domain=([^;]+)/);
              if (domainMatch) {
                console.log(`   Cookie domain: ${domainMatch[1]}`);
                
                if (domainMatch[1] === '.collegecomps.com') {
                  console.log(`   ✅ Correct! Works on both www and non-www`);
                } else {
                  console.log(`   ⚠️  Domain may cause issues`);
                }
              } else {
                console.log(`   ⚠️  No domain attribute (defaults to exact host)`);
              }
            }
          });
        }
        
        console.log('');
        completed++;
        if (completed === domains.length) {
          resolve(true);
        }
      }).on('error', (err) => {
        console.log(`   ❌ Error: ${err.message}\n`);
        completed++;
        if (completed === domains.length) {
          resolve(false);
        }
      });
    });
  });
}

// Check server logs/errors
async function testAuthCallback() {
  return new Promise((resolve) => {
    console.log('4️⃣  Testing auth callback endpoint...\n');
    
    https.get('https://www.collegecomps.com/api/auth/callback/credentials', (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Expected: 400 (missing credentials) or 405 (GET not allowed)`);
      
      if (res.statusCode === 405) {
        console.log('   ✅ Endpoint exists (rejects GET, needs POST)');
      } else if (res.statusCode === 400) {
        console.log('   ✅ Endpoint exists (needs credentials)');
      } else if (res.statusCode === 404) {
        console.log('   ❌ Endpoint NOT FOUND - auth routes not working!');
      }
      
      console.log('');
      resolve(true);
    }).on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}\n`);
      resolve(false);
    });
  });
}

// Run all tests
async function runAllTests() {
  const csrfToken = await testCSRFFlow();
  const providers = await testProviders();
  await testCookieDomain();
  await testAuthCallback();
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 DIAGNOSIS SUMMARY:');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  if (!csrfToken) {
    console.log('❌ CRITICAL: CSRF token not available');
    console.log('   This will cause all logins to fail');
    console.log('   Check AUTH_SECRET environment variable');
    console.log('');
  }
  
  if (!providers || !providers.credentials) {
    console.log('❌ CRITICAL: Credentials provider not available');
    console.log('   Credential login is disabled in production');
    console.log('   Check auth.ts configuration');
    console.log('');
  }
  
  console.log('Next steps:');
  console.log('');
  console.log('1. Share the output above');
  console.log('2. Try login in browser with DevTools open:');
  console.log('   - F12 → Network tab');
  console.log('   - Filter: "auth"');
  console.log('   - Login with: admin@collegecomps.com / Admin123!@#');
  console.log('   - Look for POST /api/auth/callback/credentials');
  console.log('   - Share screenshot of request/response');
  console.log('');
  console.log('3. Check NEXTAUTH_URL value:');
  console.log('   - Should be: https://www.collegecomps.com');
  console.log('   - OR: https://collegecomps.com');
  console.log('   - NOT: http:// (must be https)');
  console.log('   - NOT: localhost');
  console.log('');
}

runAllTests();
