import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUsersDb } from '@/lib/db-helper';

export const dynamic = 'force-dynamic';

// GET /api/bookmarks/colleges/check?unitid=123456 - Check if college is bookmarked
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ isBookmarked: false });
    }

    const { searchParams } = new URL(request.url);
    const unitid = searchParams.get('unitid');

    if (!unitid) {
      return NextResponse.json({ error: 'Missing unitid' }, { status: 400 });
    }

    const usersDb = getUsersDb();
    if (!usersDb) {
      return NextResponse.json({ isBookmarked: false });
    }

    // Get user ID
    const user = await usersDb.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).get(session.user.email) as { id: number } | undefined;

    if (!user) {
      return NextResponse.json({ isBookmarked: false });
    }

    // Check if bookmarked
    const bookmark = await usersDb.prepare(`
      SELECT id FROM bookmarked_colleges 
      WHERE user_id = ? AND unitid = ?
    `).get(user.id, parseInt(unitid));

    return NextResponse.json({ 
      isBookmarked: !!bookmark 
    });
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return NextResponse.json({ isBookmarked: false });
  }
}
