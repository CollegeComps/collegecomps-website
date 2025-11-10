import { NextRequest, NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db-helper';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to debug the exact auth flow
 * This returns detailed information about each step
 */
export async function POST(request: NextRequest) {
  const logs: string[] = [];
  const results: any = {
    success: false,
    steps: {},
    logs: []
  };

  try {
    logs.push('========== AUTH FLOW TEST START ==========');
    
    const body = await request.json();
    const { email, password } = body;

    logs.push(`Step 1: Credentials received - email: ${email}, password length: ${password?.length}`);
    results.steps.credentialsReceived = {
      email,
      hasPassword: !!password,
      passwordLength: password?.length
    };

    // Step 2: Check credentials
    if (!email || !password) {
      logs.push('❌ FAILED: Missing email or password');
      results.steps.credentialsCheck = { passed: false, reason: 'Missing credentials' };
      results.logs = logs;
      return NextResponse.json(results);
    }
    logs.push('[SUCCESS] Credentials check passed');
    results.steps.credentialsCheck = { passed: true };

    // Step 3: Get database
    logs.push('Step 3: Getting database connection...');
    const db = getUsersDb();
    if (!db) {
      logs.push('❌ FAILED: Database unavailable');
      results.steps.databaseConnection = { passed: false, reason: 'Database unavailable' };
      results.logs = logs;
      return NextResponse.json(results);
    }
    logs.push(`[SUCCESS] Database connection obtained: ${db.constructor.name}`);
    results.steps.databaseConnection = { 
      passed: true, 
      dbType: db.constructor.name 
    };

    // Step 4: Query user
    logs.push(`Step 4: Querying user from database - SELECT * FROM users WHERE email = '${email}'`);
    let user: any;
    try {
      const prepared = db.prepare('SELECT * FROM users WHERE email = ?');
      logs.push(`Prepared statement created: ${typeof prepared}`);
      logs.push(`Prepared.get is: ${typeof prepared.get}`);
      
      user = await prepared.get(email);
      
      logs.push(`Query executed. Result type: ${typeof user}`);
      logs.push(`User found: ${!!user}`);
      
      if (user) {
        logs.push(`User details: id=${user.id}, email=${user.email}, has_password_hash=${!!user.password_hash}`);
        results.steps.userQuery = {
          passed: true,
          userFound: true,
          userId: user.id,
          email: user.email,
          hasPasswordHash: !!user.password_hash,
          passwordHashLength: user.password_hash?.length,
          passwordHashPreview: user.password_hash?.substring(0, 20)
        };
      } else {
        logs.push('User object is null/undefined');
        results.steps.userQuery = {
          passed: false,
          userFound: false,
          reason: 'User not found in database'
        };
      }
    } catch (error: any) {
      logs.push(`❌ FAILED: Database query error - ${error.message}`);
      logs.push(`Error stack: ${error.stack}`);
      results.steps.userQuery = { 
        passed: false, 
        error: error.message,
        stack: error.stack
      };
      results.logs = logs;
      return NextResponse.json(results);
    }

    if (!user) {
      logs.push(`❌ FAILED: User not found for email: ${email}`);
      results.logs = logs;
      return NextResponse.json(results);
    }

    if (!user.password_hash) {
      logs.push('❌ FAILED: User has no password (OAuth user)');
      results.steps.passwordHashCheck = { passed: false, reason: 'No password hash (OAuth user)' };
      results.logs = logs;
      return NextResponse.json(results);
    }
    logs.push('[SUCCESS] User has password hash');
    results.steps.passwordHashCheck = { passed: true };

    // Step 5: Compare password
    logs.push('Step 5: Comparing password with bcrypt...');
    logs.push(`Password hash from DB: ${user.password_hash.substring(0, 20)}...`);
    
    let isValid: boolean;
    try {
      isValid = await bcrypt.compare(password, user.password_hash);
      logs.push(`bcrypt.compare result: ${isValid}`);
      results.steps.passwordComparison = {
        passed: true,
        isValid,
        inputPasswordLength: password.length,
        hashLength: user.password_hash.length
      };
    } catch (error: any) {
      logs.push(`❌ FAILED: bcrypt compare error - ${error.message}`);
      results.steps.passwordComparison = { 
        passed: false, 
        error: error.message 
      };
      results.logs = logs;
      return NextResponse.json(results);
    }

    if (!isValid) {
      logs.push('❌ FAILED: Invalid password');
      results.logs = logs;
      return NextResponse.json(results);
    }
    logs.push('[SUCCESS] Password is valid');

    // Step 6: Build user object (same as authorize does)
    logs.push('Step 6: Building user object for return...');
    const authUser = {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      subscriptionTier: user.subscription_tier,
      subscriptionStatus: 'active'
    };
    logs.push(`User object: ${JSON.stringify(authUser)}`);
    results.steps.userObjectCreation = {
      passed: true,
      userObject: authUser
    };

    logs.push('========== AUTH FLOW TEST SUCCESS ==========');
    results.success = true;
    results.logs = logs;

    return NextResponse.json(results);

  } catch (error: any) {
    logs.push(`❌ UNEXPECTED ERROR: ${error.message}`);
    logs.push(`Stack: ${error.stack}`);
    results.error = error.message;
    results.stack = error.stack;
    results.logs = logs;
    return NextResponse.json(results, { status: 500 });
  }
}
