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
  closestCenter,
} from '@dnd-kit/core';
import { Board as BoardType, Card as CardType, ColumnType } from '@/types/board';
import { createCardAction, updateCardAction, deleteCardAction } from '@/lib/actions/cards';
import Column from './Column';
import CardModal from './CardModal';
import AlertDialog from '../ui/AlertDialog';

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
  const [errorAlert, setErrorAlert] = useState<{ title: string; message: string } | null>(null);

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
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('columnId', data.columnId);

    const result = await createCardAction(board.uid, formData);

    if (result?.error) {
      throw new Error(result.error);
    }

    if (result?.card) {
      // Update local state with new card
      setBoard((prevBoard) => {
        const newColumns = prevBoard.columns.map((col) => {
          if (col.id === data.columnId) {
            return {
              ...col,
              cardIds: [...col.cardIds, result.card.id],
            };
          }
          return col;
        });

        return {
          ...prevBoard,
          columns: newColumns,
          cards: {
            ...prevBoard.cards,
            [result.card.id]: result.card,
          },
          updatedAt: new Date().toISOString(),
        };
      });
    }
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

    const result = await updateCardAction(board.uid, cardId, updates);

    if (result?.error) {
      // Rollback on error - refresh from server
      router.refresh();
      throw new Error(result.error);
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

    const result = await deleteCardAction(board.uid, cardId);

    if (result?.error) {
      // Rollback on error
      router.refresh();
      throw new Error(result.error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board.cards[active.id as string];
    setActiveCard(card);
  };

  // Helper: Calculate drop target from drag event
  const calculateDropTarget = (over: DragEndEvent['over']) => {
    if (!over) return null;

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

    return { targetColumnId, targetIndex };
  };

  // Helper: Perform optimistic card move update
  const performOptimisticMove = (
    cardId: string,
    originalColumnId: ColumnType,
    targetColumnId: ColumnType,
    targetIndex: number
  ) => {
    setBoard((prevBoard) => {
      const newColumns = prevBoard.columns.map((col) => {
        // Handle moving within the same column
        if (col.id === originalColumnId && originalColumnId === targetColumnId) {
          const newCardIds = [...col.cardIds];
          const currentIndex = newCardIds.indexOf(cardId);
          newCardIds.splice(currentIndex, 1); // Remove from current position
          newCardIds.splice(targetIndex, 0, cardId); // Insert at new position
          return { ...col, cardIds: newCardIds };
        }

        // Handle moving to different column - remove from source
        if (col.id === originalColumnId) {
          return {
            ...col,
            cardIds: col.cardIds.filter((id) => id !== cardId),
          };
        }

        // Handle moving to different column - add to target
        if (col.id === targetColumnId) {
          const newCardIds = [...col.cardIds];
          newCardIds.splice(targetIndex, 0, cardId);
          return { ...col, cardIds: newCardIds };
        }

        return col;
      });

      return {
        ...prevBoard,
        columns: newColumns,
        cards: {
          ...prevBoard.cards,
          [cardId]: {
            ...prevBoard.cards[cardId],
            columnId: targetColumnId,
            updatedAt: new Date().toISOString(),
          },
        },
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Helper: Rollback failed drag operation
  const performRollback = (
    cardId: string,
    originalColumnId: ColumnType,
    targetColumnId: ColumnType,
    sourceCardIds: string[],
    targetCardIds: string[]
  ) => {
    setBoard((prevBoard) => {
      const newColumns = prevBoard.columns.map((col) => {
        if (col.id === originalColumnId) {
          return { ...col, cardIds: sourceCardIds };
        }
        if (col.id === targetColumnId) {
          return { ...col, cardIds: targetCardIds };
        }
        return col;
      });

      return {
        ...prevBoard,
        columns: newColumns,
        cards: {
          ...prevBoard.cards,
          [cardId]: {
            ...prevBoard.cards[cardId],
            columnId: originalColumnId,
          },
        },
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const cardId = active.id as string;
    const card = board.cards[cardId];
    if (!card) return;

    // Calculate drop target
    const dropTarget = calculateDropTarget(over);
    if (!dropTarget) return;

    const { targetColumnId, targetIndex } = dropTarget;

    // Don't do anything if dropped in same position
    if (card.columnId === targetColumnId) {
      const column = board.columns.find((c) => c.id === targetColumnId);
      const currentIndex = column?.cardIds.indexOf(cardId);
      if (currentIndex === targetIndex) return;
    }

    // Store rollback data (deep copy of affected state)
    const originalColumnId = card.columnId;
    const sourceColumn = board.columns.find((c) => c.id === originalColumnId);
    const targetColumn = board.columns.find((c) => c.id === targetColumnId);

    const rollbackData = {
      cardId,
      originalColumnId,
      targetColumnId,
      sourceCardIds: [...(sourceColumn?.cardIds || [])],
      targetCardIds: [...(targetColumn?.cardIds || [])],
    };

    // Optimistic update: Update UI immediately for better UX
    performOptimisticMove(cardId, originalColumnId, targetColumnId, targetIndex);

    // Send update to backend in background
    try {
      const result = await updateCardAction(board.uid, cardId, {
        columnId: targetColumnId,
        order: targetIndex,
      });

      if (result?.error) {
        performRollback(
          rollbackData.cardId,
          rollbackData.originalColumnId,
          rollbackData.targetColumnId,
          rollbackData.sourceCardIds,
          rollbackData.targetCardIds
        );

        setErrorAlert({
          title: 'Move Failed',
          message: result.error || 'Failed to move card.',
        });
      }
    } catch (error) {
      console.error('Failed to move card:', error);

      performRollback(
        rollbackData.cardId,
        rollbackData.originalColumnId,
        rollbackData.targetColumnId,
        rollbackData.sourceCardIds,
        rollbackData.targetCardIds
      );

      setErrorAlert({
        title: 'Move Failed',
        message: 'Failed to move card. Please try again.',
      });
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
        collisionDetection={closestCenter}
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

      {errorAlert && (
        <AlertDialog
          isOpen={true}
          title={errorAlert.title}
          message={errorAlert.message}
          type="error"
          onClose={() => setErrorAlert(null)}
        />
      )}
    </div>
  );
}
