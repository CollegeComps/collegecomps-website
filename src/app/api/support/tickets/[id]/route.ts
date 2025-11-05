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
    const ticketId = Number(id);
    
    // Convert session.user.id to number for INTEGER comparison in database
    const userId = Number(session.user.id);

    console.log('[Ticket Details API] Fetching ticket:', { ticketId, userId, ticketIdType: typeof ticketId, userIdType: typeof userId });

    // Get ticket details - IMPORTANT: Only return tickets belonging to this user
    const ticketQuery = `
      SELECT 
        t.*
      FROM support_tickets t
      WHERE t.id = ? AND t.user_id = ?
    `;

    console.log('[Ticket Details API] Executing query:', ticketQuery);
    console.log('[Ticket Details API] Query params:', [ticketId, userId]);

    const ticket = await db.prepare(ticketQuery).get(ticketId, userId);

    console.log('[Ticket Details API] Query result:', ticket);

    if (!ticket) {
      console.log('[Ticket Details API] No ticket found or access denied');
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

    const messages = await db.prepare(messagesQuery).all(ticketId);

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
    const ticketId = Number(id);
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Convert session.user.id to number for INTEGER comparison in database
    const userId = Number(session.user.id);

    // Verify this ticket belongs to the user
    const ticket: any = await db.prepare('SELECT id, user_id FROM support_tickets WHERE id = ? AND user_id = ?')
      .get(ticketId, userId);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found or access denied' }, { status: 404 });
    }

    // Insert the user's message
    const insertResult: any = await db.prepare(`
      INSERT INTO support_messages (ticket_id, user_id, message, is_admin_reply, created_at)
      VALUES (?, ?, ?, 0, datetime('now'))
    `).run(ticketId, userId, message.trim());

    // Update ticket's updated_at and last_activity_at
    await db.prepare(`
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

// PATCH - Update ticket status (user can only update their own tickets)
export async function PATCH(
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
    const ticketId = Number(id);
    const { status } = await request.json();

    // Validate status
    const validStatuses = ['open', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Users can only set status to: open or closed' }, { status: 400 });
    }

    // Convert session.user.id to number for INTEGER comparison in database
    const userId = Number(session.user.id);

    // Verify this ticket belongs to the user
    const ticket: any = await db.prepare('SELECT id, user_id FROM support_tickets WHERE id = ? AND user_id = ?')
      .get(ticketId, userId);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found or access denied' }, { status: 404 });
    }

    // Update the ticket status
    await db.prepare(`
      UPDATE support_tickets 
      SET status = ?,
          updated_at = datetime('now'),
          resolved_at = CASE WHEN ? = 'closed' THEN datetime('now') ELSE resolved_at END
      WHERE id = ?
    `).run(status, status, ticketId);

    return NextResponse.json({
      success: true,
      message: `Ticket ${status === 'closed' ? 'closed' : 'reopened'} successfully`
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
