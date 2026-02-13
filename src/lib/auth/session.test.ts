import { describe, it, expect, vi } from 'vitest';

// Mock env module before importing session (env is eagerly evaluated)
vi.mock('@/lib/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-that-is-at-least-32-characters-long',
    NODE_ENV: 'test',
  },
}));

// Mock next/headers (session.ts imports cookies)
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

import { createToken, verifyToken } from './session';
import { SignJWT } from 'jose';

describe('createToken', () => {
  it('returns a JWT string', async () => {
    const token = await createToken('user-123');
    expect(typeof token).toBe('string');
    // JWTs have 3 dot-separated parts
    expect(token.split('.')).toHaveLength(3);
  });
});

describe('verifyToken', () => {
  it('round-trips: create then verify returns userId', async () => {
    const token = await createToken('user-456');
    const result = await verifyToken(token);
    expect(result).toEqual({ userId: 'user-456' });
  });

  it('returns null for invalid tokens', async () => {
    expect(await verifyToken('garbage.token.value')).toBeNull();
  });

  it('returns null for tampered tokens', async () => {
    const token = await createToken('user-789');
    // Tamper with the payload section
    const parts = token.split('.');
    parts[1] = parts[1] + 'x';
    expect(await verifyToken(parts.join('.'))).toBeNull();
  });

  it('rejects tokens with a purpose claim (email tokens)', async () => {
    // Create a token that has a purpose claim, like email tokens do
    const secret = new TextEncoder().encode('test-secret-key-that-is-at-least-32-characters-long');
    const emailToken = await new SignJWT({ userId: 'user-123', purpose: 'verify' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .setIssuedAt()
      .sign(secret);

    expect(await verifyToken(emailToken)).toBeNull();
  });

  it('returns null for tokens missing userId', async () => {
    const secret = new TextEncoder().encode('test-secret-key-that-is-at-least-32-characters-long');
    const token = await new SignJWT({ something: 'else' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .setIssuedAt()
      .sign(secret);

    expect(await verifyToken(token)).toBeNull();
  });
});
