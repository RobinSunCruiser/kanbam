import { neon } from '@neondatabase/serverless';

// Get database connection string from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create base database client
const baseSql = neon(DATABASE_URL);

// Track initialization state
let isInitialized = false;
let initPromise: Promise<void> | null = null;

// Initialize database schema
async function initSchema(): Promise<void> {
  try {
    // Create users table
    await baseSql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await baseSql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;

    // Create boards table
    await baseSql`
      CREATE TABLE IF NOT EXISTS boards (
        uid TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await baseSql`CREATE INDEX IF NOT EXISTS idx_boards_members ON boards USING GIN ((data->'members'))`;
    await baseSql`CREATE INDEX IF NOT EXISTS idx_boards_owner ON boards(owner_id)`;

    console.log('✅ Database schema initialized');
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}

// Ensure database is initialized (called before any query)
async function ensureInitialized(): Promise<void> {
  if (isInitialized) return;

  if (!initPromise) {
    initPromise = initSchema();
  }

  await initPromise;
}

// Wrap the sql client to automatically ensure initialization before queries
export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  await ensureInitialized();
  return baseSql(strings, ...values);
};
