import { isValidUid } from './utils/uid';

/**
 * Column title constraints
 */
export const COLUMN_TITLE_MAX_LENGTH = 50;

/**
 * Check if a value is a valid column ID (UUID format)
 */
export function isValidColumnId(value: unknown): value is string {
  return typeof value === 'string' && isValidUid(value);
}

/**
 * Session and cookie configuration
 */
export const SESSION_CONFIG = {
  TOKEN_NAME: 'session',
  TOKEN_EXPIRY: '7d',
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7, // 7 days in seconds
} as const;
