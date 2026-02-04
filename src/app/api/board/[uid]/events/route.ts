import { NextRequest } from 'next/server';
import { boardEvents } from '@/lib/realtime/events';
import { requireAuth, requireBoardAccess } from '@/lib/auth/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;

  let userId: string;
  try {
    const user = await requireAuth();
    await requireBoardAccess(user, uid, 'read');
    userId = user.id;
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));

      const unsubscribe = boardEvents.subscribe(uid, (event) => {
        // Skip refresh for the user who made the change
        if (event.actorId === userId) return;
        controller.enqueue(encoder.encode('data: {"type":"refresh"}\n\n'));
      });

      request.signal.addEventListener('abort', () => {
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
