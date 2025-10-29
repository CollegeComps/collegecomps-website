import { NextRequest, NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db-helper';

// Resend webhook for incoming email replies to support tickets
// Users can reply directly to support ticket emails
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Verify webhook signature if Resend provides one
    const signature = req.headers.get('resend-signature');
    // TODO: Verify signature when Resend documentation is available
    
    // Parse the incoming email
    const { from, to, subject, text, html } = body;
    
    // Extract ticket ID from subject or email address
    // Format: "Re: Support Ticket #123: Subject"
    const ticketMatch = subject?.match(/#(\d+)/);
    if (!ticketMatch) {
      console.log('No ticket ID found in subject:', subject);
      return NextResponse.json({ error: 'No ticket ID found' }, { status: 400 });
    }
    
    const ticketId = parseInt(ticketMatch[1]);
    
    const db = getUsersDb();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }
    
    // Verify ticket exists and get user info
    const ticket = await db.prepare(`
      SELECT id, user_id, user_email, status
      FROM support_tickets
      WHERE id = ?
    `).get(ticketId) as any;
    
    if (!ticket) {
      console.log('Ticket not found:', ticketId);
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    // Verify email is from the ticket owner
    const senderEmail = from.toLowerCase().trim();
    if (senderEmail !== ticket.user_email.toLowerCase()) {
      console.log('Email mismatch. From:', senderEmail, 'Expected:', ticket.user_email);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Add message to ticket
    await db.prepare(`
      INSERT INTO support_messages (ticket_id, user_id, is_staff, message, created_at)
      VALUES (?, ?, 0, ?, datetime('now'))
    `).run(ticketId, ticket.user_id, text || html || '');
    
    // Update ticket activity
    await db.prepare(`
      UPDATE support_tickets
      SET response_count = response_count + 1,
          last_activity_at = datetime('now'),
          status = CASE WHEN status = 'closed' THEN 'reopened' ELSE status END,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(ticketId);
    
    console.log(`Email reply added to ticket #${ticketId} from ${senderEmail}`);
    
    return NextResponse.json({ 
      success: true,
      ticketId,
      message: 'Reply added successfully'
    });
    
  } catch (error: any) {
    console.error('Error processing email webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to verify webhook is working
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    endpoint: 'email-webhook',
    message: 'POST to this endpoint with Resend webhook payload'
  });
}
