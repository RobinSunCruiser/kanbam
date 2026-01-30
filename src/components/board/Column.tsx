'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Card as CardType } from '@/types/board';
import Card from './Card';

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  isReadOnly: boolean;
  onCardClick: (card: CardType) => void;
  onAddCard: (columnId: ColumnType['id']) => void;
}

export default function Column({ column, cards, isReadOnly, onCardClick, onAddCard }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl p-4 flex flex-col h-full transition-colors ${
        isOver ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">{column.title}</h3>
          <span className="text-xs text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
            {cards.length}
          </span>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => onAddCard(column.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1 overflow-y-auto">
          {cards.map((card) => (
            <Card key={card.id} card={card} onClick={() => onCardClick(card)} isReadOnly={isReadOnly} />
          ))}

          {cards.length === 0 && (
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-sm text-slate-400">Drop cards here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
