import { neon } from '@neondatabase/serverless';
import { env } from '../env';

// Get database connection string from validated environment
const DATABASE_URL = env.DATABASE_URL;

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
        email_verified BOOLEAN NOT NULL DEFAULT false,
        last_verification_sent TIMESTAMPTZ,
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
const sql = async (strings: TemplateStringsArray, ...values: (string | number | boolean | null)[]) => {
  await ensureInitialized();
  return baseSql(strings, ...values);
};

// ============================================================================
// USER QUERIES - Data access layer for users table
// ============================================================================

/** Query user by ID - returns raw database row or null */
export async function queryUserById(id: string) {
  const result = await sql`
    SELECT id, email, name, password_hash as "passwordHash",
           email_verified as "emailVerified",
           last_verification_sent as "lastVerificationSent",
           created_at as "createdAt"
    FROM users
    WHERE id = ${id}
  `;
  return result.length > 0 ? result[0] : null;
}

/** Query user by email (case-insensitive) - returns raw database row or null */
export async function queryUserByEmail(email: string) {
  const result = await sql`
    SELECT id, email, name, password_hash as "passwordHash",
           email_verified as "emailVerified",
           last_verification_sent as "lastVerificationSent",
           created_at as "createdAt"
    FROM users
    WHERE LOWER(email) = LOWER(${email})
  `;
  return result.length > 0 ? result[0] : null;
}

/** Insert new user into database */
export async function insertUser(
  id: string,
  email: string,
  name: string,
  passwordHash: string,
  createdAt: string
): Promise<void> {
  await sql`
    INSERT INTO users (id, email, name, password_hash, created_at)
    VALUES (${id}, ${email}, ${name}, ${passwordHash}, ${createdAt})
  `;
}

/** Update specific user field */
export async function updateUserField(
  id: string,
  field: 'name' | 'email' | 'password_hash' | 'email_verified' | 'last_verification_sent',
  value: string | boolean
): Promise<void> {
  if (field === 'password_hash') {
    await sql`UPDATE users SET password_hash = ${value as string} WHERE id = ${id}`;
  } else if (field === 'email') {
    await sql`UPDATE users SET email = ${value as string} WHERE id = ${id}`;
  } else if (field === 'name') {
    await sql`UPDATE users SET name = ${value as string} WHERE id = ${id}`;
  } else if (field === 'email_verified') {
    await sql`UPDATE users SET email_verified = ${value as boolean} WHERE id = ${id}`;
  } else if (field === 'last_verification_sent') {
    await sql`UPDATE users SET last_verification_sent = ${value as string} WHERE id = ${id}`;
  }
}

/** Delete user by ID - returns true if deleted */
export async function deleteUserById(id: string): Promise<boolean> {
  const result = await sql`DELETE FROM users WHERE id = ${id} RETURNING id`;
  return result.length > 0;
}

// ============================================================================
// BOARD QUERIES - Data access layer for boards table
// ============================================================================

/** Query board by UID - returns raw database row or null */
export async function queryBoardByUid(uid: string) {
  const result = await sql`
    SELECT uid, title, owner_id as "ownerId", data, created_at as "createdAt", updated_at as "updatedAt"
    FROM boards
    WHERE uid = ${uid}
  `;
  return result.length > 0 ? result[0] : null;
}

/** Query all boards where user is a member - returns raw database rows */
export async function queryBoardsByMemberEmail(email: string) {
  const result = await sql`
    SELECT uid, title, owner_id as "ownerId", data, created_at as "createdAt", updated_at as "updatedAt"
    FROM boards
    WHERE data->'members' @> ${JSON.stringify([{ email: email.toLowerCase() }])}::jsonb
  `;
  return result;
}

/** Insert or update board (upsert) - stores entire board data as JSONB */
export async function upsertBoard(
  uid: string,
  title: string,
  ownerId: string,
  data: object,
  createdAt: string,
  updatedAt: string
): Promise<void> {
  await sql`
    INSERT INTO boards (uid, title, owner_id, data, created_at, updated_at)
    VALUES (${uid}, ${title}, ${ownerId}, ${JSON.stringify(data)}, ${createdAt}, ${updatedAt})
    ON CONFLICT (uid)
    DO UPDATE SET
      title = EXCLUDED.title,
      data = EXCLUDED.data,
      updated_at = EXCLUDED.updated_at
  `;
}

/** Delete board by UID - returns true if deleted, false if not found */
export async function deleteBoardByUid(uid: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM boards
    WHERE uid = ${uid}
    RETURNING uid
  `;
  return result.length > 0;
}

/** Check if board exists by UID */
export async function boardExists(uid: string): Promise<boolean> {
  const result = await sql`
    SELECT 1 FROM boards WHERE uid = ${uid}
  `;
  return result.length > 0;
}
