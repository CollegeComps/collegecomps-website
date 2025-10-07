import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import Database from 'better-sqlite3';

const db = new Database('data/users.db');

// Initialize alert_preferences table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS alert_preferences (
    user_id INTEGER PRIMARY KEY,
    preferences TEXT NOT NULL,
    frequency TEXT DEFAULT 'instant',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.subscriptionTier !== 'premium') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    const prefs = db.prepare(`
      SELECT preferences, frequency
      FROM alert_preferences
      WHERE user_id = ?
    `).get(session.user.id) as { preferences: string; frequency: string } | undefined;

    return NextResponse.json({
      preferences: prefs ? JSON.parse(prefs.preferences) : null,
      frequency: prefs?.frequency || 'instant',
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
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.subscriptionTier !== 'premium') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    const body = await req.json();
    const { preferences, frequency = 'instant' } = body;

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences are required' }, { status: 400 });
    }

    // Upsert alert preferences
    db.prepare(`
      INSERT INTO alert_preferences (user_id, preferences, frequency, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        preferences = excluded.preferences,
        frequency = excluded.frequency,
        updated_at = CURRENT_TIMESTAMP
    `).run(session.user.id, JSON.stringify(preferences), frequency);

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
