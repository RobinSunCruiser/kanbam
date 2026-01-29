import { requireAuth } from '@/lib/auth/middleware';
import { loadBoard } from '@/lib/storage/boards';
import { BoardMetadata } from '@/types/board';
import BoardList from '@/components/dashboard/BoardList';
import CreateBoardButton from '@/components/dashboard/CreateBoardButton';

export default async function DashboardPage() {
  const user = await requireAuth();

  // Load all boards the user has access to
  const boards: BoardMetadata[] = [];

  for (const access of user.boardAccess) {
    const board = await loadBoard(access.boardUid);
    if (board) {
      boards.push({
        uid: board.uid,
        title: board.title,
        description: board.description,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        cardCount: Object.keys(board.cards).length,
        privilege: access.privilege,
      });
    }
  }

  // Sort boards by last updated
  boards.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            My Boards
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your Kanban boards
          </p>
        </div>
        <CreateBoardButton />
      </div>

      <BoardList boards={boards} />
    </div>
  );
}
