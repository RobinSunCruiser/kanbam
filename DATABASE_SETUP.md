# Database Setup Guide

This app uses **Neon Serverless Postgres** for data storage.

## Quick Setup (5 minutes)

### 1. Create Neon Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up (free - no credit card required)
3. Create a new project
4. Copy the connection string

### 2. Set Environment Variable

Add to `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/neondb?sslmode=require"
```

### 3. Run Database Schema

1. Open your Neon project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `src/lib/storage/schema.sql`
4. Click "Run"

### 4. Deploy

The app is now ready to deploy on Vercel!

## Local Development

For local development, you can use the same Neon database or create a separate database for testing.

## Schema

The database has 2 simple tables:

- **users** - Stores user accounts
- **boards** - Stores board data as JSONB (same structure as the JSON files)

## Migration from File Storage

If you had data in the old file-based system, you'll need to manually recreate users and boards after setting up the database. The data structure is the same, just stored in Postgres instead of JSON files.

## Free Tier Limits

Neon free tier includes:
- 512 MB storage
- 1 branch
- Unlimited queries
- Auto-suspend after 5 minutes of inactivity

Perfect for a personal Kanban board app!
