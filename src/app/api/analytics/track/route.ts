import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import Database from 'better-sqlite3'

const db = new Database('data/users.db')

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { eventType, eventData, pageUrl } = await req.json()

    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      )
    }

    // Track the event
    db.prepare(`
      INSERT INTO user_analytics (user_id, event_type, event_data, page_url, session_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      parseInt(session.user.id),
      eventType,
      eventData ? JSON.stringify(eventData) : null,
      pageUrl || null,
      session.user.id // Using user ID as session identifier for now
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
