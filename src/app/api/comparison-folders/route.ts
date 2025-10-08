import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUsersDb } from '@/lib/db-helper'

// Helper to initialize table
function initTable(db: any) {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS comparison_folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#3B82F6',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
  
  initTable(db);

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.subscriptionTier !== 'premium') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    const folders = await db.prepare(`
      SELECT 
        f.id,
        f.name,
        f.color,
        f.created_at,
        COUNT(sc.id) as comparison_count
      FROM comparison_folders f
      LEFT JOIN saved_comparisons sc ON sc.folder_id = f.id
      WHERE f.user_id = ?
      GROUP BY f.id
      ORDER BY f.created_at DESC
    `).all(session.user.id);

    return NextResponse.json({ folders });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
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
    const { name, color = '#3B82F6' } = body;

    if (!name) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const result = await db.prepare(`
      INSERT INTO comparison_folders (user_id, name, color)
      VALUES (?, ?, ?)
    `).run(session.user.id, name, color);

    return NextResponse.json({
      id: result.lastInsertRowid,
      message: 'Folder created successfully',
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('id');

    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    // Verify folder belongs to user
    const folder = await db.prepare(`
      SELECT id FROM comparison_folders
      WHERE id = ? AND user_id = ?
    `).get(folderId, session.user.id);

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Move comparisons out of folder before deleting
    await db.prepare(`
      UPDATE saved_comparisons
      SET folder_id = NULL
      WHERE folder_id = ?
    `).run(folderId);

    // Delete folder
    await db.prepare(`
      DELETE FROM comparison_folders
      WHERE id = ?
    `).run(folderId);

    return NextResponse.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
