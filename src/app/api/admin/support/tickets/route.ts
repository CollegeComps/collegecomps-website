import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUsersDb } from '@/lib/db-helper';

export async function GET(request: Request) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you can add an is_admin column to users table or check email)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');

    let query = `
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        u.subscription_tier,
        (SELECT COUNT(*) FROM support_messages WHERE ticket_id = t.id) as message_count
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    if (category) {
      query += ' AND t.category = ?';
      params.push(category);
    }

    query += ' ORDER BY t.priority DESC, t.created_at DESC';

    const tickets = await db.prepare(query).all(...params);
    
    // Get statistics
    const stats = await db.prepare(`
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tickets,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN priority = 'normal' THEN 1 ELSE 0 END) as normal_priority,
        SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low_priority
      FROM support_tickets
    `).get();

    return NextResponse.json({ tickets, stats });
  } catch (error) {
    console.error('Error fetching admin tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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

    const { ticketId, status, assignedTo } = await request.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (assignedTo !== undefined) {
      updates.push('assigned_to = ?');
      params.push(assignedTo);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(ticketId);

    const query = `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?`;
    await db.prepare(query).run(...params);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
