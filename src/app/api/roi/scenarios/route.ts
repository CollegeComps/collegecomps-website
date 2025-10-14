import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUsersDb } from '@/lib/db-helper';

export const dynamic = 'force-dynamic';

// GET /api/roi/scenarios - Get all ROI scenarios for the user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersDb = getUsersDb();
    if (!usersDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    // Get user ID
    const user = await usersDb.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).get(session.user.email) as { id: number } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all ROI scenarios
    const query = includeDrafts
      ? 'SELECT * FROM roi_scenarios WHERE user_id = ? ORDER BY updated_at DESC'
      : 'SELECT * FROM roi_scenarios WHERE user_id = ? AND is_draft = 0 ORDER BY updated_at DESC';
    
    const scenarios = await usersDb.prepare(query).all(user.id);

    return NextResponse.json({ scenarios });
  } catch (error) {
    console.error('Error fetching ROI scenarios:', error);
    return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 });
  }
}

// POST /api/roi/scenarios - Save a new ROI scenario
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      unitid,
      institution_name,
      scenario_name,
      major,
      degree_level,
      tuition_cost,
      room_board,
      books_supplies,
      other_costs,
      total_cost_per_year,
      years_to_complete,
      scholarship_amount,
      grants_amount,
      work_study,
      loans_amount,
      net_cost_per_year,
      starting_salary,
      salary_growth_rate,
      years_to_calculate,
      total_investment,
      total_lifetime_earnings,
      roi_value,
      roi_percentage,
      break_even_years,
      is_draft = 0
    } = body;

    if (!unitid || !institution_name || !scenario_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const usersDb = getUsersDb();
    if (!usersDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get user ID
    const user = await usersDb.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).get(session.user.email) as { id: number } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Insert scenario
    const result = await usersDb.prepare(`
      INSERT INTO roi_scenarios (
        user_id, unitid, institution_name, scenario_name, major, degree_level,
        tuition_cost, room_board, books_supplies, other_costs, total_cost_per_year, years_to_complete,
        scholarship_amount, grants_amount, work_study, loans_amount, net_cost_per_year,
        starting_salary, salary_growth_rate, years_to_calculate,
        total_investment, total_lifetime_earnings, roi_value, roi_percentage, break_even_years,
        is_draft
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id, unitid, institution_name, scenario_name, major, degree_level,
      tuition_cost, room_board, books_supplies, other_costs, total_cost_per_year, years_to_complete,
      scholarship_amount, grants_amount, work_study, loans_amount, net_cost_per_year,
      starting_salary, salary_growth_rate, years_to_calculate,
      total_investment, total_lifetime_earnings, roi_value, roi_percentage, break_even_years,
      is_draft
    );

    return NextResponse.json({ 
      success: true,
      message: is_draft ? 'Draft saved' : 'Scenario saved successfully',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error saving ROI scenario:', error);
    return NextResponse.json({ error: 'Failed to save scenario' }, { status: 500 });
  }
}

// DELETE /api/roi/scenarios?id=123 - Delete an ROI scenario
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing scenario ID' }, { status: 400 });
    }

    const usersDb = getUsersDb();
    if (!usersDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get user ID
    const user = await usersDb.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).get(session.user.email) as { id: number } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete scenario (only if owned by user)
    await usersDb.prepare(`
      DELETE FROM roi_scenarios 
      WHERE id = ? AND user_id = ?
    `).run(parseInt(id), user.id);

    return NextResponse.json({ 
      success: true,
      message: 'Scenario deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ROI scenario:', error);
    return NextResponse.json({ error: 'Failed to delete scenario' }, { status: 500 });
  }
}

// PUT /api/roi/scenarios?id=123 - Update an ROI scenario
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing scenario ID' }, { status: 400 });
    }

    const body = await request.json();
    const { scenario_name, is_draft } = body;

    const usersDb = getUsersDb();
    if (!usersDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get user ID
    const user = await usersDb.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).get(session.user.email) as { id: number } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update scenario (only if owned by user)
    await usersDb.prepare(`
      UPDATE roi_scenarios 
      SET scenario_name = ?, is_draft = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(scenario_name, is_draft, parseInt(id), user.id);

    return NextResponse.json({ 
      success: true,
      message: 'Scenario updated successfully'
    });
  } catch (error) {
    console.error('Error updating ROI scenario:', error);
    return NextResponse.json({ error: 'Failed to update scenario' }, { status: 500 });
  }
}
