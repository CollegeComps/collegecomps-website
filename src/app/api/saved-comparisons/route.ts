import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUsersDb } from '@/lib/db-helper'

export async function GET(req: NextRequest) {
  try {
    const userDb = getUsersDb();
    if (!userDb) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const comparisons = await userDb.prepare(`
      SELECT *
      FROM saved_comparisons
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `).all(parseInt(session.user.id))

    // Parse JSON fields
    const parsedComparisons = comparisons.map((comp: any) => ({
      ...comp,
      colleges: JSON.parse(comp.colleges || '[]'),
      program_data: comp.program_data ? JSON.parse(comp.program_data) : null,
      tags: JSON.parse(comp.tags || '[]'),
      folder_id: comp.folder_id || null
    }))

    return NextResponse.json({ comparisons: parsedComparisons })
  } catch (error) {
    console.error('Error fetching comparisons:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const userDb = getUsersDb();
    if (!userDb) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, colleges, program_data, notes } = await req.json()

    // Check limit for free users
    if (session.user.subscriptionTier === 'free') {
      const count = await userDb.prepare('SELECT COUNT(*) as count FROM saved_comparisons WHERE user_id = ?')
        .get(parseInt(session.user.id)) as { count: number }
      
      if (count.count >= 1) {
        return NextResponse.json(
          { error: 'Free users can only save 1 comparison. Upgrade to Premium for unlimited comparisons.' },
          { status: 403 }
        )
      }
    }

    const result = await userDb.prepare(`
      INSERT INTO saved_comparisons (user_id, name, colleges, program_data, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      parseInt(session.user.id),
      name,
      JSON.stringify(colleges),
      program_data ? JSON.stringify(program_data) : null,
      notes || null
    )

    return NextResponse.json({
      success: true,
      id: Number(result.lastInsertRowid)
    }, { status: 201 })
  } catch (error) {
    console.error('Error saving comparison:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userDb = getUsersDb();
    if (!userDb) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Comparison ID required' },
        { status: 400 }
      )
    }

    // Ensure user owns this comparison
    await userDb.prepare(`
      DELETE FROM saved_comparisons
      WHERE id = ? AND user_id = ?
    `).run(parseInt(id), parseInt(session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comparison:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
