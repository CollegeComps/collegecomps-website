import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
;
import { getUsersDb } from '@/lib/db-helper'



export async function GET(req: NextRequest) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

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
      FROM shared_comparisons sc
      INNER JOIN saved_comparisons scomp ON sc.comparison_id = scomp.id
      WHERE scomp.user_id = ? 
        AND sc.created_at >= date('now', 'start of month')
    `).get(userId) as { count: number } | undefined;

    // Get configured alerts count
    const alertsResult = db.prepare(`
      SELECT price_changes, new_salary_data, admission_updates, 
             deadline_reminders, email_notifications, sms_notifications
      FROM alert_preferences
      WHERE user_id = ?
    `).get(userId) as {
      price_changes: number;
      new_salary_data: number;
      admission_updates: number;
      deadline_reminders: number;
      email_notifications: number;
      sms_notifications: number;
    } | undefined;

    let alertsConfigured = 0;
    if (alertsResult) {
      // Count how many alert types are enabled (value = 1)
      alertsConfigured = [
        alertsResult.price_changes,
        alertsResult.new_salary_data,
        alertsResult.admission_updates,
        alertsResult.deadline_reminders,
        alertsResult.email_notifications,
        alertsResult.sms_notifications,
      ].filter(val => val === 1).length;
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
