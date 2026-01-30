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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isReadOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Calculate metadata
  const checkedItems = card.checklist?.filter(item => item.checked).length || 0;
  const totalItems = card.checklist?.length || 0;
  const hasMetadata = totalItems > 0 || card.assignee || card.deadline;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        // Prevent click during drag
        if (!isDragging) {
          onClick();
        }
      }}
      className={`bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 ${
        isReadOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:shadow-md'
      } transition-shadow`}
    >
      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
        {card.title}
      </h4>
      {card.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {card.description}
        </p>
      )}

      {/* Metadata section */}
      {hasMetadata && (
        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          {/* Checklist progress */}
          {totalItems > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <span className={checkedItems === totalItems ? 'text-green-600 dark:text-green-400' : ''}>
                ✓ {checkedItems}/{totalItems}
              </span>
            </span>
          )}

          {/* Assignee */}
          {card.assignee && (
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]" title={card.assignee}>
              👤 {card.assignee.split('@')[0]}
            </span>
          )}

          {/* Deadline */}
          {card.deadline && (
            <span
              className={`text-xs ${
                isOverdue(card.deadline)
                  ? 'text-red-600 dark:text-red-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              🕒 {getDeadlineText(card.deadline)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
