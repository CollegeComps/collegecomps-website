import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import Database from 'better-sqlite3';

const db = new Database('data/users.db');

// Add folder_id and tags columns if they don't exist
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
