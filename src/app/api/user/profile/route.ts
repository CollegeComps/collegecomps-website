import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUsersDb } from '@/lib/db-helper';

export async function GET() {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user ID
    const user = await db.prepare('SELECT id FROM users WHERE email = ?').get(session.user.email) as { id: number } | undefined;
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get academic profile
    const profile = await db.prepare(`
      SELECT gpa, sat_score, act_score
      FROM user_profiles
      WHERE user_id = ?
    `).get(user.id);

    return NextResponse.json({ profile: profile || null });
  } catch (error) {
    console.error('Profile fetch error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      error: 'Failed to fetch profile',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, gpa, sat_score, act_score } = data;
    
    // Get user ID
    const user = await db.prepare('SELECT id FROM users WHERE email = ?').get(session.user.email) as { id: number } | undefined;
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user name if provided
    if (name && name.trim().length > 0) {
      await db.prepare('UPDATE users SET name = ? WHERE email = ?').run(name.trim(), session.user.email);
    }

    // Update or insert academic profile if any academic data is provided
    if (gpa || sat_score || act_score) {
      const existing = await db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(user.id);

      if (existing) {
        // Update existing profile
        await db.prepare(`
          UPDATE user_profiles
          SET gpa = COALESCE(?, gpa), 
              sat_score = COALESCE(?, sat_score), 
              act_score = COALESCE(?, act_score)
          WHERE user_id = ?
        `).run(gpa, sat_score, act_score, user.id);
      } else {
        // Create new profile
        await db.prepare(`
          INSERT INTO user_profiles (user_id, gpa, sat_score, act_score)
          VALUES (?, ?, ?, ?)
        `).run(user.id, gpa, sat_score, act_score);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      name: name?.trim()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
