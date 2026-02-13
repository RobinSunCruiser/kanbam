'use client';

import { memo, useState, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Card as CardType } from '@/types/board';
import { useInlineEdit } from '@/lib/hooks/useInlineEdit';
import Card from './Card';
import { PlusIcon } from '../ui/Icons';
import ColumnMenu from './ColumnMenu';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useTranslations } from 'next-intl';

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  isReadOnly: boolean;
  canDelete: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onCardClick: (card: CardType) => void;
  onAddCard: (columnId: string) => void;
  onUpdateTitle: (columnId: string, title: string) => Promise<void>;
  onDelete: (columnId: string) => Promise<void>;
  onMoveColumn: (columnId: string, direction: 'left' | 'right') => Promise<void>;
  onClearCards: (columnId: string) => Promise<void>;
}

/**
 * Kanban column with draggable card container and editable title.
 *
 * Memoized to prevent unnecessary re-renders when other columns change.
 */
const Column = memo(function Column({
  column,
  cards,
  isReadOnly,
  canDelete,
  canMoveLeft,
  canMoveRight,
  onCardClick,
  onAddCard,
  onUpdateTitle,
  onDelete,
  onMoveColumn,
  onClearCards,
}: ColumnProps) {
  const t = useTranslations('board');
  const tCommon = useTranslations('common');
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Inline edit for column title
  const {
    isEditing: isTitleEditing,
    value: titleValue,
    setValue: setTitleValue,
    inputRef: titleInputRef,
    startEditing: startTitleEditing,
    handleKeyDown: handleTitleKeyDown,
    handleBlur: handleTitleBlur,
  } = useInlineEdit<HTMLInputElement>({
    initialValue: column.title,
    onSave: (newTitle) => onUpdateTitle(column.id, newTitle),
    disabled: isReadOnly,
    validate: (value) => value.length > 0 && value.length <= 50,
  });

  const handleDeleteConfirm = useCallback(async () => {
    await onDelete(column.id);
    setIsDeleting(false);
  }, [column.id, onDelete]);

  const handleClearConfirm = useCallback(async () => {
    setIsClearing(false);
    await onClearCards(column.id);
  }, [column.id, onClearCards]);

  return (
    <div
      ref={setNodeRef}
      className={`glass-light rounded-2xl p-4 flex flex-col h-full transition-all duration-300 border border-white/10 dark:border-slate-700/20 ${
        isOver ? 'bg-orange-50/40 dark:bg-orange-900/15 border-orange-300/40 dark:border-orange-500/30 shadow-lg shadow-orange-500/10' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isTitleEditing ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleTitleBlur}
              className="flex-1 px-2 py-1 text-sm font-semibold bg-white dark:bg-slate-700 rounded-lg border border-orange-500 focus:outline-none min-w-0"
              maxLength={50}
              aria-label={t('columnTitle')}
            />
          ) : (
            <h3
              onClick={startTitleEditing}
              className={`font-semibold text-slate-700 dark:text-slate-200 truncate ${
                !isReadOnly ? 'cursor-pointer hover:text-orange-500' : ''
              }`}
              title={isReadOnly ? column.title : t('clickToEdit')}
            >
              {titleValue}
            </h3>
          )}
          <span className="text-xs text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 px-2 py-0.5 rounded-full flex-shrink-0">
            {cards.length}
          </span>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAddCard(column.id)}
              className="w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
              aria-label={t('addCardTo', { column: column.title })}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
            <ColumnMenu
              canDelete={canDelete}
              canMoveLeft={canMoveLeft}
              canMoveRight={canMoveRight}
              hasCards={cards.length > 0}
              onMoveColumn={(direction) => onMoveColumn(column.id, direction)}
              onDelete={() => setIsDeleting(true)}
              onClearCards={() => setIsClearing(true)}
            />
          </div>
        )}
      </div>

      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1 overflow-y-auto">
          {cards.map((card) => (
            <Card key={card.id} card={card} onClick={() => onCardClick(card)} isReadOnly={isReadOnly} />
          ))}

          {cards.length === 0 && (
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200/50 dark:border-slate-700/40 rounded-xl glass-light opacity-60">
              <p className="text-sm text-slate-400">{t('dropCardsHere')}</p>
            </div>
          )}
        </div>
      </SortableContext>

      <ConfirmDialog
        isOpen={isDeleting}
        title={t('deleteColumn')}
        message={
          cards.length > 0
            ? t('deleteColumnHasCards', { count: cards.length })
            : t('deleteColumnConfirm', { title: column.title })
        }
        confirmText={cards.length > 0 ? tCommon('ok') : tCommon('delete')}
        variant={cards.length > 0 ? 'primary' : 'danger'}
        onConfirm={cards.length > 0 ? () => setIsDeleting(false) : handleDeleteConfirm}
        onCancel={() => setIsDeleting(false)}
      />

      <ConfirmDialog
        isOpen={isClearing}
        title={t('clearCards')}
        message={t('clearCardsConfirm', { count: cards.length, title: column.title })}
        confirmText={t('clearAll')}
        variant="danger"
        onConfirm={handleClearConfirm}
        onCancel={() => setIsClearing(false)}
      />
    </div>
  );
});

export default Column;
