'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType } from '@/types/board';

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
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {card.description}
        </p>
      )}
    </div>
  );
}
