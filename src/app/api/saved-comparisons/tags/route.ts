import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import Database from 'better-sqlite3';

const db = new Database('data/users.db');

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.subscriptionTier !== 'premium') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    const body = await req.json();
    const { comparisonId, tag } = body;

    if (!comparisonId || !tag) {
      return NextResponse.json({ error: 'Comparison ID and tag are required' }, { status: 400 });
    }

    // Verify comparison belongs to user
    const comparison = db.prepare(`
      SELECT id, tags FROM saved_comparisons
      WHERE id = ? AND user_id = ?
    `).get(comparisonId, session.user.id) as { id: number; tags: string } | undefined;

    if (!comparison) {
      return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
    }

    // Parse existing tags
    const existingTags = JSON.parse(comparison.tags || '[]');
    
    // Add new tag if not already present
    if (!existingTags.includes(tag)) {
      existingTags.push(tag);
      
      db.prepare(`
        UPDATE saved_comparisons
        SET tags = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(JSON.stringify(existingTags), comparisonId);
    }

    return NextResponse.json({ 
      message: 'Tag added successfully',
      tags: existingTags,
    });
  } catch (error) {
    console.error('Error adding tag:', error);
    return NextResponse.json(
      { error: 'Failed to add tag' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.subscriptionTier !== 'premium') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const comparisonId = searchParams.get('comparisonId');
    const tag = searchParams.get('tag');

    if (!comparisonId || !tag) {
      return NextResponse.json({ error: 'Comparison ID and tag are required' }, { status: 400 });
    }

    // Verify comparison belongs to user
    const comparison = db.prepare(`
      SELECT id, tags FROM saved_comparisons
      WHERE id = ? AND user_id = ?
    `).get(comparisonId, session.user.id) as { id: number; tags: string } | undefined;

    if (!comparison) {
      return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
    }

    // Parse and remove tag
    const existingTags = JSON.parse(comparison.tags || '[]');
    const updatedTags = existingTags.filter((t: string) => t !== tag);
    
    db.prepare(`
      UPDATE saved_comparisons
      SET tags = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(updatedTags), comparisonId);

    return NextResponse.json({ 
      message: 'Tag removed successfully',
      tags: updatedTags,
    });
  } catch (error) {
    console.error('Error removing tag:', error);
    return NextResponse.json(
      { error: 'Failed to remove tag' },
      { status: 500 }
    );
  }
}
