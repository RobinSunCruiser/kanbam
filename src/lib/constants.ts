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
 * Label constraints
 */
export const LABEL_NAME_MAX_LENGTH = 30;

export const LABEL_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
] as const;

/**
 * Timing constants
 */
export const RECONNECT_DELAY_MS = 3000;
export const AUTOSAVE_DEBOUNCE_MS = 1000;
export const SSE_ACTIVE_DURATION_MS = 5 * 60 * 1000; // 5 minutes inactivity timeout

/**
 * DnD activation constraints
 */
export const DND_MOUSE_DISTANCE = 8;
export const DND_TOUCH_DELAY = 300;
export const DND_TOUCH_TOLERANCE = 8;

