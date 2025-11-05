import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUsersDb } from '@/lib/db-helper';

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

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const ticketId = id;

    // Get ticket details
    const ticketQuery = `
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        u.subscription_tier
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `;

    const ticket = await db.prepare(ticketQuery).get(ticketId);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
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

// POST - Add a reply message to the ticket
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

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const ticketId = id;
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get admin user ID
    const adminUser: any = await db.prepare('SELECT id FROM users WHERE email = ?').get(session.user.email);

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Insert the admin's reply
    const insertResult: any = await db.prepare(`
      INSERT INTO support_messages (ticket_id, user_id, message, is_admin_reply, created_at)
      VALUES (?, ?, ?, 1, datetime('now'))
    `).run(ticketId, adminUser.id, message.trim());

    // Update ticket's updated_at timestamp
    await db.prepare(`
      UPDATE support_tickets 
      SET updated_at = datetime('now')
      WHERE id = ?
    `).run(ticketId);

    return NextResponse.json({
      success: true,
      messageId: Number(insertResult.lastInsertRowid)
    });
  } catch (error) {
    console.error('Error posting reply:', error);
    return NextResponse.json(
      { error: 'Failed to post reply' },
      { status: 500 }
    );
  }
}

// PATCH - Update ticket status or priority
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

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const ticketId = id;
    const body = await request.json();
    const { status, priority } = body;

    const updates: string[] = [];
    const queryParams: any[] = [];

    if (status) {
      updates.push('status = ?');
      queryParams.push(status);
    }

    if (priority) {
      updates.push('priority = ?');
      queryParams.push(priority);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push('updated_at = datetime(\'now\')');
    queryParams.push(ticketId);

    const query = `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?`;
    await db.prepare(query).run(...queryParams);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
