import { isValidUid } from './utils/uid';
import type { ReminderOption } from '@/types/board';

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
 * Reminder options for card deadlines (all-day events)
 */
export const REMINDER_OPTIONS = ['0d', '1d', '2d', '3d', '1w', '2w'] as const satisfies readonly ReminderOption[];

/**
 * Session and cookie configuration
 */
export const SESSION_CONFIG = {
  TOKEN_NAME: 'session',
  TOKEN_EXPIRY: '7d',
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7, // 7 days in seconds
} as const;
