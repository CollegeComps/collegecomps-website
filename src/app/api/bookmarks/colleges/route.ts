import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUsersDb } from '@/lib/db-helper';

export const dynamic = 'force-dynamic';

// GET /api/bookmarks/colleges - Get all bookmarked colleges for the user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersDb = getUsersDb();
    if (!usersDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get user ID
    const user = await usersDb.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).get(session.user.email) as { id: number } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all bookmarked colleges
    const bookmarks = await usersDb.prepare(`
      SELECT 
        bc.id,
        bc.unitid,
        bc.institution_name,
        bc.city,
        bc.state,
        bc.control,
        bc.notes,
        bc.tags,
        bc.bookmarked_at
      FROM bookmarked_colleges bc
      WHERE bc.user_id = ?
      ORDER BY bc.bookmarked_at DESC
    `).all(user.id);

    return NextResponse.json({ 
      bookmarks: bookmarks.map((b: any) => ({
        ...b,
        tags: JSON.parse(b.tags || '[]')
      }))
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

// POST /api/bookmarks/colleges - Add or remove a bookmark
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { unitid, action, institution_name, city, state, control } = body;

    if (!unitid || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action !== 'add' && action !== 'remove') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const usersDb = getUsersDb();
    if (!usersDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get user ID
    const user = await usersDb.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).get(session.user.email) as { id: number } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'add') {
      // Add bookmark
      try {
        await usersDb.prepare(`
          INSERT INTO bookmarked_colleges (user_id, unitid, institution_name, city, state, control)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(user.id, unitid, institution_name, city, state, control);

        return NextResponse.json({ 
          success: true, 
          message: 'College bookmarked successfully' 
        });
      } catch (error: any) {
        // Check if it's a duplicate error
        if (error.message?.includes('UNIQUE constraint failed')) {
          return NextResponse.json({ 
            error: 'College already bookmarked' 
          }, { status: 409 });
        }
        throw error;
      }
    } else {
      // Remove bookmark
      await usersDb.prepare(`
        DELETE FROM bookmarked_colleges 
        WHERE user_id = ? AND unitid = ?
      `).run(user.id, unitid);

      return NextResponse.json({ 
        success: true, 
        message: 'Bookmark removed successfully' 
      });
    }
  } catch (error) {
    console.error('Error managing bookmark:', error);
    return NextResponse.json({ error: 'Failed to manage bookmark' }, { status: 500 });
  }
}
