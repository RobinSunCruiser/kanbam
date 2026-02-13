import { describe, it, expect } from 'vitest';
import { escapeText, formatDate, formatDateTime, nextDay, foldLine } from './ical';

describe('escapeText', () => {
  it('escapes backslashes', () => {
    expect(escapeText('a\\b')).toBe('a\\\\b');
  });

  it('escapes semicolons', () => {
    expect(escapeText('a;b')).toBe('a\\;b');
  });

  it('escapes commas', () => {
    expect(escapeText('a,b')).toBe('a\\,b');
  });

  it('escapes newlines', () => {
    expect(escapeText('a\nb')).toBe('a\\nb');
  });

  it('escapes multiple special characters in one string', () => {
    expect(escapeText('a\\b;c,d\ne')).toBe('a\\\\b\\;c\\,d\\ne');
  });

  it('leaves plain text unchanged', () => {
    expect(escapeText('Hello World')).toBe('Hello World');
  });
});

describe('formatDate', () => {
  it('converts YYYY-MM-DD to YYYYMMDD', () => {
    expect(formatDate('2025-03-15')).toBe('20250315');
  });

  it('handles single-digit months and days', () => {
    expect(formatDate('2025-01-05')).toBe('20250105');
  });

  it('handles legacy ISO strings', () => {
    // The +12h trick rounds to the nearest date
    const result = formatDate('2025-03-15T10:00:00Z');
    expect(result).toBe('20250315');
  });
});

describe('formatDateTime', () => {
  it('converts ISO string to iCal DATETIME format', () => {
    expect(formatDateTime('2025-03-15T10:30:00.000Z')).toBe('20250315T103000Z');
  });

  it('strips dashes, colons, and milliseconds', () => {
    const result = formatDateTime('2025-01-01T00:00:00.123Z');
    expect(result).toBe('20250101T000000Z');
  });
});

describe('nextDay', () => {
  it('returns the next day for YYYY-MM-DD format', () => {
    expect(nextDay('2025-03-15')).toBe('20250316');
  });

  it('handles month overflow', () => {
    expect(nextDay('2025-01-31')).toBe('20250201');
  });

  it('handles year overflow', () => {
    expect(nextDay('2025-12-31')).toBe('20260101');
  });

  it('handles February end (non-leap year)', () => {
    expect(nextDay('2025-02-28')).toBe('20250301');
  });

  it('handles February end (leap year)', () => {
    expect(nextDay('2024-02-29')).toBe('20240301');
  });

  it('handles legacy ISO strings', () => {
    expect(nextDay('2025-03-15T10:00:00Z')).toBe('20250316');
  });
});

describe('foldLine', () => {
  it('returns short lines unchanged', () => {
    const line = 'SHORT:value';
    expect(foldLine(line)).toBe(line);
  });

  it('returns a 75-byte line unchanged', () => {
    const line = 'X'.repeat(75);
    expect(foldLine(line)).toBe(line);
  });

  it('folds lines longer than 75 bytes', () => {
    const line = 'DESCRIPTION:' + 'A'.repeat(100);
    const folded = foldLine(line);
    // Folded lines use CRLF + space as continuation
    expect(folded).toContain('\r\n ');
    // Each segment should be <=75 bytes (first) or <=74+1 bytes (continuation)
    const segments = folded.split('\r\n');
    const encoder = new TextEncoder();
    for (let i = 0; i < segments.length; i++) {
      const bytes = encoder.encode(segments[i]).length;
      expect(bytes).toBeLessThanOrEqual(75);
    }
  });

  it('handles multi-byte characters correctly', () => {
    // Each emoji is 4 bytes in UTF-8
    const line = 'SUMMARY:' + '\u{1F600}'.repeat(30);
    const folded = foldLine(line);
    const segments = folded.split('\r\n');
    const encoder = new TextEncoder();
    for (const segment of segments) {
      expect(encoder.encode(segment).length).toBeLessThanOrEqual(75);
    }
  });
});
