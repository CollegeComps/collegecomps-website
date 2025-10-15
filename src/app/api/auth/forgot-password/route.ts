import { NextRequest, NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db-helper';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email-service';

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

    // Send password reset email using our template
    try {
      await sendPasswordResetEmail(
        user.email,
        user.name || 'there',
        resetToken,
        user.id.toString()
      );
      console.log('✅ Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to send reset email:', emailError);
      // Don't reveal to user that email failed - security best practice
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
