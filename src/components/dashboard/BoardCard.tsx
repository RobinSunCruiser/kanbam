'use client';

import Link from 'next/link';
import { BoardMetadata } from '@/types/board';

interface BoardCardProps {
  board: BoardMetadata;
}

export default function BoardCard({ board }: BoardCardProps) {
  return (
    <Link href={`/board/${board.uid}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
            {board.title}
          </h3>
          <span
            className={`text-xs px-2 py-1 rounded ${
              board.privilege === 'write'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            }`}
          >
            {board.privilege === 'write' ? 'Edit' : 'View'}
          </span>
        </div>

        {board.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {board.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{board.cardCount} cards</span>
          <span>
            Updated {new Date(board.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
