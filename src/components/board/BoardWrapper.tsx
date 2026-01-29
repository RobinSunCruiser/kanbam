'use client';

import dynamic from 'next/dynamic';
import { Board as BoardType } from '@/types/board';

// Import Board client-side only to avoid hydration issues with @dnd-kit
const Board = dynamic(() => import('./Board'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
    </div>
  ),
});

interface BoardWrapperProps {
  initialBoard: BoardType;
  userPrivilege: 'read' | 'write';
}

export default function BoardWrapper({ initialBoard, userPrivilege }: BoardWrapperProps) {
  return <Board initialBoard={initialBoard} userPrivilege={userPrivilege} />;
}
