import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { User } from "next-auth"

const db = new Database('data/users.db')

interface DbUser {
  id: number
  email: string
  password_hash: string | null
  name: string | null
  subscription_tier: string
  subscription_status: string
  subscription_expires_at: string | null
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?')
          .get(credentials.email) as DbUser | undefined

        if (!user || !user.password_hash) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          subscriptionTier: user.subscription_tier,
          subscriptionStatus: user.subscription_status
        }
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account && account.provider !== 'credentials') {
        // Handle OAuth sign in
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?')
          .get(user.email!) as DbUser | undefined

        if (!existingUser) {
          // Create new user
          db.prepare(`
            INSERT INTO users (email, name, provider, provider_account_id)
            VALUES (?, ?, ?, ?)
          `).run(user.email, user.name, account.provider, account.providerAccountId)
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        const dbUser = db.prepare('SELECT * FROM users WHERE email = ?')
          .get(user.email!) as DbUser | undefined
        
        if (dbUser) {
          token.subscriptionTier = dbUser.subscription_tier
          token.subscriptionStatus = dbUser.subscription_status
          token.userId = dbUser.id.toString()
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.subscriptionTier = token.subscriptionTier || 'free'
        session.user.subscriptionStatus = token.subscriptionStatus || 'active'
        session.user.id = token.userId || ''
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})
