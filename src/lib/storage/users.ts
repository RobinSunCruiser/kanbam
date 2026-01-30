import { User } from '@/types/user';
import { NotFoundError } from '../utils/errors';
import { generateUserId } from '../utils/uid';
import { queryUserById, queryUserByEmail, insertUser, updateUserField } from './db';

/** Retrieve user by ID - returns User object or null if not found */
export async function getUserById(id: string): Promise<User | null> {
  const row = await queryUserById(id);
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
  };
}

/** Retrieve user by email (case-insensitive) - returns User object or null */
export async function getUserByEmail(email: string): Promise<User | null> {
  const row = await queryUserByEmail(email);
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
  };
}

/** Create new user account - throws error if email already exists */
export async function createUser(
  userData: Omit<User, 'id' | 'createdAt'>
): Promise<User> {
  // Validate email is unique
  const existing = await getUserByEmail(userData.email);
  if (existing) {
    throw new Error('Email already exists');
  }

  const id = generateUserId();
  const createdAt = new Date().toISOString();

  await insertUser(id, userData.email, userData.name, userData.passwordHash, createdAt);

  return {
    id,
    email: userData.email,
    name: userData.name,
    passwordHash: userData.passwordHash,
    createdAt,
  };
}

/** Update user fields - throws NotFoundError if user doesn't exist */
export async function updateUser(
  id: string,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<User> {
  const user = await getUserById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Apply updates for each provided field
  if (updates.name) {
    await updateUserField(id, 'name', updates.name);
  }
  if (updates.email) {
    await updateUserField(id, 'email', updates.email);
  }
  if (updates.passwordHash) {
    await updateUserField(id, 'password_hash', updates.passwordHash);
  }

  return (await getUserById(id)) as User;
}
