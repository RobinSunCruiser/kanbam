'use server';

import { getTranslations } from 'next-intl/server';
import { requireAuth, requireBoardAccess } from '../auth/middleware';
import { createCalendarToken } from '../calendar/tokens';
import { getAppUrl } from '@/lib/utils/url';

/** Generate a calendar subscription URL for the given board */
export async function generateCalendarUrlAction(boardUid: string, locale: string) {
  const t = await getTranslations({ locale, namespace: 'errors' });

  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'read');

    const token = await createCalendarToken(user.id, boardUid, locale);
    const appUrl = await getAppUrl();
    const calendarUrl = `${appUrl}/api/board/${boardUid}/calendar?token=${token}`;

    return { success: true as const, url: calendarUrl };
  } catch (error) {
    console.error('Generate calendar URL error:', error);
    return { success: false as const, error: t('genericError') };
  }
}
