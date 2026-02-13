import { describe, it, expect, vi } from 'vitest';

// Mock env module before importing tokens
vi.mock('@/lib/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-that-is-at-least-32-characters-long',
    NODE_ENV: 'test',
  },
}));

import { createEmailToken, verifyEmailToken } from './tokens';

describe('createEmailToken', () => {
  it('returns a JWT string', async () => {
    const token = await createEmailToken('user-1', 'verify');
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });
});

describe('verifyEmailToken', () => {
  it('verifies a "verify" token with correct purpose', async () => {
    const token = await createEmailToken('user-1', 'verify');
    const result = await verifyEmailToken(token, 'verify');
    expect(result).toEqual({ userId: 'user-1' });
  });

  it('verifies a "reset" token with correct purpose', async () => {
    const token = await createEmailToken('user-2', 'reset');
    const result = await verifyEmailToken(token, 'reset');
    expect(result).toEqual({ userId: 'user-2' });
  });

  it('rejects purpose mismatch: verify token checked as reset', async () => {
    const token = await createEmailToken('user-3', 'verify');
    expect(await verifyEmailToken(token, 'reset')).toBeNull();
  });

  it('rejects purpose mismatch: reset token checked as verify', async () => {
    const token = await createEmailToken('user-4', 'reset');
    expect(await verifyEmailToken(token, 'verify')).toBeNull();
  });

  it('returns null for invalid token', async () => {
    expect(await verifyEmailToken('invalid.token.here', 'verify')).toBeNull();
  });

  it('returns null for tampered token', async () => {
    const token = await createEmailToken('user-5', 'verify');
    const parts = token.split('.');
    parts[1] = parts[1] + 'tampered';
    expect(await verifyEmailToken(parts.join('.'), 'verify')).toBeNull();
  });
});
