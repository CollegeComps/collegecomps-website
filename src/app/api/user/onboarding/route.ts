import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

import { getUsersDb } from '@/lib/db-helper'


export async function POST(req: NextRequest) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { intended_major, degree_level, target_schools, expected_graduation_year } = await req.json()

    const userId = parseInt(session.user.id)

    // Check if preferences exist
    const existing = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(userId)

    if (existing) {
      // Update existing preferences
      db.prepare(`
        UPDATE user_preferences
        SET intended_major = ?,
            degree_level = ?,
            target_schools = ?,
            expected_graduation_year = ?,
            onboarding_completed = 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        intended_major,
        degree_level,
        JSON.stringify(target_schools),
        expected_graduation_year,
        userId
      )
    } else {
      // Insert new preferences
      db.prepare(`
        INSERT INTO user_preferences (
          user_id,
          intended_major,
          degree_level,
          target_schools,
          expected_graduation_year,
          onboarding_completed
        ) VALUES (?, ?, ?, ?, ?, 1)
      `).run(
        userId,
        intended_major,
        degree_level,
        JSON.stringify(target_schools),
        expected_graduation_year
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding preferences saved successfully'
    })
  } catch (error) {
    console.error('Error saving onboarding preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    const preferences = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(userId) as any

    if (!preferences) {
      return NextResponse.json({
        onboarding_completed: false,
        preferences: null
      })
    }

    return NextResponse.json({
      onboarding_completed: preferences.onboarding_completed === 1,
      preferences: {
        intended_major: preferences.intended_major,
        target_schools: preferences.target_schools ? JSON.parse(preferences.target_schools) : [],
        expected_graduation_year: preferences.expected_graduation_year,
        preferred_state: preferences.preferred_state,
        max_tuition: preferences.max_tuition,
        preferred_programs: preferences.preferred_programs ? JSON.parse(preferences.preferred_programs) : []
      }
    })
  } catch (error) {
    console.error('Error fetching onboarding status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
