import { NextRequest, NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db-helper';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Create reset link with production domain
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.collegecomps.com' 
      : (process.env.NEXTAUTH_URL || 'http://localhost:3000');
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    // Send email with Resend
    try {
      await resend.emails.send({
        from: 'CollegeComps <noreply@collegecomps.com>',
        to: user.email,
        subject: 'Reset Your CollegeComps Password',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">CollegeComps</h1>
              </div>
              
              <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
                
                <p style="color: #4b5563; font-size: 16px;">Hi ${user.name || 'there'},</p>
                
                <p style="color: #4b5563; font-size: 16px;">
                  We received a request to reset your password for your CollegeComps account. 
                  Click the button below to create a new password:
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                  <a href="${resetLink}" 
                     style="background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                    Reset Password
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="color: #2563eb; font-size: 14px; word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 6px;">
                  ${resetLink}
                </p>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 25px 0; border-radius: 6px;">
                  <p style="color: #92400e; margin: 0; font-size: 14px;">
                    ⏰ <strong>This link will expire in 1 hour</strong> for security reasons.
                  </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  If you didn't request a password reset, you can safely ignore this email. 
                  Your password will remain unchanged.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                  © ${new Date().getFullYear()} CollegeComps. All rights reserved.<br>
                  Make smarter education decisions with data-driven insights.
                </p>
              </div>
            </body>
          </html>
        `,
      });

      console.log('Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
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
