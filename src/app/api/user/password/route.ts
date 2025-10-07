import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const usersDbPath = path.join(process.cwd(), '..', 'college-scrapper', 'data', 'users.db');

export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const db = new Database(usersDbPath);

    // Get current user password
    const user = db
      .prepare('SELECT password FROM users WHERE email = ?')
      .get(session.user.email) as { password: string } | undefined;

    if (!user) {
      db.close();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      db.close();
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, session.user.email);

    db.close();

    return NextResponse.json({ 
      success: true, 
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
