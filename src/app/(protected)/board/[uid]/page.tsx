import { notFound } from 'next/navigation';
import { requireAuth, getUserBoardPrivilege } from '@/lib/auth/middleware';
import { loadBoard } from '@/lib/storage/boards';
import BoardMembers from '@/components/board/BoardMembers';
import BoardWrapper from '@/components/board/BoardWrapper';

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
    <div className="h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-6 flex flex-col overflow-auto">
      <div className="mb-6 shrink-0 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {board.title}
          </h1>
          {board.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {board.description}
            </p>
          )}
          {privilege === 'read' && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              You have read-only access to this board
            </p>
          )}
        </div>

        <BoardMembers
          board={board}
          userEmail={user.email}
          userPrivilege={privilege}
        />
      </div>

      <div className="flex-1 min-h-0">
        <BoardWrapper initialBoard={board} userPrivilege={privilege} userEmail={user.email} />
      </div>
    </div>
  );
}
