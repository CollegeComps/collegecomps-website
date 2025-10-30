import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUsersDb } from '@/lib/db-helper'

// Helper to initialize table
async function initTable(db: any) {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS alert_preferences (
        user_id INTEGER PRIMARY KEY,
        preferences TEXT NOT NULL,
        frequency TEXT DEFAULT 'instant',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  } catch (e) {
    // Table might already exist
  }
}

export async function GET(req: NextRequest) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
  
  await initTable(db);

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.subscriptionTier !== 'premium') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    const prefs = await db.prepare(`
      SELECT 
        price_changes,
        new_salary_data,
        admission_updates,
        deadline_reminders,
        email_notifications,
        sms_notifications
      FROM alert_preferences
      WHERE user_id = ?
    `).get(session.user.id) as any;

    return NextResponse.json({
      preferences: prefs ? {
        priceChanges: Boolean(prefs.price_changes),
        newSalaryData: Boolean(prefs.new_salary_data),
        admissionUpdates: Boolean(prefs.admission_updates),
        deadlineReminders: Boolean(prefs.deadline_reminders),
        emailNotifications: Boolean(prefs.email_notifications),
        smsNotifications: Boolean(prefs.sms_notifications)
      } : null,
      frequency: 'instant', // Default for now
    });
  } catch (error) {
    console.error('Error fetching alert preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert preferences' },
      { status: 500 }
    );
  }
}

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

    if (session.user.subscriptionTier !== 'premium') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    const body = await req.json();
    const { preferences } = body;

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences are required' }, { status: 400 });
    }

    // Upsert alert preferences
    await db.prepare(`
      INSERT INTO alert_preferences (
        user_id, 
        price_changes, 
        new_salary_data, 
        admission_updates, 
        deadline_reminders,
        email_notifications,
        sms_notifications,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        price_changes = excluded.price_changes,
        new_salary_data = excluded.new_salary_data,
        admission_updates = excluded.admission_updates,
        deadline_reminders = excluded.deadline_reminders,
        email_notifications = excluded.email_notifications,
        sms_notifications = excluded.sms_notifications,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      session.user.id,
      preferences.priceChanges ? 1 : 0,
      preferences.newSalaryData ? 1 : 0,
      preferences.admissionUpdates ? 1 : 0,
      preferences.deadlineReminders ? 1 : 0,
      preferences.emailNotifications ? 1 : 0,
      preferences.smsNotifications ? 1 : 0
    );

    return NextResponse.json({
      message: 'Alert preferences saved successfully',
    });
  } catch (error) {
    console.error('Error saving alert preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save alert preferences' },
      { status: 500 }
    );
  }
}
