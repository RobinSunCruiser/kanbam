'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType } from '@/types/board';
import { getDeadlineText, isOverdue } from '@/lib/utils/dates';

interface CardProps {
  card: CardType;
  onClick: () => void;
  isReadOnly: boolean;
}

export default function Card({ card, onClick, isReadOnly }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: isReadOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const checkedItems = card.checklist?.filter(item => item.checked).length || 0;
  const totalItems = card.checklist?.length || 0;
  const hasMetadata = totalItems > 0 || card.assignee || card.deadline;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && onClick()}
      className={`group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3.5 rounded-xl border-l-[3px] border-l-orange-400/60 border-y border-r border-slate-200/50 dark:border-slate-700/50 ${
        isReadOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
      } hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-200`}
    >
      <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-1 line-clamp-2">
        {card.title}
      </h4>
      {card.description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
          {card.description}
        </p>
      )}

      {hasMetadata && (
        <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/50">
          {totalItems > 0 && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
              checkedItems === totalItems
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500'
            }`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {checkedItems}/{totalItems}
            </span>
          )}

          {card.assignee && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700/50 text-slate-500" title={card.assignee}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {card.assignee.split('@')[0]}
            </span>
          )}

          {card.deadline && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
              isOverdue(card.deadline)
                ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500'
            }`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {getDeadlineText(card.deadline)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
