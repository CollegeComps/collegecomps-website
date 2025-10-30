# Database Setup Scripts

## Development Database Setup

### Purpose
Creates a separate development database to test subscriptions and user features without affecting production data.

### Quick Start
```bash
# 1. Create dev database in Turso
turso db create collegecomps-users-dev

# 2. Get database credentials
turso db show collegecomps-users-dev
turso db tokens create collegecomps-users-dev

# 3. Add to .env.local
TURSO_DEV_DATABASE_URL=libsql://your-dev-database.turso.io
TURSO_DEV_AUTH_TOKEN=your-dev-token

# 4. Initialize database
npm run setup-dev-db
```

### Test Users
The setup script creates three test accounts:

| Email | Subscription | Password |
|-------|--------------|----------|
| admin@dev.collegecomps.com | premium | DevPassword123! |
| free@dev.collegecomps.com | free | DevPassword123! |
| premium@dev.collegecomps.com | premium | DevPassword123! |

### How It Works
1. **create-dev-database.ts** - Copies production schema and creates test users
   - Reads schema from production database using sqlite_master
   - Creates all tables and indexes in dev database
   - Inserts test users with bcrypt-hashed passwords
   - Uses same password hash for all test accounts for simplicity

2. **db-helper.ts** - Routes to correct database based on environment
   - Development: Uses TURSO_DEV_DATABASE_URL if NODE_ENV=development
   - Production: Uses TURSO_DATABASE_URL
   - Fallback: Local SQLite file if no Turso URL configured

### Environment Variables
```bash
# Production (used in Vercel)
TURSO_DATABASE_URL=libsql://production-db.turso.io
TURSO_AUTH_TOKEN=production-token

# Development (used locally)
TURSO_DEV_DATABASE_URL=libsql://dev-db.turso.io
TURSO_DEV_AUTH_TOKEN=dev-token
NODE_ENV=development
```

### Testing Workflow
1. Set NODE_ENV=development in .env.local
2. Configure TURSO_DEV_DATABASE_URL and TURSO_DEV_AUTH_TOKEN
3. Run `npm run setup-dev-db` to initialize
4. Test subscription changes using test accounts
5. Reset database by re-running setup script if needed

### Safety Features
- Dev database is completely isolated from production
- Test users have .dev email domain
- Script validates environment variables before running
- No production data is ever modified

### Troubleshooting

**Error: "Missing required environment variables"**
- Ensure TURSO_DEV_DATABASE_URL and TURSO_DEV_AUTH_TOKEN are set in .env.local

**Error: "Failed to connect to database"**
- Verify database URL starts with `libsql://`
- Check that auth token is valid
- Ensure database exists: `turso db list`

**Database not using dev version**
- Verify NODE_ENV=development in .env.local
- Check console logs for "Initializing Turso DEV client" message
- Restart development server after changing env vars
