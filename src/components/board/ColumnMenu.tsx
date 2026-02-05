'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVerticalIcon, ChevronLeftIcon, ChevronRightIcon, TrashIcon, SparklesIcon } from '../ui/Icons';

interface ColumnMenuProps {
  canDelete: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  hasCards: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onDelete: () => void;
  onClearCards: () => void;
}

export default function ColumnMenu({
  canDelete,
  canMoveLeft,
  canMoveRight,
  hasCards,
  onMoveLeft,
  onMoveRight,
  onDelete,
  onClearCards,
}: ColumnMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const hasAnyAction = canMoveLeft || canMoveRight || canDelete;

  if (!hasAnyAction) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all"
        aria-label="Column options"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreVerticalIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
          {canMoveLeft && (
            <button
              onClick={() => handleAction(onMoveLeft)}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Move Left
            </button>
          )}
          {canMoveRight && (
            <button
              onClick={() => handleAction(onMoveRight)}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
            >
              <ChevronRightIcon className="w-4 h-4" />
              Move Right
            </button>
          )}
          {hasCards && (
            <>
              {(canMoveLeft || canMoveRight) && (
                <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
              )}
              <button
                onClick={() => handleAction(onClearCards)}
                className="w-full px-3 py-2 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2"
              >
                <SparklesIcon className="w-4 h-4" />
                Clear Cards
              </button>
            </>
          )}
          {(canMoveLeft || canMoveRight || hasCards) && canDelete && (
            <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
          )}
          {canDelete && (
            <button
              onClick={hasCards ? undefined : () => handleAction(onDelete)}
              disabled={hasCards}
              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                hasCards
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
              title={hasCards ? 'Remove all cards first' : 'Delete column'}
            >
              <TrashIcon className="w-4 h-4" />
              {hasCards ? 'Has cards' : 'Delete'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
