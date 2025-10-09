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

    const { eventType, eventData, pageUrl } = await req.json()

    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      )
    }

    // Track the event
    await db.prepare(`
      INSERT INTO user_analytics (user_id, action, metadata)
      VALUES (?, ?, ?)
    `).run(
      parseInt(session.user.id),
      eventType,
      eventData ? JSON.stringify(eventData) : null
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
