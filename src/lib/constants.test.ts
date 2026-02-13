import { describe, it, expect } from 'vitest';
import {
  isValidColumnId,
  COLUMN_TITLE_MAX_LENGTH,
  RECONNECT_DELAY_MS,
  AUTOSAVE_DEBOUNCE_MS,
  DND_MOUSE_DISTANCE,
  DND_TOUCH_DELAY,
  DND_TOUCH_TOLERANCE,
  REMINDER_OPTIONS,
} from './constants';

describe('isValidColumnId', () => {
  it('accepts valid UID strings', () => {
    expect(isValidColumnId('abc123')).toBe(true);
    expect(isValidColumnId('a-b_c')).toBe(true);
  });

  it('rejects non-string values', () => {
    expect(isValidColumnId(123)).toBe(false);
    expect(isValidColumnId(null)).toBe(false);
    expect(isValidColumnId(undefined)).toBe(false);
    expect(isValidColumnId({})).toBe(false);
    expect(isValidColumnId(true)).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidColumnId('')).toBe(false);
  });

  it('rejects strings longer than 64 characters', () => {
    expect(isValidColumnId('a'.repeat(65))).toBe(false);
  });

  it('rejects strings with special characters', () => {
    expect(isValidColumnId('abc!@#')).toBe(false);
    expect(isValidColumnId('has space')).toBe(false);
  });
});

describe('constants', () => {
  it('has correct constant values', () => {
    expect(COLUMN_TITLE_MAX_LENGTH).toBe(50);
    expect(RECONNECT_DELAY_MS).toBe(3000);
    expect(AUTOSAVE_DEBOUNCE_MS).toBe(1000);
    expect(DND_MOUSE_DISTANCE).toBe(8);
    expect(DND_TOUCH_DELAY).toBe(300);
    expect(DND_TOUCH_TOLERANCE).toBe(8);
  });

  it('REMINDER_OPTIONS contains exactly the expected values', () => {
    expect([...REMINDER_OPTIONS]).toEqual(['0d', '1d', '2d', '3d', '1w', '2w']);
  });
});
