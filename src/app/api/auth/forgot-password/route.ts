import { NextRequest, NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db-helper';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await db.prepare('SELECT id, email, name FROM users WHERE email = ?').get(email) as { id: number; email: string; name: string } | undefined;

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json({ 
        success: true,
        message: 'If an account exists with that email, a reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in database
    await db.prepare(`
      UPDATE users 
      SET reset_token = ?, 
          reset_token_expiry = ? 
      WHERE id = ?
    `).run(resetTokenHash, resetTokenExpiry.toISOString(), user.id);

    // Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    // TODO: Send email with reset link
    // For now, just log it (in production, use SendGrid, AWS SES, etc.)
    console.log('Password reset link:', resetLink);
    console.log('User:', user.email);

    // In development, you could return the link
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true,
        message: 'Reset link generated',
        resetLink // Remove this in production
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'If an account exists with that email, a reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
