// Email service for sending transactional emails via Resend
import { Resend } from 'resend';
import { 
  WelcomeEmail, 
  PasswordResetEmail, 
  EmailVerificationReminderEmail 
} from './email-templates';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@collegecomps.com';
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.collegecomps.com' 
  : 'http://localhost:3000';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  userId?: string;
}

async function sendEmail({ to, subject, html, userId }: SendEmailOptions) {
  try {
    // Add unsubscribe URL to template
    const unsubscribeUrl = userId 
      ? `${BASE_URL}/api/unsubscribe?user=${encodeURIComponent(userId)}`
      : `${BASE_URL}/unsubscribe`;
    
    const htmlWithUnsubscribe = html.replace('{{unsubscribeUrl}}', unsubscribeUrl);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: htmlWithUnsubscribe,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('✅ Email sent successfully:', { to, subject, emailId: data?.id });
    return data;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(
  email: string, 
  userName: string, 
  verificationToken: string,
  userId: string
) {
  const verificationUrl = `${BASE_URL}/auth/verify-email?token=${verificationToken}`;
  
  return sendEmail({
    to: email,
    subject: 'Welcome to CollegeComps! Please verify your email',
    html: WelcomeEmail({ userName, verificationUrl }),
    userId,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  resetToken: string,
  userId: string
) {
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: email,
    subject: 'Reset your CollegeComps password',
    html: PasswordResetEmail({ userName, resetUrl }),
    userId,
  });
}

export async function sendVerificationReminderEmail(
  email: string,
  userName: string,
  verificationToken: string,
  userId: string
) {
  const verificationUrl = `${BASE_URL}/auth/verify-email?token=${verificationToken}`;
  
  return sendEmail({
    to: email,
    subject: 'Please verify your email address',
    html: EmailVerificationReminderEmail({ userName, verificationUrl }),
    userId,
  });
}
