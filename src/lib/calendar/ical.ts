import { Board, Column, type ReminderOption } from '@/types/board';
import { getAppUrl } from '@/lib/utils/url';

/** Map reminder values to iCal TRIGGER durations */
const REMINDER_TRIGGERS: Record<ReminderOption, string> = {
  '0d': '-P0D',
  '1d': '-P1D',
  '2d': '-P2D',
  '3d': '-P3D',
  '1w': '-P1W',
  '2w': '-P2W',
};

/** Escape text for iCal format (RFC 5545 section 3.3.11) */
export function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/** Format deadline string as iCal DATE value (YYYYMMDD) */
export function formatDate(deadline: string): string {
  // YYYY-MM-DD: just strip dashes — no Date constructor, no timezone issues
  if (!deadline.includes('T')) return deadline.replace(/-/g, '');
  // Legacy ISO: round to nearest date (+12h trick handles any original timezone)
  const d = new Date(deadline);
  d.setUTCHours(d.getUTCHours() + 12);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
}

/** Format ISO date string as iCal DATETIME value (YYYYMMDDTHHMMSSZ) */
export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Get next day as iCal DATE (for all-day event DTEND, which is exclusive) */
export function nextDay(deadline: string): string {
  let y: number, m: number, d: number;
  if (!deadline.includes('T')) {
    [y, m, d] = deadline.split('-').map(Number);
  } else {
    // Legacy ISO: round to nearest date first
    const dt = new Date(deadline);
    dt.setUTCHours(dt.getUTCHours() + 12);
    y = dt.getUTCFullYear(); m = dt.getUTCMonth() + 1; d = dt.getUTCDate();
  }
  const next = new Date(Date.UTC(y, m - 1, d + 1)); // handles month/year overflow
  return `${next.getUTCFullYear()}${String(next.getUTCMonth() + 1).padStart(2, '0')}${String(next.getUTCDate()).padStart(2, '0')}`;
}

/** Build DESCRIPTION from card data */
function buildDescription(
  card: { description: string; assignee?: string; checklist?: { text: string; checked: boolean }[]; links?: { name: string; url: string }[] },
  column: Column | undefined,
  boardUrl: string
): string {
  const parts: string[] = [];

  if (column) parts.push(`Column: ${column.title}`);
  if (card.assignee) parts.push(`Assignee: ${card.assignee}`);
  if (card.description) parts.push(`\n${card.description}`);
  if (card.checklist && card.checklist.length > 0) {
    const done = card.checklist.filter(i => i.checked).length;
    parts.push(`\nChecklist (${done}/${card.checklist.length}):`);
    for (const item of card.checklist) {
      parts.push(`${item.checked ? '☑' : '☐'} ${item.text}`);
    }
  }
  if (card.links && card.links.length > 0) {
    parts.push('\nLinks:');
    for (const link of card.links) {
      parts.push(`• ${link.name}: ${link.url}`);
    }
  }

  parts.push(`\nBoard: ${boardUrl}`);

  return parts.join('\n');
}

/** Fold long lines per RFC 5545 (max 75 octets per line) */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const lines: string[] = [];
  let current = '';
  let currentBytes = 0;
  const maxFirst = 75;
  const maxCont = 74; // continuation lines start with a space (1 byte)

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    const limit = lines.length === 0 ? maxFirst : maxCont;

    if (currentBytes + charBytes > limit) {
      lines.push(current);
      current = char;
      currentBytes = charBytes;
    } else {
      current += char;
      currentBytes += charBytes;
    }
  }
  if (current) lines.push(current);

  return lines.map((l, i) => (i === 0 ? l : ' ' + l)).join('\r\n');
}

/** Generate iCal feed string for a board */
export async function generateIcalFeed(board: Board, locale: string = 'en'): Promise<string> {
  const boardUrl = `${await getAppUrl()}/${locale}/board/${board.uid}`;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KanBam//Calendar//EN',
    `X-WR-CALNAME:${escapeText(board.title)}`,
    'COLOR:orange',
    'X-APPLE-CALENDAR-COLOR:#f97316',
    'METHOD:PUBLISH',
    'CALSCALE:GREGORIAN',
    'X-WR-CALACCESS:READ',
  ];

  // Build column lookup
  const columnMap = new Map<string, Column>();
  for (const col of board.columns) {
    columnMap.set(col.id, col);
  }

  for (const [cardId, card] of Object.entries(board.cards)) {
    if (!card.deadline) continue;

    const column = columnMap.get(card.columnId);
    const description = buildDescription(card, column, boardUrl);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${cardId}@${board.uid}.kanbam`);
    lines.push(`DTSTAMP:${formatDateTime(card.updatedAt)}`);
    lines.push(`LAST-MODIFIED:${formatDateTime(card.updatedAt)}`);
    lines.push(`DTSTART;VALUE=DATE:${formatDate(card.deadline)}`);
    lines.push(`DTEND;VALUE=DATE:${nextDay(card.deadline)}`);
    lines.push(`SUMMARY:${escapeText(card.title)}`);
    if (description) {
      lines.push(`DESCRIPTION:${escapeText(description)}`);
    }

    // Add VALARM if reminder is set
    const trigger = card.reminder ? REMINDER_TRIGGERS[card.reminder] : null;
    if (trigger) {
      lines.push('BEGIN:VALARM');
      lines.push(`TRIGGER:${trigger}`);
      lines.push('ACTION:DISPLAY');
      lines.push('DESCRIPTION:Reminder');
      lines.push('END:VALARM');
    }

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return lines.map(foldLine).join('\r\n') + '\r\n';
}
