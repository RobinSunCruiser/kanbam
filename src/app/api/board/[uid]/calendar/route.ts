import { NextRequest } from 'next/server';
import { verifyCalendarToken } from '@/lib/calendar/tokens';
import { getUserById } from '@/lib/storage/users';
import { getBoardMemberPrivilege, loadBoard } from '@/lib/storage/boards';
import { generateIcalFeed } from '@/lib/calendar/ical';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;

  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return new Response('Missing token', { status: 401 });
  }

  const payload = await verifyCalendarToken(token);
  if (!payload) {
    return new Response('Invalid or expired token', { status: 401 });
  }

  // Prevent using a token for board A to access board B
  if (payload.boardUid !== uid) {
    return new Response('Token does not match board', { status: 403 });
  }

  const user = await getUserById(payload.userId);
  if (!user) {
    return new Response('User not found', { status: 401 });
  }

  // Re-check membership on every request (revokes access immediately when removed)
  const privilege = await getBoardMemberPrivilege(uid, user.email);
  if (!privilege) {
    return new Response('No access to this board', { status: 403 });
  }

  const board = await loadBoard(uid);
  if (!board) {
    return new Response('Board not found', { status: 404 });
  }

  const icalContent = await generateIcalFeed(board, payload.locale);

  return new Response(icalContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${board.uid}.ics"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    },
  });
}
