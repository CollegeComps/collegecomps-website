import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import Database from 'better-sqlite3';
import path from 'path';

const usersDbPath = path.join(process.cwd(), 'data', 'users.db');

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = new Database(usersDbPath);
    
    // Get user ID
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(session.user.email) as { id: number } | undefined;
    
    if (!user) {
      db.close();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get academic profile
    const profile = db.prepare(`
      SELECT gpa, sat, act, budget, location_preference, program_interest, career_goals
      FROM user_profiles
      WHERE user_id = ?
    `).get(user.id);

    db.close();

    return NextResponse.json({ profile: profile || null });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, gpa, sat, act, budget, location_preference, program_interest, career_goals } = data;

    const db = new Database(usersDbPath);
    
    // Get user ID
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(session.user.email) as { id: number } | undefined;
    
    if (!user) {
      db.close();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user name if provided
    if (name && name.trim().length > 0) {
      db.prepare('UPDATE users SET name = ? WHERE email = ?').run(name.trim(), session.user.email);
    }

    // Update or insert academic profile if any academic data is provided
    if (gpa || sat || act || budget || location_preference || program_interest || career_goals) {
      const existing = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(user.id);

      if (existing) {
        // Update existing profile
        db.prepare(`
          UPDATE user_profiles
          SET gpa = COALESCE(?, gpa), 
              sat = COALESCE(?, sat), 
              act = COALESCE(?, act), 
              budget = COALESCE(?, budget), 
              location_preference = COALESCE(?, location_preference),
              program_interest = COALESCE(?, program_interest),
              career_goals = COALESCE(?, career_goals),
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `).run(gpa, sat, act, budget, location_preference, program_interest, career_goals, user.id);
      } else {
        // Create new profile
        db.prepare(`
          INSERT INTO user_profiles (user_id, gpa, sat, act, budget, location_preference, program_interest, career_goals)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(user.id, gpa, sat, act, budget, location_preference, program_interest, career_goals);
      }
    }

    db.close();

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
