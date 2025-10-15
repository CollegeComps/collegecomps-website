import { NextRequest, NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db-helper';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email-service';
import { forgotPasswordSchema } from '@/lib/validation-schemas';
import { authRateLimiter } from '@/lib/sanitization';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    // Rate limiting - 3 forgot password requests per 15 minutes per IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!authRateLimiter.isAllowed(`forgot-password:${ip}`, 3, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validate input
    let validatedData;
    try {
      validatedData = forgotPasswordSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodError = error as z.ZodError;
        return NextResponse.json(
          { error: zodError.issues[0].message },
          { status: 400 }
        );
      }
      throw error;
    }

    const { email } = validatedData;

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
