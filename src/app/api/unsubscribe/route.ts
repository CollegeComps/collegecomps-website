// API route for unsubscribing from emails
import { NextRequest, NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db-helper';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user');

    if (!userId) {
      return NextResponse.redirect(new URL('/unsubscribe?error=invalid', request.url));
    }

    const usersDb = getUsersDb();
    
    if (!usersDb) {
      return NextResponse.redirect(new URL('/unsubscribe?error=server', request.url));
    }

    // Update email preferences to unsubscribe from all
    usersDb.prepare(`
      UPDATE users 
      SET email_preferences = '{"marketing":false,"productUpdates":false,"weeklyDigest":false}',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(userId);

    console.log(`📧 User ${userId} unsubscribed from all emails`);

    return NextResponse.redirect(new URL('/unsubscribe?success=true', request.url));

  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.redirect(new URL('/unsubscribe?error=server', request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, preferences } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const usersDb = getUsersDb();
    
    if (!usersDb) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 500 }
      );
    }

    // Update specific email preferences
    usersDb.prepare(`
      UPDATE users 
      SET email_preferences = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(preferences), userId);

    console.log(`📧 User ${userId} updated email preferences:`, preferences);

    return NextResponse.json(
      { message: 'Preferences updated successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
