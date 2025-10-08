import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

import { getUsersDb } from '@/lib/db-helper'


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

    const submissions = await db.prepare(`
      SELECT 
        id,
        institution_name,
        major,
        degree_level,
        graduation_year,
        current_salary,
        total_compensation,
        job_title,
        industry,
        location_city,
        location_state,
        years_since_graduation,
        created_at,
        is_approved,
        is_public
      FROM salary_submissions
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId)

    return NextResponse.json({
      submissions,
      count: submissions.length
    })
  } catch (error) {
    console.error('Error fetching salary submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
