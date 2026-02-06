'use client';

import { BoardMetadata } from '@/types/board';
import BoardCard from './BoardCard';
import { useTranslations } from 'next-intl';

interface BoardListProps {
  boards: BoardMetadata[];
}

export default function BoardList({ boards }: BoardListProps) {
  const t = useTranslations('dashboard');

  if (boards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {t('noBoards')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {boards.map((board) => (
        <BoardCard key={board.uid} board={board} />
      ))}
    </div>
  );
}
