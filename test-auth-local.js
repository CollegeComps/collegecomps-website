#!/usr/bin/env node

const http = require('http');

console.log('Testing authentication flows locally...\n');

// Test 1: Check if dev server is running
function testServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/', (res) => {
      console.log('✅ Dev server is running');
      console.log(`   Status: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log('❌ Dev server not running');
      console.log(`   Error: ${err.message}`);
      console.log('   Please start dev server with: npm run dev');
      resolve(false);
    });
  });
}

// Test 2: Check signin page loads
function testSigninPage() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000/auth/signin', (res) => {
      console.log('✅ Sign in page accessible');
      console.log(`   Status: ${res.statusCode}`);
      resolve(true);
    }).on('error', (err) => {
      console.log('❌ Sign in page error');
      console.log(`   Error: ${err.message}`);
      resolve(false);
    });
  });
}

// Test 3: Check providers API
function testProvidersAPI() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000/api/auth/providers', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const providers = JSON.parse(data);
          console.log('✅ Providers API working');
          console.log(`   Available providers:`, providers);
          
          // Verify only Google is available (if env vars are set)
          const providerKeys = Object.keys(providers);
          const expectedProvider = 'google';
          
          if (providerKeys.length === 1 && providerKeys[0] === expectedProvider) {
            console.log(`   ✓ Only ${expectedProvider} provider configured (minimal setup)`);
          } else if (providerKeys.length === 0 || !providers.google) {
            console.log('   ⚠️  Google OAuth not configured (missing env vars)');
            console.log('   ℹ️  Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable');
          }
          
          resolve(true);
        } catch (err) {
          console.log('❌ Providers API parse error');
          console.log(`   Error: ${err.message}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('❌ Providers API error');
      console.log(`   Error: ${err.message}`);
      resolve(false);
    });
  });
}

// Run tests
async function runTests() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  AUTH TESTING - MINIMAL SETUP (Credentials + Google Only)');
  console.log('══════════════════════════════════════════════════════════════\n');
  
  const serverRunning = await testServerRunning();
  
  if (!serverRunning) {
    console.log('\n❌ Cannot proceed with tests - dev server is not running');
    console.log('   Start server with: cd collegecomps-web && npm run dev');
    process.exit(1);
  }
  
  console.log('');
  await testSigninPage();
  
  console.log('');
  await testProvidersAPI();
  
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  MANUAL TESTING STEPS:');
  console.log('══════════════════════════════════════════════════════════════\n');
  console.log('1. Open http://localhost:3000/auth/signin');
  console.log('2. Test credential login:');
  console.log('   - Email: admin@collegecomps.com');
  console.log('   - Password: admin123');
  console.log('   - Should redirect to dashboard after login');
  console.log('   - Check session persists on page refresh');
  console.log('');
  console.log('3. Test Google OAuth (if configured):');
  console.log('   - Click "Continue with Google" button');
  console.log('   - Should show Google login page');
  console.log('   - After authorization, should redirect back');
  console.log('   - Check session persists on page refresh');
  console.log('');
  console.log('4. Test Sign Out:');
  console.log('   - Click user menu in top right');
  console.log('   - Click "Sign Out"');
  console.log('   - Should redirect to homepage');
  console.log('   - Page should refresh and you should be logged out');
  console.log('   - Refresh page to confirm still logged out');
  console.log('\n══════════════════════════════════════════════════════════════\n');
}

runTests();
