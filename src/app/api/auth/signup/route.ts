import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getUsersDb } from '@/lib/db-helper'
import { sendWelcomeEmail } from '@/lib/email-service'

export async function POST(req: NextRequest) {
  try {
    const db = getUsersDb();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    
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
    const existingUser = await db.prepare('SELECT id, password_hash FROM users WHERE email = ?')
      .get(email) as { id: number, password_hash: string | null } | undefined

    if (existingUser) {
      // Check if account was created via OAuth (no password)
      if (!existingUser.password_hash) {
        return NextResponse.json(
          { 
            error: 'Account already exists with this email via Google/GitHub sign-in. Please sign in using that method or reset your password.',
            oauth: true 
          },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const result = await db.prepare(`
      INSERT INTO users (email, password_hash, name, verification_token, verification_token_expires, email_verified)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(email, passwordHash, name || null, verificationToken, verificationExpires.toISOString())

    const userId = Number(result.lastInsertRowid)

    // Send welcome email with verification link
    try {
      await sendWelcomeEmail(email, name || 'there', verificationToken, userId.toString())
      console.log(`✅ Welcome email sent to ${email}`)
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError)
      // Don't fail signup if email fails - user can verify later
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Account created successfully. Please check your email to verify your account.',
        userId,
        requiresVerification: true
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
