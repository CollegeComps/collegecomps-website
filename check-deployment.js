#!/usr/bin/env node

async function checkDeployment() {
  console.log('🔍 Checking if new signin code is deployed...\n');
  
  try {
    // Fetch the signin page HTML
    const response = await fetch('https://www.collegecomps.com/auth/signin', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    const html = await response.text();
    
    // Check for the build ID in the HTML
    const buildIdMatch = html.match(/"buildId":"([^"]+)"/);
    const buildId = buildIdMatch ? buildIdMatch[1] : 'unknown';
    
    console.log(`📦 Build ID: ${buildId}\n`);
    
    // Try to fetch the providers endpoint to see if credentials is there
    const providersResponse = await fetch('https://www.collegecomps.com/api/auth/providers', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    const providers = await providersResponse.json();
    
    console.log('🔌 Available providers:', JSON.stringify(providers, null, 2));
    
    if (providers.credentials) {
      console.log('\n✅ Credentials provider is available!');
      console.log('\n📝 INSTRUCTIONS FOR USER:');
      console.log('1. Open browser in INCOGNITO/PRIVATE mode');
      console.log('2. Go to: https://www.collegecomps.com/auth/signin');
      console.log('3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)');
      console.log('4. Login with: admin@collegecomps.com / Admin123!@#');
      console.log('5. You should be redirected to home page and stay logged in\n');
      console.log('⚠️  If still not working, wait 2-3 more minutes for CDN cache to clear');
    } else {
      console.log('\n❌ Credentials provider NOT yet deployed');
      console.log('Waiting for Vercel deployment to complete...');
    }
    
  } catch (error) {
    console.error('Error checking deployment:', error.message);
  }
}

checkDeployment();
