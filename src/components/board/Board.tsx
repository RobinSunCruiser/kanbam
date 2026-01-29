'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { Board as BoardType, Card as CardType, ColumnType } from '@/types/board';
import Column from './Column';
import CardModal from './CardModal';

interface BoardProps {
  initialBoard: BoardType;
  userPrivilege: 'read' | 'write';
}

export default function Board({ initialBoard, userPrivilege }: BoardProps) {
  const router = useRouter();
  const [board, setBoard] = useState(initialBoard);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<ColumnType | null>(null);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  const isReadOnly = userPrivilege === 'read';

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card);
    setCreateColumnId(null);
    setIsModalOpen(true);
  };

  const handleAddCard = (columnId: ColumnType) => {
    setSelectedCard(null);
    setCreateColumnId(columnId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
    setCreateColumnId(null);
  };

  const handleCreateCard = async (data: {
    title: string;
    description: string;
    columnId: ColumnType;
  }) => {
    const response = await fetch(`/api/boards/${board.uid}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create card');
    }

    const result = await response.json();
    const newCard = result.data.card;

    // Update local state with new card
    setBoard((prevBoard) => {
      const newColumns = prevBoard.columns.map((col) => {
        if (col.id === data.columnId) {
          return {
            ...col,
            cardIds: [...col.cardIds, newCard.id],
          };
        }
        return col;
      });

      return {
        ...prevBoard,
        columns: newColumns,
        cards: {
          ...prevBoard.cards,
          [newCard.id]: newCard,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleUpdateCard = async (
    cardId: string,
    updates: { title?: string; description?: string }
  ) => {
    // Optimistic update
    setBoard((prevBoard) => ({
      ...prevBoard,
      cards: {
        ...prevBoard.cards,
        [cardId]: {
          ...prevBoard.cards[cardId],
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      },
      updatedAt: new Date().toISOString(),
    }));

    const response = await fetch(`/api/boards/${board.uid}/cards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      // Rollback on error - refresh from server
      router.refresh();
      throw new Error(error.error || 'Failed to update card');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    const cardToDelete = board.cards[cardId];
    if (!cardToDelete) return;

    // Optimistic update - remove card immediately
    setBoard((prevBoard) => {
      const newColumns = prevBoard.columns.map((col) => {
        if (col.id === cardToDelete.columnId) {
          return {
            ...col,
            cardIds: col.cardIds.filter((id) => id !== cardId),
          };
        }
        return col;
      });

      const newCards = { ...prevBoard.cards };
      delete newCards[cardId];

      return {
        ...prevBoard,
        columns: newColumns,
        cards: newCards,
        updatedAt: new Date().toISOString(),
      };
    });

    const response = await fetch(`/api/boards/${board.uid}/cards/${cardId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      // Rollback on error
      router.refresh();
      throw new Error(error.error || 'Failed to delete card');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board.cards[active.id as string];
    setActiveCard(card);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const cardId = active.id as string;
    const card = board.cards[cardId];
    if (!card) return;

    // Determine target column
    let targetColumnId: ColumnType;
    let targetIndex: number;

    // Check if dropped over another card
    const overCard = board.cards[over.id as string];
    if (overCard) {
      targetColumnId = overCard.columnId;
      const targetColumn = board.columns.find((c) => c.id === targetColumnId);
      targetIndex = targetColumn?.cardIds.indexOf(over.id as string) || 0;
    } else {
      // Dropped over a column
      targetColumnId = over.id as ColumnType;
      const targetColumn = board.columns.find((c) => c.id === targetColumnId);
      targetIndex = targetColumn?.cardIds.length || 0;
    }

    // Don't do anything if dropped in same position
    if (card.columnId === targetColumnId) {
      const column = board.columns.find((c) => c.id === targetColumnId);
      const currentIndex = column?.cardIds.indexOf(cardId);
      if (currentIndex === targetIndex) return;
    }

    // Store previous state for rollback
    const previousBoard = { ...board };

    // Optimistic update: Update local state immediately
    setBoard((prevBoard) => {
      const newBoard = { ...prevBoard };
      const newColumns = [...newBoard.columns];
      const newCards = { ...newBoard.cards };

      // Remove card from old column
      const oldColumnIndex = newColumns.findIndex((c) => c.id === card.columnId);
      if (oldColumnIndex !== -1) {
        newColumns[oldColumnIndex] = {
          ...newColumns[oldColumnIndex],
          cardIds: newColumns[oldColumnIndex].cardIds.filter((id) => id !== cardId),
        };
      }

      // Add card to new column at target index
      const newColumnIndex = newColumns.findIndex((c) => c.id === targetColumnId);
      if (newColumnIndex !== -1) {
        const newCardIds = [...newColumns[newColumnIndex].cardIds];
        newCardIds.splice(targetIndex, 0, cardId);
        newColumns[newColumnIndex] = {
          ...newColumns[newColumnIndex],
          cardIds: newCardIds,
        };
      }

      // Update card's columnId
      newCards[cardId] = {
        ...newCards[cardId],
        columnId: targetColumnId,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...newBoard,
        columns: newColumns,
        cards: newCards,
        updatedAt: new Date().toISOString(),
      };
    });

    // Send update to backend
    try {
      const response = await fetch(`/api/boards/${board.uid}/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columnId: targetColumnId,
          order: targetIndex,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to move card');
      }

      // Success - backend is in sync
    } catch (error) {
      console.error('Failed to move card:', error);
      // Rollback to previous state
      setBoard(previousBoard);
      alert('Failed to move card. Please try again.');
    }
  };

  const getCardsForColumn = (columnId: ColumnType): CardType[] => {
    const column = board.columns.find((c) => c.id === columnId);
    if (!column) return [];

    return column.cardIds
      .map((id) => board.cards[id])
      .filter(Boolean);
  };

  return (
    <div className="h-full flex flex-col" suppressHydrationWarning>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
          {board.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={getCardsForColumn(column.id)}
              isReadOnly={isReadOnly}
              onCardClick={handleCardClick}
              onAddCard={handleAddCard}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 rotate-3 cursor-grabbing">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                {activeCard.title}
              </h4>
              {activeCard.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {activeCard.description}
                </p>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CardModal
        card={selectedCard}
        isOpen={isModalOpen}
        isReadOnly={isReadOnly}
        onClose={handleCloseModal}
        onUpdate={handleUpdateCard}
        onDelete={handleDeleteCard}
        onCreate={createColumnId ? handleCreateCard : undefined}
        columnId={createColumnId || undefined}
      />
    </div>
  );
}
