# CollegeComps Web App

Internal repository for the CollegeComps web application.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Turso (libSQL) - 2 databases
- NextAuth.js
- Tailwind CSS
- Recharts
- Vercel

## Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   ├── auth/                # Auth pages (signin, signup, reset)
│   ├── roi-calculator/      # Main ROI tool
│   ├── colleges/            # College explorer
│   ├── compare/             # Compare colleges
│   ├── historical-trends/   # Trends & predictions
│   ├── salary-insights/     # Premium salary data
│   ├── profile/             # User dashboard
│   └── pricing/             # Pricing page
├── components/              # React components
└── lib/                     # Utils, DB client, auth config

database/                    # SQL schemas
public/                      # Static assets
```

## Local Setup

1. Clone and install:
   ```bash
   npm install
   ```

2. Get env vars from Vercel or another engineer, create `.env.local`:
   ```env
   DATABASE_URL=
   DATABASE_AUTH_TOKEN=
   USERS_DATABASE_URL=
   USERS_DATABASE_AUTH_TOKEN=
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=
   RESEND_API_KEY=
   EMAIL_FROM=noreply@collegecomps.com
   
   # OAuth Providers
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GITHUB_CLIENT_ID=
   GITHUB_CLIENT_SECRET=
   LINKEDIN_CLIENT_ID=
   LINKEDIN_CLIENT_SECRET=
   FACEBOOK_CLIENT_ID=
   FACEBOOK_CLIENT_SECRET=
   TWITTER_CLIENT_ID=
   TWITTER_CLIENT_SECRET=
   
   # Stripe (different keys for dev/prod)
   STRIPE_SECRET_KEY=
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   STRIPE_WEBHOOK_SECRET=
   STRIPE_PREMIUM_MONTHLY_PRICE_ID=
   STRIPE_PREMIUM_ANNUAL_PRICE_ID=
   ```

3. Run dev server:
   ```bash
   npm run dev
   ```

## Databases

Two Turso (libSQL) databases:

1. **collegecomps** - College data (institutions, programs, financial, academic)
2. **users** - User accounts, subscriptions, saved scenarios

## Deployment

Auto-deploys to Vercel on push to `main`.

Production: https://www.collegecomps.com
