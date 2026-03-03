import { NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db-helper';
import bcrypt from 'bcryptjs';

interface DbUser {
  id: number;
  email: string;
  password_hash: string | null;
  name: string | null;
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const { email, password } = await request.json();
    
    // Step 1: Check database
    const db = getUsersDb();
    if (!db) {
      return NextResponse.json({ 
        error: 'Database unavailable',
        step: 'db_init'
      }, { status: 500 });
    }
    
    // Step 2: Query user
    const user = await db.prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as DbUser | undefined;
    
    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        step: 'user_query',
        email
      }, { status: 404 });
    }
    
    if (!user.password_hash) {
      return NextResponse.json({
        error: 'No password hash',
        step: 'password_check'
      }, { status: 400 });
    }
    
    // Step 3: Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    return NextResponse.json({
      success: true,
      passwordValid: isValid,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
    
  } catch (error: any) {
    console.error('[Debug Auth] Error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
