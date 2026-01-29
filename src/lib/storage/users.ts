import { User } from '@/types/user';
import { NotFoundError } from '../utils/errors';
import { generateUserId } from '../utils/uid';
import { sql } from './db';

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email, name, password_hash as "passwordHash", created_at as "createdAt"
    FROM users
    WHERE id = ${id}
  `;

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email, name, password_hash as "passwordHash", created_at as "createdAt"
    FROM users
    WHERE LOWER(email) = LOWER(${email})
  `;

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
  };
}

export async function createUser(
  userData: Omit<User, 'id' | 'createdAt'>
): Promise<User> {
  // Check if email already exists
  const existing = await getUserByEmail(userData.email);
  if (existing) {
    throw new Error('Email already exists');
  }

  const id = generateUserId();
  const createdAt = new Date().toISOString();

  await sql`
    INSERT INTO users (id, email, name, password_hash, created_at)
    VALUES (${id}, ${userData.email}, ${userData.name}, ${userData.passwordHash}, ${createdAt})
  `;

  return {
    id,
    email: userData.email,
    name: userData.name,
    passwordHash: userData.passwordHash,
    createdAt,
  };
}

export async function updateUser(
  id: string,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<User> {
  const user = await getUserById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update fields if provided
  if (updates.name) {
    await sql`UPDATE users SET name = ${updates.name} WHERE id = ${id}`;
  }
  if (updates.email) {
    await sql`UPDATE users SET email = ${updates.email} WHERE id = ${id}`;
  }
  if (updates.passwordHash) {
    await sql`UPDATE users SET password_hash = ${updates.passwordHash} WHERE id = ${id}`;
  }

  return await getUserById(id) as User;
}
