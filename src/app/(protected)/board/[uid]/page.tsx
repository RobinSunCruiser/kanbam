import { notFound } from 'next/navigation';
import { requireAuth, getUserBoardPrivilege } from '@/lib/auth/middleware';
import { loadBoard } from '@/lib/storage/boards';
import BoardMembers from '@/components/board/BoardMembers';
import BoardWrapper from '@/components/board/BoardWrapper';
import BoardHeader from '@/components/board/BoardHeader';

interface BoardPageProps {
  params: Promise<{ uid: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { uid } = await params;
  const user = await requireAuth();

  // Check user has access to this board
  const privilege = await getUserBoardPrivilege(user, uid);
  if (!privilege) {
    notFound();
  }

  // Load board data
  const board = await loadBoard(uid);
  if (!board) {
    notFound();
  }

  return (
    <div className="h-[calc(100vh-var(--spacing-navbar))] pt-6 pb-4 flex flex-col overflow-auto">
      <div className="mb-3 shrink-0 flex items-center justify-between gap-4 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex-1 min-w-0 flex items-center gap-4 flex-wrap">
          <BoardHeader
            boardUid={board.uid}
            title={board.title}
            description={board.description}
            isReadOnly={privilege === 'read'}
          />
          {privilege === 'read' && (
            <span className="text-xs text-orange-600 dark:text-orange-400 px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 rounded-full">
              Read-only
            </span>
          )}
        </div>

        <BoardMembers
          board={board}
          userEmail={user.email}
          userPrivilege={privilege}
        />
      </div>

      <div className="flex-1 min-h-0 px-4 sm:px-6 lg:px-8">
        <BoardWrapper initialBoard={board} userPrivilege={privilege} userEmail={user.email} />
      </div>
    </div>
  );
}
