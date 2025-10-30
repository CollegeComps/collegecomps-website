import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUsersDb } from '@/lib/db-helper';

// GET - Fetch ticket details (user can only see their own tickets)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ticketId = id;

    // Get ticket details - IMPORTANT: Only return tickets belonging to this user
    const ticketQuery = `
      SELECT 
        t.*
      FROM support_tickets t
      WHERE t.id = ? AND t.user_id = ?
    `;

    const ticket = db.prepare(ticketQuery).get(ticketId, session.user.id);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found or access denied' }, { status: 404 });
    }

    // Get all messages for this ticket
    const messagesQuery = `
      SELECT 
        m.*,
        u.name as author_name,
        u.email as author_email
      FROM support_messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.ticket_id = ?
      ORDER BY m.created_at ASC
    `;

    const messages = db.prepare(messagesQuery).all(ticketId);

    return NextResponse.json({
      ticket,
      messages: messages || []
    });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket details' },
      { status: 500 }
    );
  }
}

// POST - Add a message to the ticket (user can only post to their own tickets)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ticketId = id;
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Verify this ticket belongs to the user
    const ticket: any = db.prepare('SELECT id, user_id FROM support_tickets WHERE id = ? AND user_id = ?')
      .get(ticketId, session.user.id);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found or access denied' }, { status: 404 });
    }

    // Insert the user's message
    const insertResult: any = db.prepare(`
      INSERT INTO support_messages (ticket_id, user_id, message, is_admin_reply, created_at)
      VALUES (?, ?, ?, 0, datetime('now'))
    `).run(ticketId, session.user.id, message.trim());

    // Update ticket's updated_at and last_activity_at
    db.prepare(`
      UPDATE support_tickets 
      SET updated_at = datetime('now'),
          last_activity_at = datetime('now')
      WHERE id = ?
    `).run(ticketId);

    return NextResponse.json({
      success: true,
      messageId: insertResult.lastInsertRowid
    });
  } catch (error) {
    console.error('Error posting message:', error);
    return NextResponse.json(
      { error: 'Failed to post message' },
      { status: 500 }
    );
  }
}
