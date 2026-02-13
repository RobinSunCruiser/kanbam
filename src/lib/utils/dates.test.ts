import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDeadlineText, isOverdue } from './dates';

// Mock translation function that returns the key (or key + count)
const t = (key: string, values?: Record<string, number>) => {
  if (values?.count !== undefined) return `${key}:${values.count}`;
  return key;
};

describe('getDeadlineText', () => {
  beforeEach(() => {
    // Pin "now" to 2025-06-15 midnight local time
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15)); // June 15, 2025
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns overdue for past dates', () => {
    expect(getDeadlineText('2025-06-14', t)).toBe('overdue');
    expect(getDeadlineText('2025-01-01', t)).toBe('overdue');
  });

  it('returns today for current date', () => {
    expect(getDeadlineText('2025-06-15', t)).toBe('today');
  });

  it('returns tomorrow for next day', () => {
    expect(getDeadlineText('2025-06-16', t)).toBe('tomorrow');
  });

  it('returns days with count for future dates', () => {
    expect(getDeadlineText('2025-06-20', t)).toBe('days:5');
    expect(getDeadlineText('2025-06-17', t)).toBe('days:2');
  });

  it('handles legacy ISO format strings', () => {
    // Legacy ISO with T — should still resolve to a date
    expect(getDeadlineText('2025-06-14T12:00:00Z', t)).toBe('overdue');
    expect(getDeadlineText('2025-06-15T00:00:00Z', t)).toBe('today');
  });
});

describe('isOverdue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for past dates', () => {
    expect(isOverdue('2025-06-14')).toBe(true);
    expect(isOverdue('2024-12-31')).toBe(true);
  });

  it('returns false for today', () => {
    expect(isOverdue('2025-06-15')).toBe(false);
  });

  it('returns false for future dates', () => {
    expect(isOverdue('2025-06-16')).toBe(false);
    expect(isOverdue('2025-12-31')).toBe(false);
  });

  it('handles legacy ISO format strings', () => {
    // Use midday times to avoid timezone-dependent day boundaries
    expect(isOverdue('2025-06-13T12:00:00Z')).toBe(true);
    expect(isOverdue('2025-06-16T12:00:00Z')).toBe(false);
  });
});
