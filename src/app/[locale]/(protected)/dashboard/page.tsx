import { requireAuth } from '@/lib/auth/middleware';
import { listBoardsByEmail } from '@/lib/storage/boards';
import { BoardMetadata } from '@/types/board';
import BoardList from '@/components/dashboard/BoardList';
import CreateBoardButton from '@/components/dashboard/CreateBoardButton';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireAuth();
  const t = await getTranslations('dashboard');

  // Load all boards where user is a member
  const userBoards = await listBoardsByEmail(user.email);

  // Convert to BoardMetadata format
  const boards: BoardMetadata[] = userBoards.map(board => {
    const member = board.members.find(
      m => m.email.toLowerCase() === user.email.toLowerCase() //find correct member in list
    );

    return {
      uid: board.uid,
      title: board.title,
      description: board.description,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      cardCount: Object.keys(board.cards).length,
      privilege: member?.privilege || 'read',
    };
  });

  // Sort boards by last updated
  boards.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <CreateBoardButton />
      </div>
      <BoardList boards={boards} />
    </div>
  );
}
