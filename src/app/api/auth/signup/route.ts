import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'

const db = new Database('data/users.db')

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?')
      .get(email)

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, name, provider)
      VALUES (?, ?, ?, 'credentials')
    `).run(email, passwordHash, name || null)

    return NextResponse.json(
      { 
        success: true,
        message: 'Account created successfully',
        userId: result.lastInsertRowid
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
