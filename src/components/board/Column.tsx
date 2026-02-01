'use client';

import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Card as CardType } from '@/types/board';
import Card from './Card';
import { PlusIcon } from '../ui/Icons';
import ColumnMenu from './ColumnMenu';
import ConfirmDialog from '../ui/ConfirmDialog';

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
  onMoveLeft: (columnId: string) => Promise<void>;
  onMoveRight: (columnId: string) => Promise<void>;
}

export default function Column({
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
  onMoveLeft,
  onMoveRight,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleClick = () => {
    if (!isReadOnly) {
      setIsEditing(true);
      setEditTitle(column.title);
    }
  };

  const handleTitleSave = async () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== column.title) {
      await onUpdateTitle(column.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(column.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const handleDeleteConfirm = async () => {
    await onDelete(column.id);
    setIsDeleting(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl p-4 flex flex-col h-full transition-colors ${
        isOver ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleTitleSave}
              className="flex-1 px-2 py-1 text-sm font-semibold bg-white dark:bg-slate-700 rounded-lg border border-orange-500 focus:outline-none min-w-0"
              maxLength={50}
            />
          ) : (
            <h3
              onClick={handleTitleClick}
              className={`font-semibold text-slate-700 dark:text-slate-200 truncate ${
                !isReadOnly ? 'cursor-pointer hover:text-orange-500' : ''
              }`}
              title={isReadOnly ? column.title : 'Click to edit'}
            >
              {column.title}
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
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
              title="Add card"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
            <ColumnMenu
              canDelete={canDelete}
              canMoveLeft={canMoveLeft}
              canMoveRight={canMoveRight}
              hasCards={cards.length > 0}
              onMoveLeft={() => onMoveLeft(column.id)}
              onMoveRight={() => onMoveRight(column.id)}
              onDelete={() => setIsDeleting(true)}
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
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-sm text-slate-400">Drop cards here</p>
            </div>
          )}
        </div>
      </SortableContext>

      <ConfirmDialog
        isOpen={isDeleting}
        title="Delete Column"
        message={
          cards.length > 0
            ? `This column contains ${cards.length} card(s). Move or delete them before deleting the column.`
            : `Are you sure you want to delete "${column.title}"?`
        }
        confirmText={cards.length > 0 ? 'OK' : 'Delete'}
        variant={cards.length > 0 ? 'primary' : 'danger'}
        onConfirm={cards.length > 0 ? () => setIsDeleting(false) : handleDeleteConfirm}
        onCancel={() => setIsDeleting(false)}
      />
    </div>
  );
}
