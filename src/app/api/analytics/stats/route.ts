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

    // Get overall statistics
    const stats = await db.prepare(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT action) as unique_event_types,
        COUNT(DISTINCT DATE(created_at)) as active_days,
        MIN(created_at) as first_activity,
        MAX(created_at) as last_activity
      FROM user_analytics
      WHERE user_id = ?
    `).get(userId)

    // Get event breakdown
    const eventBreakdown = await db.prepare(`
      SELECT 
        action as event_type,
        COUNT(*) as count,
        MAX(created_at) as last_occurrence
      FROM user_analytics
      WHERE user_id = ?
      GROUP BY action
      ORDER BY count DESC
    `).all(userId)

    // Get activity timeline (last 30 days)
    const timeline = await db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as event_count,
        COUNT(DISTINCT action) as event_types
      FROM user_analytics
      WHERE user_id = ? AND created_at >= datetime('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).all(userId)

    // Get recent events
    const recentEvents = await db.prepare(`
      SELECT 
        action as event_type,
        metadata as event_data,
        created_at
      FROM user_analytics
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).all(userId)

    // Parse JSON event data
    const parsedEvents = recentEvents.map((event: any) => ({
      ...event,
      event_data: event.event_data ? JSON.parse(event.event_data) : null
    }))

    // Get user's saved comparisons count
    const comparisons = await db.prepare(`
      SELECT COUNT(*) as count FROM saved_comparisons WHERE user_id = ?
    `).get(userId) as { count: number }

    // Get user's salary submissions count
    const submissions = await db.prepare(`
      SELECT COUNT(*) as count FROM salary_submissions WHERE user_id = ?
    `).get(userId) as { count: number }

    return NextResponse.json({
      stats,
      eventBreakdown,
      timeline,
      recentEvents: parsedEvents,
      savedComparisons: comparisons.count,
      salarySubmissions: submissions.count,
      subscriptionTier: session.user.subscriptionTier || 'free'
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
