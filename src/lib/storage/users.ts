import fs from 'fs/promises';
import lockfile from 'proper-lockfile';
import { User, UsersDatabase } from '@/types/user';
import { USERS_FILE, DATA_DIR } from './paths';
import { NotFoundError } from '../utils/errors';
import { generateUserId } from '../utils/uid';

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore error
  }
}

export async function loadUsers(): Promise<UsersDatabase> {
  await ensureDataDir();

  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty database
      const emptyDb: UsersDatabase = { users: [] };
      await saveUsers(emptyDb);
      return emptyDb;
    }
    throw error;
  }
}

export async function saveUsers(db: UsersDatabase): Promise<void> {
  await ensureDataDir();

  const tempFile = `${USERS_FILE}.tmp`;
  const data = JSON.stringify(db, null, 2);

  // Use file locking to prevent concurrent writes
  let release: (() => Promise<void>) | null = null;

  try {
    // Create file if it doesn't exist
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, '{"users":[]}');
    }

    release = await lockfile.lock(USERS_FILE, { retries: 10 });

    // Atomic write: write to temp file, then rename
    await fs.writeFile(tempFile, data, 'utf-8');
    await fs.rename(tempFile, USERS_FILE);
  } finally {
    if (release) {
      await release();
    }
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await loadUsers();
  return db.users.find(u => u.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await loadUsers();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function createUser(
  userData: Omit<User, 'id' | 'createdAt'>
): Promise<User> {
  const db = await loadUsers();

  // Check if email already exists
  const existing = db.users.find(
    u => u.email.toLowerCase() === userData.email.toLowerCase()
  );
  if (existing) {
    throw new Error('Email already exists');
  }

  const user: User = {
    ...userData,
    id: generateUserId(),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  await saveUsers(db);

  return user;
}

export async function updateUser(
  id: string,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<User> {
  const db = await loadUsers();

  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) {
    throw new NotFoundError('User not found');
  }

  db.users[index] = { ...db.users[index], ...updates };
  await saveUsers(db);

  return db.users[index];
}

export async function addBoardAccess(
  userId: string,
  boardUid: string,
  privilege: 'read' | 'write'
): Promise<void> {
  const user = await getUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check if access already exists
  const existing = user.boardAccess.find(ba => ba.boardUid === boardUid);
  if (existing) {
    // Update existing access
    existing.privilege = privilege;
  } else {
    // Add new access
    user.boardAccess.push({ boardUid, privilege });
  }

  await updateUser(userId, { boardAccess: user.boardAccess });
}

export async function removeBoardAccess(
  userId: string,
  boardUid: string
): Promise<void> {
  const user = await getUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  user.boardAccess = user.boardAccess.filter(ba => ba.boardUid !== boardUid);
  await updateUser(userId, { boardAccess: user.boardAccess });
}

export async function removeAllBoardAccess(boardUid: string): Promise<void> {
  const db = await loadUsers();

  for (const user of db.users) {
    user.boardAccess = user.boardAccess.filter(ba => ba.boardUid !== boardUid);
  }

  await saveUsers(db);
}
