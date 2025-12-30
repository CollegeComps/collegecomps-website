import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@collegecomps.com';

export async function POST(request: NextRequest) {
    if (!resend) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

  try {
    const { email, personalityType, careers, colleges } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Build career list HTML
    const careerListHtml = careers
      .slice(0, 10) // Top 10 careers
      .map((career: any, index: number) => `
        <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
          <h3 style="margin: 0 0 5px; color: #1f2937; font-size: 18px;">${index + 1}. ${career.title}</h3>
          <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${career.description || ''}</p>
          ${career.salary ? `<p style="margin: 5px 0; color: #10b981; font-weight: bold;">Median Salary: ${career.salary}</p>` : ''}
        </div>
      `).join('');

    // Build college list HTML
    const collegeListHtml = colleges && colleges.length > 0 
      ? `
        <div style="margin-top: 30px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
          <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 15px;">Recommended Colleges</h2>
          ${colleges.slice(0, 5).map((college: any) => `
            <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
              <h3 style="margin: 0 0 5px; color: #1f2937; font-size: 16px;">${college.name}</h3>
              <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${college.city}, ${college.state}</p>
              ${college.roi ? `<p style="margin: 5px 0; color: #10b981; font-weight: bold;">40-Year ROI: ${college.roi}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` 
      : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 650px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Your Career Finder Results</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Based on your personality type: <strong>${personalityType}</strong></p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
                Thank you for using CollegeComps Career Finder! Below are your personalized career matches based on your interests and strengths.
              </p>
              
              <h2 style="color: #1f2937; font-size: 24px; margin: 30px 0 15px;">Your Top Career Matches</h2>
              ${careerListHtml}
              
              ${collegeListHtml}
              
              <!-- CTA -->
              <div style="text-align: center; margin: 40px 0 30px;">
                <a href="https://www.collegecomps.com/career-finder" style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Explore More Careers</a>
              </div>
              
              <p style="margin: 30px 0 0; padding-top: 30px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center;">
                Visit <a href="https://www.collegecomps.com" style="color: #f97316; text-decoration: none;">CollegeComps.com</a> to calculate ROI for colleges and programs that align with your career goals.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your Career Finder Results - ${personalityType}`,
      html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    console.log('[SUCCESS] Career Finder email sent:', { to: email, emailId: data?.id });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Results sent successfully!',
      emailId: data?.id 
    });

  } catch (error: any) {
    console.error('❌ Error in career-finder send-results:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
