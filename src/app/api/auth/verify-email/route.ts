// API route for verifying email addresses
import { NextRequest, NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db-helper';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const usersDb = getUsersDb();
    
    if (!usersDb) {
      console.error('❌ Users database not available');
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 500 }
      );
    }

    // Find user with this verification token
    const user = usersDb.prepare(`
      SELECT id, email, verification_token_expires, email_verified
      FROM users
      WHERE verification_token = ?
    `).get(token) as any;

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.email_verified === 1) {
      return NextResponse.json(
        { message: 'Email already verified', alreadyVerified: true },
        { status: 200 }
      );
    }

    // Check if token expired
    if (user.verification_token_expires) {
      const expiresAt = new Date(user.verification_token_expires);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Verification token has expired. Please request a new one.' },
          { status: 400 }
        );
      }
    }

    // Mark email as verified
    usersDb.prepare(`
      UPDATE users 
      SET email_verified = 1,
          verification_token = NULL,
          verification_token_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(user.id);

    console.log(`✅ Email verified for user: ${user.email}`);

    return NextResponse.json(
      { message: 'Email verified successfully!', success: true },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Failed to verify email. Please try again.' },
      { status: 500 }
    );
  }
}
