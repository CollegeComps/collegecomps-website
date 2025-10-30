import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import LinkedInProvider from "next-auth/providers/linkedin"
import FacebookProvider from "next-auth/providers/facebook"
import TwitterProvider from "next-auth/providers/twitter"
import bcrypt from 'bcryptjs'
import { getUsersDb } from '@/lib/db-helper'

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

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('[Auth] Credentials authorize called for:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing email or password');
          return null;
        }
        
        const db = getUsersDb();
        if (!db) {
          console.error('[Auth] Database unavailable during authorization');
          return null;
        }

        try {
          const user = await db.prepare('SELECT * FROM users WHERE email = ?')
            .get(credentials.email) as DbUser | undefined;

          if (!user) {
            console.log('[Auth] User not found:', credentials.email);
            return null;
          }
          
          if (!user.password_hash) {
            console.log('[Auth] User has no password (OAuth user):', credentials.email);
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password_hash);

          if (!isValid) {
            console.log('[Auth] Invalid password for:', credentials.email);
            return null;
          }

          console.log('[Auth] User authenticated successfully:', {
            id: user.id,
            email: user.email,
            tier: user.subscription_tier
          });

          // Return user object for NextAuth v4
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            // Custom fields will be added in JWT callback
            subscriptionTier: user.subscription_tier,
            subscriptionStatus: 'active'
          } as any;
        } catch (error) {
          console.error('[Auth] Error during authorization:', error);
          return null;
        }
      }
    }),
    // Google OAuth (if configured)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              prompt: "consent",
              access_type: "offline",
              response_type: "code"
            },
          },
        })]
      : []),
    // GitHub OAuth (if configured)
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [GitHubProvider({
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        })]
      : []),
    // LinkedIn OAuth (if configured)
    ...(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET
      ? [LinkedInProvider({
          clientId: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        })]
      : []),
    // Facebook OAuth (if configured)
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [FacebookProvider({
          clientId: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        })]
      : []),
    // Twitter OAuth (if configured)
    ...(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET
      ? [TwitterProvider({
          clientId: process.env.TWITTER_CLIENT_ID,
          clientSecret: process.env.TWITTER_CLIENT_SECRET,
          version: "2.0", // Twitter OAuth 2.0
        })]
      : []),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow credentials signin
      if (account?.provider === 'credentials') {
        return true;
      }

      // Handle OAuth sign in
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
        const existingUser = await db.prepare('SELECT * FROM users WHERE email = ?')
          .get(user.email) as DbUser | undefined;

        if (!existingUser) {
          // Create new user for OAuth
          await db.prepare(`
            INSERT INTO users (email, name, email_verified)
            VALUES (?, ?, 1)
          `).run(user.email, user.name || null);
          
          console.log('[Auth] Created new OAuth user:', user.email);
        } else {
          // Update email_verified if not set
          if (!existingUser.email_verified) {
            await db.prepare(`
              UPDATE users SET email_verified = 1 WHERE email = ?
            `).run(user.email);
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error during OAuth sign in:', error);
        return false;
      }
    },
    
    async jwt({ token, user, account }) {
      // On initial signin
      if (user) {
        console.log('[Auth] JWT callback - initial signin for:', user.email);
        
        // For credentials provider, user object has subscription data
        if (account?.provider === 'credentials') {
          token.subscriptionTier = (user as any).subscriptionTier || 'free';
          token.subscriptionStatus = (user as any).subscriptionStatus || 'active';
          token.userId = user.id;
          token.email = user.email;
        } else {
          // For OAuth, query database for subscription info
          const db = getUsersDb();
          if (db && user.email) {
            try {
              const dbUser = await db.prepare('SELECT * FROM users WHERE email = ?')
                .get(user.email) as DbUser | undefined;
              
              if (dbUser) {
                token.subscriptionTier = dbUser.subscription_tier;
                token.subscriptionStatus = 'active';
                token.userId = dbUser.id.toString();
                token.email = dbUser.email;
              }
            } catch (error) {
              console.error('[Auth] Error fetching user data for JWT:', error);
            }
          }
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.subscriptionTier = (token.subscriptionTier as string) || 'free';
        session.user.subscriptionStatus = (token.subscriptionStatus as string) || 'active';
      }
      
      return session;
    }
  },
  
  pages: {
    signIn: '/auth/signin',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)
