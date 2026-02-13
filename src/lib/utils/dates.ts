/**
 * Date utility functions for card deadlines
 */

/**
 * Gets a human-readable deadline text using the provided translation function
 * @param deadline - ISO date string
 * @param t - Translation function from the 'deadline' namespace
 * @returns Translated text like "Overdue", "Today", "Tomorrow", or "X days"
 */
export function getDeadlineText(
  deadline: string,
  t: (key: string, values?: Record<string, number>) => string
): string {
  // Parse YYYY-MM-DD as local midnight; legacy ISO strings pass through unchanged
  const date = new Date(deadline.includes('T') ? deadline : deadline + 'T00:00:00');
  const now = new Date();

  // Reset time to start of day for accurate day comparison
  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return t('overdue');
  if (days === 0) return t('today');
  if (days === 1) return t('tomorrow');
  return t('days', { count: days });
}

/**
 * Checks if a deadline is overdue
 * @param deadline - ISO date string
 * @returns true if deadline is in the past
 */
export function isOverdue(deadline: string): boolean {
  const date = new Date(deadline.includes('T') ? deadline : deadline + 'T00:00:00');
  const now = new Date();

  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  return date.getTime() < now.getTime();
}
