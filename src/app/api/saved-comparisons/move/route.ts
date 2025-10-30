import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUsersDb } from '@/lib/db-helper'

// Helper to add columns if they don't exist
function ensureColumns(db: any) {
  try {
    db.exec(`ALTER TABLE saved_comparisons ADD COLUMN folder_id INTEGER`);
  } catch (e) {
    // Column already exists
  }

  try {
    db.exec(`ALTER TABLE saved_comparisons ADD COLUMN tags TEXT DEFAULT '[]'`);
  } catch (e) {
    // Column already exists
  }
}

export async function POST(req: NextRequest) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
  
  ensureColumns(db);

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.subscriptionTier !== 'premium') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    const body = await req.json();
    const { comparisonId, folderId } = body;

    if (!comparisonId) {
      return NextResponse.json({ error: 'Comparison ID is required' }, { status: 400 });
    }

    // Verify comparison belongs to user
    const comparison = db.prepare(`
      SELECT id FROM saved_comparisons
      WHERE id = ? AND user_id = ?
    `).get(comparisonId, session.user.id);

    if (!comparison) {
      return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
    }

    // Update folder
    db.prepare(`
      UPDATE saved_comparisons
      SET folder_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(folderId || null, comparisonId);

    return NextResponse.json({ message: 'Comparison moved successfully' });
  } catch (error) {
    console.error('Error moving comparison:', error);
    return NextResponse.json(
      { error: 'Failed to move comparison' },
      { status: 500 }
    );
  }
}
