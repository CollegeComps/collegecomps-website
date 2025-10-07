import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import Database from 'better-sqlite3'

const db = new Database('data/users.db')

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)

    const submissions = db.prepare(`
      SELECT 
        id,
        institution_name,
        major,
        degree_level,
        graduation_year,
        current_salary,
        total_compensation,
        job_title,
        company_name,
        years_since_graduation,
        created_at,
        is_approved,
        moderation_status
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
