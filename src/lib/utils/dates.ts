/**
 * Date utility functions for card deadlines
 */

/**
 * Gets a human-readable deadline text
 * @param deadline - ISO date string
 * @returns Text like "Overdue", "Today", "Tomorrow", or "X days"
 */
export function getDeadlineText(deadline: string): string {
  const date = new Date(deadline);
  const now = new Date();

  // Reset time to start of day for accurate day comparison
  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return 'Overdue';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
}

/**
 * Checks if a deadline is overdue
 * @param deadline - ISO date string
 * @returns true if deadline is in the past
 */
export function isOverdue(deadline: string): boolean {
  const date = new Date(deadline);
  const now = new Date();

  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  return date.getTime() < now.getTime();
}
