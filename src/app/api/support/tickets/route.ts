import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUsersDb } from '@/lib/db-helper'

// Helper to initialize tables
function initTables(db: any) {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_email TEXT NOT NULL,
        user_name TEXT,
        subscription_tier TEXT NOT NULL DEFAULT 'free',
        subject TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'normal',
        status TEXT NOT NULL DEFAULT 'open',
        description TEXT NOT NULL,
        attachments TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        first_response_at DATETIME,
        assigned_to TEXT,
        response_count INTEGER DEFAULT 0,
        last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS support_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        user_id INTEGER,
        is_staff BOOLEAN DEFAULT 0,
        message TEXT NOT NULL,
        attachments TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
      );
    `);
  } catch (e) {
    // Tables might already exist
  }
}

// GET - Fetch user's tickets
export async function GET(req: NextRequest) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
  
  initTables(db);

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tickets = db.prepare(`
      SELECT * FROM support_tickets
      WHERE user_id = ?
      ORDER BY 
        CASE status 
          WHEN 'open' THEN 1
          WHEN 'in_progress' THEN 2
          WHEN 'waiting_on_customer' THEN 3
          WHEN 'resolved' THEN 4
          WHEN 'closed' THEN 5
        END,
        created_at DESC
    `).all(session.user.id);

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// POST - Create new support ticket
export async function POST(req: NextRequest) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subject, category, description } = body;

    if (!subject || !category || !description) {
      return NextResponse.json(
        { error: 'Subject, category, and description are required' },
        { status: 400 }
      );
    }

    // Determine priority based on subscription tier
    const tier = session.user.subscriptionTier || 'free';
    const priority = tier === 'professional' ? 'high' : tier === 'premium' ? 'normal' : 'low';

    const result = await db.prepare(`
      INSERT INTO support_tickets (
        user_id, user_email, user_name, subscription_tier,
        subject, category, description, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      session.user.id,
      session.user.email,
      session.user.name || 'User',
      tier,
      subject,
      category,
      description,
      priority
    );

    const ticket = await db.prepare(`
      SELECT * FROM support_tickets WHERE id = ?
    `).get(result.lastInsertRowid);

    // TODO: Send email notification to support team
    // TODO: For professional tier, trigger priority notification

    return NextResponse.json({
      message: 'Support ticket created successfully',
      ticket,
      priority: tier === 'professional' 
        ? 'Your ticket has been marked as HIGH PRIORITY and will be reviewed within 4 hours'
        : tier === 'premium'
        ? 'Your ticket will be reviewed within 24 hours'
        : 'Your ticket will be reviewed within 48 hours',
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
