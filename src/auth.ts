import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import LinkedIn from "next-auth/providers/linkedin"
import Facebook from "next-auth/providers/facebook"
import Twitter from "next-auth/providers/twitter"
import bcrypt from 'bcryptjs'
import { User } from "next-auth"
import { getUsersDb } from './lib/db-helper'

interface DbUser {
  id: number
  email: string
  password_hash: string | null
  name: string | null
  subscription_tier: string
  email_verified: number
  created_at: string
  updated_at: string
}

// Build providers array conditionally based on environment variables
const providers: any[] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      console.log('[Auth] Credentials authorize called for:', credentials?.email);
      
      if (!credentials?.email || !credentials?.password) {
        console.log('[Auth] Missing email or password');
        return null
      }
      
      const db = getUsersDb();
      if (!db) {
        console.error('[Auth] Database unavailable during authorization');
        return null;
      }

      const user = await db.prepare('SELECT * FROM users WHERE email = ?')
        .get(credentials.email) as DbUser | undefined

      if (!user) {
        console.log('[Auth] User not found:', credentials.email);
        return null
      }
      
      if (!user.password_hash) {
        console.log('[Auth] User has no password (OAuth user):', credentials.email);
        return null
      }

      const isValid = await bcrypt.compare(
        credentials.password as string,
        user.password_hash
      )

      if (!isValid) {
        console.log('[Auth] Invalid password for:', credentials.email);
        return null
      }

      console.log('[Auth] User authenticated successfully:', {
        id: user.id,
        email: user.email,
        tier: user.subscription_tier
      });

      return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscription_tier,
        subscriptionStatus: 'active' // Default to active since column doesn't exist
      }
    }
  })
];

// Only add OAuth providers if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code"
      },
    },
  }));
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(GitHub({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }));
}

if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  providers.push(LinkedIn({
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  }));
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(Facebook({
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  }));
}

if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
  providers.push(Twitter({
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
  }));
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers,
  basePath: "/api/auth",
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account && account.provider !== 'credentials') {
        // Ensure we have user email for OAuth sign in
        if (!user?.email) {
          console.error('OAuth sign in failed: no email provided');
          return false;
        }

        const db = getUsersDb();
        if (!db) {
          console.error('Database unavailable during OAuth sign in');
          return false;
        }
        
        try {
          // Handle OAuth sign in - check if user already exists
          const existingUser = await db.prepare('SELECT * FROM users WHERE email = ?')
            .get(user.email) as DbUser | undefined

          if (!existingUser) {
            // Create new user for OAuth (no password needed, email verified by OAuth provider)
            await db.prepare(`
              INSERT INTO users (email, name, email_verified)
              VALUES (?, ?, 1)
            `).run(user.email, user.name || null)
          } else {
            // User exists - just update email_verified if not set
            if (!existingUser.email_verified) {
              await db.prepare(`
                UPDATE users SET email_verified = 1 WHERE email = ?
              `).run(user.email)
            }
          }
        } catch (error) {
          console.error('Error during OAuth sign in:', error);
          return false;
        }
      }
      return true
    },
    async jwt({ token, user, account, trigger }) {
      // On initial signin, user object is provided from authorize()
      if (user) {
        console.log('[Auth] JWT callback - initial signin for:', user.email);
        
        // For credentials provider, user already has all needed data from authorize()
        if (account?.provider === 'credentials') {
          token.subscriptionTier = (user as any).subscriptionTier || 'free'
          token.subscriptionStatus = (user as any).subscriptionStatus || 'active'
          token.userId = user.id
          token.email = user.email
          
          console.log('[Auth] JWT token populated from credentials:', {
            userId: token.userId,
            email: token.email,
            tier: token.subscriptionTier
          });
        } else if (user.email) {
          // For OAuth providers, query database to get subscription info
          const db = getUsersDb();
          if (!db) {
            console.error('[Auth] Database unavailable during JWT creation');
            return token;
          }
          
          try {
            const dbUser = await db.prepare('SELECT * FROM users WHERE email = ?')
              .get(user.email) as DbUser | undefined
            
            if (dbUser) {
              token.subscriptionTier = dbUser.subscription_tier
              token.subscriptionStatus = 'active'
              token.userId = dbUser.id.toString()
              token.email = dbUser.email
              
              console.log('[Auth] JWT token populated from OAuth:', {
                userId: token.userId,
                email: token.email,
                tier: token.subscriptionTier
              });
            } else {
              console.error('[Auth] User not found in database during JWT creation:', user.email);
            }
          } catch (error) {
            console.error('[Auth] Error during JWT creation:', error);
          }
        }
      }
      // On subsequent requests, token already has all needed data
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.subscriptionTier = token.subscriptionTier || 'free'
        session.user.subscriptionStatus = token.subscriptionStatus || 'active'
        session.user.id = token.userId || ''
        session.user.email = token.email || session.user.email
        
        console.log('[Auth] Session created for:', {
          id: session.user.id,
          email: session.user.email,
          tier: session.user.subscriptionTier
        });
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
