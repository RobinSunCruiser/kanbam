'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Card as CardType } from '@/types/board';
import Card from './Card';
import Button from '../ui/Button';

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  isReadOnly: boolean;
  onCardClick: (card: CardType) => void;
  onAddCard: (columnId: ColumnType['id']) => void;
}

export default function Column({
  column,
  cards,
  isReadOnly,
  onCardClick,
  onAddCard,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col h-full"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {column.title}
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            ({cards.length})
          </span>
        </h3>
        {!isReadOnly && (
          <Button
            onClick={() => onAddCard(column.id)}
            variant="secondary"
            className="text-sm py-1 px-2"
          >
            + Add
          </Button>
        )}
      </div>

      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 flex-1 overflow-y-auto rounded-md transition-colors">
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
              isReadOnly={isReadOnly}
            />
          ))}

          {cards.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                Drop cards here
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
