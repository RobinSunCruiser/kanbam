import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { User } from '@/types/user';

// Mock env and other dependencies so the module can be imported
vi.mock('@/lib/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-that-is-at-least-32-characters-long',
    NODE_ENV: 'test',
  },
}));

// Mock storage/db to avoid database connection at import time
vi.mock('../storage/db', () => ({
  updateUserField: vi.fn(),
}));

// Mock resend to avoid API client initialization
vi.mock('resend', () => ({
  Resend: vi.fn(),
}));

import { canSendVerification } from './send';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test',
    passwordHash: 'hash',
    emailVerified: false,
    lastVerificationSent: null,
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('canSendVerification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true when lastVerificationSent is null', () => {
    expect(canSendVerification(makeUser())).toBe(true);
  });

  it('returns true when more than 10 minutes have passed', () => {
    const user = makeUser({
      lastVerificationSent: '2025-06-15T11:49:00Z', // 11 minutes ago
    });
    expect(canSendVerification(user)).toBe(true);
  });

  it('returns false when less than 10 minutes have passed', () => {
    const user = makeUser({
      lastVerificationSent: '2025-06-15T11:51:00Z', // 9 minutes ago
    });
    expect(canSendVerification(user)).toBe(false);
  });

  it('returns true at exactly 10 minutes', () => {
    const user = makeUser({
      lastVerificationSent: '2025-06-15T11:50:00Z', // exactly 10 minutes ago
    });
    expect(canSendVerification(user)).toBe(true);
  });
});
