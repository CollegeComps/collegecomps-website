import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { randomBytes } from 'crypto';
import { getUsersDb } from '@/lib/db-helper'

// Helper to initialize table
function initTable(db: any) {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS shared_comparisons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        comparison_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        share_token TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        FOREIGN KEY (comparison_id) REFERENCES saved_comparisons(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  } catch (e) {
    // Table might already exist
  }
}

export async function POST(req: NextRequest) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
  
  initTable(db);

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.subscriptionTier !== 'premium') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    const body = await req.json();
    const { comparisonId } = body;

    if (!comparisonId) {
      return NextResponse.json({ error: 'Comparison ID is required' }, { status: 400 });
    }

    // Verify comparison exists and belongs to user
    const comparison = db.prepare(`
      SELECT id FROM saved_comparisons
      WHERE id = ? AND user_id = ?
    `).get(comparisonId, session.user.id);

    if (!comparison) {
      return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
    }

    // Check if share link already exists
    const existing = db.prepare(`
      SELECT share_token FROM shared_comparisons
      WHERE comparison_id = ? AND user_id = ?
    `).get(comparisonId, session.user.id) as { share_token: string } | undefined;

    if (existing) {
      return NextResponse.json({
        shareToken: existing.share_token,
        message: 'Share link already exists',
      });
    }

    // Generate unique share token
    const shareToken = randomBytes(16).toString('hex');

    // Create share link (expires in 30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    db.prepare(`
      INSERT INTO shared_comparisons (comparison_id, user_id, share_token, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(comparisonId, session.user.id, shareToken, expiresAt.toISOString());

    return NextResponse.json({
      shareToken,
      expiresAt: expiresAt.toISOString(),
      message: 'Share link created successfully',
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}
