// Email service for sending transactional emails via Resend
import { Resend } from 'resend';
import { 
  WelcomeEmail, 
  PasswordResetEmail, 
  EmailVerificationReminderEmail 
} from './email-templates';

// Lazy initialization - only throw error when actually trying to send email
let resend: Resend | null = null;

function getResendClient() {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not defined in environment variables');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@collegecomps.com';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@collegecomps.com';
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.collegecomps.com' 
  : 'http://localhost:3000';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  userId?: string;
  replyTo?: string;
}

async function sendEmail({ to, subject, html, userId, replyTo }: SendEmailOptions) {
  try {
    const client = getResendClient(); // Get or initialize client
    
    // Add unsubscribe URL to template
    const unsubscribeUrl = userId 
      ? `${BASE_URL}/api/unsubscribe?user=${encodeURIComponent(userId)}`
      : `${BASE_URL}/unsubscribe`;
    
    const htmlWithUnsubscribe = html.replace('{{unsubscribeUrl}}', unsubscribeUrl);
    
    const emailData: any = {
      from: FROM_EMAIL,
      to,
      subject,
      html: htmlWithUnsubscribe,
    };

    // Add reply-to if provided
    if (replyTo) {
      emailData.reply_to = replyTo;
    }

    const { data, error } = await client.emails.send(emailData);

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

export async function sendSupportTicketConfirmation(
  email: string,
  userName: string,
  ticketId: number,
  subject: string,
  category: string,
  priority: string,
  userId: string
) {
  const ticketUrl = `${BASE_URL}/support?ticket=${ticketId}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Support Ticket Created</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="margin: 0 0 20px;">Hi ${userName},</p>
            
            <p style="margin: 0 0 20px;">Your support ticket has been successfully created and assigned ticket number <strong>#${ticketId}</strong>.</p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 0 0 10px;"><strong>Category:</strong> ${category}</p>
              <p style="margin: 0;"><strong>Priority:</strong> <span style="color: ${priority === 'high' ? '#dc2626' : priority === 'normal' ? '#f59e0b' : '#10b981'}; font-weight: bold;">${priority.toUpperCase()}</span></p>
            </div>
            
            <p style="margin: 20px 0;">Our support team will review your ticket and respond ${priority === 'high' ? 'within 4 hours' : priority === 'normal' ? 'within 24 hours' : 'within 48 hours'}.</p>
            
            <p style="margin: 20px 0;">You can view and track your ticket status at any time:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${ticketUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Ticket</a>
            </div>
            
            <p style="margin: 20px 0; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <strong>Tip:</strong> You can reply to this email to add more information to your ticket. Your response will be automatically added to ticket #${ticketId}.
            </p>
            
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Thank you for using CollegeComps!
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return sendEmail({
    to: email,
    subject: `[Ticket #${ticketId}] ${subject}`,
    html,
    userId,
    replyTo: SUPPORT_EMAIL,
  });
}

export async function sendSupportTicketReply(
  email: string,
  userName: string,
  ticketId: number,
  subject: string,
  replyMessage: string,
  isStaff: boolean,
  userId: string
) {
  const ticketUrl = `${BASE_URL}/support?ticket=${ticketId}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Reply to Your Ticket</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="margin: 0 0 20px;">Hi ${userName},</p>
            
            <p style="margin: 0 0 20px;">${isStaff ? 'Our support team' : 'You'} ${isStaff ? 'has' : 'have'} added a new reply to ticket <strong>#${ticketId}</strong>.</p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px;"><strong>Ticket:</strong> ${subject}</p>
              <p style="margin: 10px 0 0; white-space: pre-wrap;">${replyMessage}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${ticketUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Full Conversation</a>
            </div>
            
            <p style="margin: 20px 0; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <strong>Reply directly:</strong> Simply reply to this email to add your response to ticket #${ticketId}.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return sendEmail({
    to: email,
    subject: `Re: [Ticket #${ticketId}] ${subject}`,
    html,
    userId,
    replyTo: SUPPORT_EMAIL,
  });
}
