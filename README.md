# CollegeComps ROI Calculator

A Next.js application for analyzing college return on investment (ROI) with comprehensive salary data, college comparisons, and AI-powered recommendations.

## Features

- **ROI Calculator**: Calculate return on investment for different colleges
- **College Comparison**: Compare multiple colleges side-by-side
- **Salary Insights**: Real post-grad salary data from alumni
- **Advanced Analytics**: Premium salary analytics and insights
- **AI Recommendations**: Personalized college recommendations based on your profile
- **Historical Trends**: View historical data and AI-powered predictions
- **Priority Data Access**: Early access to new data releases (Excel tier)
- **Support System**: Priority support with tier-based response times

## Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: SQLite (better-sqlite3)
- **Charts**: Recharts
- **Icons**: Heroicons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with:
   - `NEXTAUTH_SECRET`: Your NextAuth secret
   - `ADMIN_EMAILS`: Comma-separated list of admin emails
   - Other required environment variables

4. Set up the database:
   ```bash
   sqlite3 data/users.db < scripts/setup-user-profiles.sql
   sqlite3 data/users.db < scripts/setup-support-db.sql
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── compare/           # College comparison
│   ├── historical-trends/ # Trends & predictions
│   ├── priority-data/     # Priority data access
│   ├── support/           # Support system
│   └── ...
├── components/            # Reusable components
├── lib/                   # Utility functions
└── types/                 # TypeScript types

data/
├── users.db              # User data and profiles
└── college_data.db       # College information

docs/
└── project-docs/         # Project documentation
```

## Subscription Tiers

1. **Explore (Free)**: Basic access
2. **Advance (Premium)**: $9.99/month - Advanced analytics, exports
3. **Excel (Professional)**: $19.99/month - AI features, priority data, priority support
4. **Enterprise**: Custom pricing - Full access, dedicated support

## Admin Access

To enable admin features, add admin emails to your `.env.local`:

```
ADMIN_EMAILS=admin@example.com,support@example.com
```

Admin users can access:
- `/admin/support` - Support ticket dashboard

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Database Setup

The application uses two SQLite databases:

1. **users.db**: User accounts, profiles, support tickets, saved data
2. **college_data.db**: College information, salary data, trends

SQL setup scripts are in the `scripts/` directory.

## Documentation

Detailed project documentation is available in `/docs/project-docs/`

## License

Proprietary - All rights reserved
