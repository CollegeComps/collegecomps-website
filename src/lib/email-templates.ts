// Email template utilities and components
// Used by Resend to send branded emails

interface EmailTemplateProps {
  children: React.ReactNode;
}

export function EmailTemplate({ children }: EmailTemplateProps) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CollegeComps</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f7;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    🎓 CollegeComps
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  ${children}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #6c757d; font-size: 14px;">
                    © ${new Date().getFullYear()} CollegeComps. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #6c757d; font-size: 12px;">
                    <a href="{{unsubscribeUrl}}" style="color: #667eea; text-decoration: none;">Unsubscribe</a> | 
                    <a href="https://www.collegecomps.com/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> | 
                    <a href="https://www.collegecomps.com/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

interface WelcomeEmailProps {
  userName: string;
  verificationUrl: string;
}

export function WelcomeEmail({ userName, verificationUrl }: WelcomeEmailProps) {
  const content = `
    <h2 style="margin: 0 0 20px; color: #212529; font-size: 24px;">
      Welcome to CollegeComps! 🎉
    </h2>
    <p style="margin: 0 0 16px; color: #495057; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>
    <p style="margin: 0 0 16px; color: #495057; font-size: 16px; line-height: 1.6;">
      Thank you for joining CollegeComps! We're excited to help you make data-driven decisions about your college education.
    </p>
    <p style="margin: 0 0 24px; color: #495057; font-size: 16px; line-height: 1.6;">
      To get started, please verify your email address by clicking the button below:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 0 0 24px;">
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Verify Email Address
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 16px; color: #6c757d; font-size: 14px; line-height: 1.6;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin: 0 0 24px; color: #667eea; font-size: 14px; word-break: break-all;">
      ${verificationUrl}
    </p>
    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 24px 0;">
    <p style="margin: 0 0 16px; color: #495057; font-size: 16px; line-height: 1.6;">
      <strong>Here's what you can do with CollegeComps:</strong>
    </p>
    <ul style="margin: 0 0 16px; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
      <li>Calculate ROI for any college and major combination</li>
      <li>Compare up to 3 colleges side-by-side (free tier)</li>
      <li>Explore historical trends and predictions</li>
      <li>Save your scenarios and bookmarks</li>
      <li>Access detailed salary insights (Premium)</li>
    </ul>
    <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6;">
      If you have any questions, just reply to this email. We're here to help!
    </p>
  `;
  
  return EmailTemplate({ children: content });
}

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
}

export function PasswordResetEmail({ userName, resetUrl }: PasswordResetEmailProps) {
  const content = `
    <h2 style="margin: 0 0 20px; color: #212529; font-size: 24px;">
      Reset Your Password 🔐
    </h2>
    <p style="margin: 0 0 16px; color: #495057; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>
    <p style="margin: 0 0 16px; color: #495057; font-size: 16px; line-height: 1.6;">
      We received a request to reset your password for your CollegeComps account.
    </p>
    <p style="margin: 0 0 24px; color: #495057; font-size: 16px; line-height: 1.6;">
      Click the button below to create a new password:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 0 0 24px;">
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 16px; color: #6c757d; font-size: 14px; line-height: 1.6;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin: 0 0 24px; color: #667eea; font-size: 14px; word-break: break-all;">
      ${resetUrl}
    </p>
    <div style="padding: 16px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin: 0 0 16px;">
      <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
        <strong>⏰ This link expires in 1 hour</strong><br>
        For security reasons, this password reset link will only work once and expires in 60 minutes.
      </p>
    </div>
    <p style="margin: 0 0 16px; color: #495057; font-size: 16px; line-height: 1.6;">
      If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
    </p>
    <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
      For security, never share this link with anyone.
    </p>
  `;
  
  return EmailTemplate({ children: content });
}

interface EmailVerificationReminderProps {
  userName: string;
  verificationUrl: string;
}

export function EmailVerificationReminderEmail({ userName, verificationUrl }: EmailVerificationReminderProps) {
  const content = `
    <h2 style="margin: 0 0 20px; color: #212529; font-size: 24px;">
      Please Verify Your Email ✉️
    </h2>
    <p style="margin: 0 0 16px; color: #495057; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>
    <p style="margin: 0 0 16px; color: #495057; font-size: 16px; line-height: 1.6;">
      We noticed you haven't verified your email address yet. Verifying your email helps us keep your account secure and ensures you receive important updates.
    </p>
    <p style="margin: 0 0 24px; color: #495057; font-size: 16px; line-height: 1.6;">
      Click the button below to verify your email:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 0 0 24px;">
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Verify Email Address
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 16px; color: #6c757d; font-size: 14px; line-height: 1.6;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin: 0; color: #667eea; font-size: 14px; word-break: break-all;">
      ${verificationUrl}
    </p>
  `;
  
  return EmailTemplate({ children: content });
}
