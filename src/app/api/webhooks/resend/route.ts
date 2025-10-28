// Webhook endpoint for Resend incoming email events
// This handles email replies to support tickets

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

interface ResendInboundEmail {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  headers?: Record<string, string>;
  reply_to?: string;
}

// Extract ticket number from subject line
// Expected format: "Re: [Ticket #123] Original subject"
function extractTicketNumber(subject: string): number | null {
  const match = subject.match(/\[Ticket #(\d+)\]/i);
  return match ? parseInt(match[1], 10) : null;
}

// Verify webhook signature (if Resend provides one)
function verifyWebhookSignature(request: NextRequest): boolean {
  // TODO: Implement signature verification when Resend provides it
  // For now, we'll rely on the webhook URL being secret
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Verify the webhook signature
    if (!verifyWebhookSignature(request)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const payload: ResendInboundEmail = await request.json();
    
    // Extract ticket number from subject
    const ticketNumber = extractTicketNumber(payload.subject);
    
    if (!ticketNumber) {
      console.error('Could not extract ticket number from subject:', payload.subject);
      return NextResponse.json(
        { error: 'Invalid subject format - no ticket number found' },
        { status: 400 }
      );
    }

    // Get the ticket from database
    const ticketResult = await turso.execute({
      sql: 'SELECT id, user_id, status FROM support_tickets WHERE id = ?',
      args: [ticketNumber],
    });

    if (ticketResult.rows.length === 0) {
      console.error('Ticket not found:', ticketNumber);
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const ticket = ticketResult.rows[0];
    const userId = ticket.user_id as number;

    // Use text or HTML content (prefer text for simplicity)
    const messageContent = payload.text || payload.html || '';

    if (!messageContent.trim()) {
      console.error('Email has no content');
      return NextResponse.json(
        { error: 'Email has no content' },
        { status: 400 }
      );
    }

    // Create a new message in the ticket
    // is_staff = 1 since this is coming from support@ email
    await turso.execute({
      sql: `INSERT INTO support_ticket_messages (ticket_id, user_id, message, is_staff, created_at)
            VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      args: [ticketNumber, userId, messageContent],
    });

    // Update ticket status to 'responded' if it was 'open'
    if (ticket.status === 'open') {
      await turso.execute({
        sql: 'UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        args: ['responded', ticketNumber],
      });
    }

    console.log(`Email reply added to ticket #${ticketNumber}`);

    return NextResponse.json({ 
      success: true,
      ticketNumber,
      message: 'Reply added successfully'
    });

  } catch (error) {
    console.error('Error processing inbound email webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process inbound email' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    endpoint: 'resend-webhook',
    purpose: 'Handles inbound email replies to support tickets'
  });
}
