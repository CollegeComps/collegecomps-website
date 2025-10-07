import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import Database from 'better-sqlite3';

const db = new Database('data/users.db');

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get saved comparisons count
    const comparisonsResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM saved_comparisons
      WHERE user_id = ?
    `).get(userId) as { count: number };

    // Get exports this month (from shared_comparisons table as proxy)
    const exportsResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM shared_comparisons
      WHERE user_id = ? 
        AND created_at >= date('now', 'start of month')
    `).get(userId) as { count: number } | undefined;

    // Get configured alerts count
    const alertsResult = db.prepare(`
      SELECT preferences
      FROM alert_preferences
      WHERE user_id = ?
    `).get(userId) as { preferences: string } | undefined;

    let alertsConfigured = 0;
    if (alertsResult) {
      try {
        const prefs = JSON.parse(alertsResult.preferences);
        alertsConfigured = prefs.filter((p: any) => p.enabled).length;
      } catch (e) {
        // Invalid JSON, ignore
      }
    }

    // Get folders count
    const foldersResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM comparison_folders
      WHERE user_id = ?
    `).get(userId) as { count: number } | undefined;

    return NextResponse.json({
      saved_comparisons: comparisonsResult.count || 0,
      exports_this_month: exportsResult?.count || 0,
      alerts_configured: alertsConfigured,
      folders_created: foldersResult?.count || 0,
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage stats' },
      { status: 500 }
    );
  }
}
