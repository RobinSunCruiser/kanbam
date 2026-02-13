'use server';

import { getLocale, getTranslations } from 'next-intl/server';
import { requireAuth, requireBoardAccess } from '../auth/middleware';
import { createCalendarToken } from '../calendar/tokens';
import { headers } from 'next/headers';

async function getAppUrl(): Promise<string> {
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  try {
    const host = (await headers()).get('host');
    if (host) {
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return `${protocol}://${host}`;
    }
  } catch {
    // headers() throws outside request context
  }
  return 'http://localhost:3000';
}

/** Generate a calendar subscription URL for the given board */
export async function generateCalendarUrlAction(boardUid: string) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });

  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'read');

    const token = await createCalendarToken(user.id, boardUid);
    const appUrl = await getAppUrl();
    const calendarUrl = `${appUrl}/api/board/${boardUid}/calendar?token=${token}`;

    return { success: true as const, url: calendarUrl };
  } catch (error) {
    console.error('Generate calendar URL error:', error);
    return { success: false as const, error: t('genericError') };
  }
}
