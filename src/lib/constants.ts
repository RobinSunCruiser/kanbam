import { ColumnType } from '@/types/board';

/**
 * Valid column IDs for the Kanban board
 * These are the only allowed values for card placement
 */
export const COLUMN_IDS: readonly ColumnType[] = ['todo', 'in-progress', 'done'] as const;

/**
 * Column display configuration
 * Maps column IDs to their display titles
 */
export const COLUMN_CONFIG: Record<ColumnType, { title: string; order: number }> = {
  'todo': { title: 'To Do', order: 0 },
  'in-progress': { title: 'In Progress', order: 1 },
  'done': { title: 'Done', order: 2 },
};

/**
 * Check if a value is a valid column ID
 */
export function isValidColumnId(value: unknown): value is ColumnType {
  return typeof value === 'string' && COLUMN_IDS.includes(value as ColumnType);
}

/**
 * Session and cookie configuration
 */
export const SESSION_CONFIG = {
  TOKEN_NAME: 'session',
  TOKEN_EXPIRY: '7d',
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7, // 7 days in seconds
} as const;
