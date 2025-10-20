import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAuth } from '@/lib/auth-helpers';
import { getUsersDb } from '@/lib/db-helper';

export interface UserResponse {
  id?: number;
  user_id: string;
  gpa?: number;
  sat_score?: number;
  act_score?: number;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  parent_income?: number;
  student_income?: number;
  preferred_states?: string; // JSON array
  preferred_major?: string;
  created_at?: string;
  updated_at?: string;
}

// GET - Fetch user's responses
export async function GET(req: NextRequest) {
  const session = await auth();
  const authError = requireAuth(session);
  if (authError) return authError;

  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const userId = (session!.user as any).id;
    
    const result = await db.prepare(
      'SELECT * FROM user_responses WHERE user_id = ?'
    ).get(userId) as any;

    if (!result) {
      return NextResponse.json({ responses: null }, { status: 200 });
    }

    // Parse JSON fields
    const responses: UserResponse = {
      ...result,
      preferred_states: result.preferred_states ? JSON.parse(result.preferred_states) : null
    };

    return NextResponse.json({ responses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user responses' },
      { status: 500 }
    );
  }
}

// POST/PUT - Save or update user's responses
export async function POST(req: NextRequest) {
  const session = await auth();
  const authError = requireAuth(session);
  if (authError) return authError;

  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const userId = (session!.user as any).id;
    const data = await req.json();

    // Validate and prepare data
    const {
      gpa,
      sat_score,
      act_score,
      zip_code,
      latitude,
      longitude,
      parent_income,
      student_income,
      preferred_states,
      preferred_major
    } = data;

    // Convert preferred_states array to JSON string
    const preferredStatesJson = preferred_states 
      ? JSON.stringify(Array.isArray(preferred_states) ? preferred_states : [preferred_states])
      : null;

    // Check if user already has responses
    const existing = await db.prepare(
      'SELECT id FROM user_responses WHERE user_id = ?'
    ).get(userId);

    if (existing) {
      // Update existing responses
      await db.prepare(`
        UPDATE user_responses 
        SET gpa = ?, 
            sat_score = ?, 
            act_score = ?, 
            zip_code = ?, 
            latitude = ?, 
            longitude = ?,
            parent_income = ?, 
            student_income = ?, 
            preferred_states = ?, 
            preferred_major = ?
        WHERE user_id = ?
      `).run(
        gpa || null,
        sat_score || null,
        act_score || null,
        zip_code || null,
        latitude || null,
        longitude || null,
        parent_income || null,
        student_income || null,
        preferredStatesJson,
        preferred_major || null,
        userId
      );

      return NextResponse.json(
        { message: 'Responses updated successfully' },
        { status: 200 }
      );
    } else {
      // Insert new responses
      await db.prepare(`
        INSERT INTO user_responses (
          user_id, gpa, sat_score, act_score, zip_code, 
          latitude, longitude, parent_income, student_income, 
          preferred_states, preferred_major
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        gpa || null,
        sat_score || null,
        act_score || null,
        zip_code || null,
        latitude || null,
        longitude || null,
        parent_income || null,
        student_income || null,
        preferredStatesJson,
        preferred_major || null
      );

      return NextResponse.json(
        { message: 'Responses saved successfully' },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error saving user responses:', error);
    return NextResponse.json(
      { error: 'Failed to save user responses' },
      { status: 500 }
    );
  }
}

// DELETE - Remove user's responses
export async function DELETE(req: NextRequest) {
  const session = await auth();
  const authError = requireAuth(session);
  if (authError) return authError;

  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const userId = (session!.user as any).id;
    
    await db.prepare('DELETE FROM user_responses WHERE user_id = ?').run(userId);

    return NextResponse.json(
      { message: 'Responses deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user responses:', error);
    return NextResponse.json(
      { error: 'Failed to delete user responses' },
      { status: 500 }
    );
  }
}
