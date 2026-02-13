import { describe, it, expect } from 'vitest';
import { generateUid, isValidUid } from './uid';

describe('generateUid', () => {
  it('returns a 16-character string', () => {
    const uid = generateUid();
    expect(uid).toHaveLength(16);
  });

  it('contains only URL-safe characters', () => {
    const uid = generateUid();
    expect(uid).toMatch(/^[a-zA-Z0-9_-]+$/);
  });

  it('produces unique values across multiple calls', () => {
    const uids = new Set(Array.from({ length: 100 }, () => generateUid()));
    expect(uids.size).toBe(100);
  });
});

describe('isValidUid', () => {
  it('accepts a standard nanoid', () => {
    expect(isValidUid(generateUid())).toBe(true);
  });

  it('accepts alphanumeric strings', () => {
    expect(isValidUid('abc123')).toBe(true);
  });

  it('accepts dashes and underscores', () => {
    expect(isValidUid('a-b_c')).toBe(true);
  });

  it('accepts a 64-character string (max length)', () => {
    expect(isValidUid('a'.repeat(64))).toBe(true);
  });

  it('rejects empty string', () => {
    expect(isValidUid('')).toBe(false);
  });

  it('rejects strings longer than 64 characters', () => {
    expect(isValidUid('a'.repeat(65))).toBe(false);
  });

  it('rejects special characters', () => {
    expect(isValidUid('abc!@#')).toBe(false);
    expect(isValidUid('hello world')).toBe(false);
    expect(isValidUid('foo.bar')).toBe(false);
  });
});
