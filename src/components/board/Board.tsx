'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { Board as BoardType, Card as CardType } from '@/types/board';
import { createCardAction, updateCardAction, deleteCardAction } from '@/lib/actions/cards';
import {
  createColumnAction,
  updateColumnAction,
  deleteColumnAction,
  reorderColumnAction,
} from '@/lib/actions/columns';
import Column from './Column';
import CardModal from './CardModal/index';
import AlertDialog from '../ui/AlertDialog';
import { PlusIcon } from '../ui/Icons';
import { useBoardSync } from '@/lib/hooks/useBoardSync';

interface BoardProps {
  initialBoard: BoardType;
  userPrivilege: 'read' | 'write';
  userEmail: string;
}

export default function Board({ initialBoard, userPrivilege, userEmail }: BoardProps) {
  const router = useRouter();
  const [board, setBoard] = useState(initialBoard);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [errorAlert, setErrorAlert] = useState<{ title: string; message: string } | null>(null);

  // Sync board state when server data changes (e.g., from router.refresh())
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => setBoard(initialBoard), [initialBoard.updatedAt]);

  // Subscribe to real-time updates from other users
  useBoardSync(board.uid);

  const isReadOnly = userPrivilege === 'read';

  // Configure sensors for drag detection (pointer for desktop, touch for mobile)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 8,
      },
    })
  );

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card);
    setCreateColumnId(null);
    setIsModalOpen(true);
  };

  const handleAddCard = (columnId: string) => {
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
    columnId: string;
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
    updates: {
      title?: string;
      description?: string;
      assignee?: string;
      deadline?: string | null;
      checklist?: CardType['checklist'];
      links?: CardType['links'];
      activity?: CardType['activity'];
    }
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

    let targetColumnId: string;
    let targetIndex: number;

    // Check if dropped over another card
    const overCard = board.cards[over.id as string];
    if (overCard) {
      targetColumnId = overCard.columnId;
      const targetColumn = board.columns.find((c) => c.id === targetColumnId);
      targetIndex = targetColumn?.cardIds.indexOf(over.id as string) || 0;
    } else {
      // Dropped over a column
      targetColumnId = over.id as string;
      const targetColumn = board.columns.find((c) => c.id === targetColumnId);
      targetIndex = targetColumn?.cardIds.length || 0;
    }

    return { targetColumnId, targetIndex };
  };

  // Helper: Perform optimistic card move update
  const performOptimisticMove = (
    cardId: string,
    originalColumnId: string,
    targetColumnId: string,
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
    originalColumnId: string,
    targetColumnId: string,
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

  const getCardsForColumn = (columnId: string): CardType[] => {
    const column = board.columns.find((c) => c.id === columnId);
    if (!column) return [];

    return column.cardIds
      .map((id) => board.cards[id])
      .filter(Boolean);
  };

  // Column operation handlers
  const handleUpdateColumnTitle = async (columnId: string, title: string) => {
    // Optimistic update
    setBoard((prevBoard) => ({
      ...prevBoard,
      columns: prevBoard.columns.map((col) =>
        col.id === columnId ? { ...col, title } : col
      ),
      updatedAt: new Date().toISOString(),
    }));

    const formData = new FormData();
    formData.append('title', title);
    const result = await updateColumnAction(board.uid, columnId, formData);

    if (result?.error) {
      router.refresh();
      setErrorAlert({
        title: 'Update Failed',
        message: result.error,
      });
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    const columnToDelete = board.columns.find((c) => c.id === columnId);
    if (!columnToDelete) return;

    // Optimistic update
    setBoard((prevBoard) => ({
      ...prevBoard,
      columns: prevBoard.columns.filter((col) => col.id !== columnId),
      updatedAt: new Date().toISOString(),
    }));

    const result = await deleteColumnAction(board.uid, columnId);

    if (result?.error) {
      router.refresh();
      setErrorAlert({
        title: 'Delete Failed',
        message: result.error,
      });
    }
  };

  const handleAddColumn = async () => {
    const formData = new FormData();
    formData.append('title', 'New Column');

    const result = await createColumnAction(board.uid, formData);

    if (result?.error) {
      setErrorAlert({
        title: 'Create Failed',
        message: result.error,
      });
    } else if (result?.column) {
      setBoard((prevBoard) => ({
        ...prevBoard,
        columns: [...prevBoard.columns, result.column],
        updatedAt: new Date().toISOString(),
      }));
    }
  };

  const handleMoveColumnLeft = async (columnId: string) => {
    const currentIndex = board.columns.findIndex((c) => c.id === columnId);
    if (currentIndex <= 0) return;

    // Optimistic update
    setBoard((prevBoard) => {
      const newColumns = [...prevBoard.columns];
      const temp = newColumns[currentIndex];
      newColumns[currentIndex] = newColumns[currentIndex - 1];
      newColumns[currentIndex - 1] = temp;
      return {
        ...prevBoard,
        columns: newColumns,
        updatedAt: new Date().toISOString(),
      };
    });

    const result = await reorderColumnAction(board.uid, columnId, 'left');

    if (result?.error) {
      router.refresh();
      setErrorAlert({
        title: 'Reorder Failed',
        message: result.error,
      });
    }
  };

  const handleMoveColumnRight = async (columnId: string) => {
    const currentIndex = board.columns.findIndex((c) => c.id === columnId);
    if (currentIndex >= board.columns.length - 1) return;

    // Optimistic update
    setBoard((prevBoard) => {
      const newColumns = [...prevBoard.columns];
      const temp = newColumns[currentIndex];
      newColumns[currentIndex] = newColumns[currentIndex + 1];
      newColumns[currentIndex + 1] = temp;
      return {
        ...prevBoard,
        columns: newColumns,
        updatedAt: new Date().toISOString(),
      };
    });

    const result = await reorderColumnAction(board.uid, columnId, 'right');

    if (result?.error) {
      router.refresh();
      setErrorAlert({
        title: 'Reorder Failed',
        message: result.error,
      });
    }
  };

  return (
    <div className="h-full flex flex-col" suppressHydrationWarning>
      {!isReadOnly && (
        <div className="flex justify-end mb-2 shrink-0">
          <button
            onClick={handleAddColumn}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Add Column
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 overflow-x-auto py-2 -mx-4 px-4"
          style={{ minWidth: '100%' }}
        >
          {board.columns.map((column, index) => (
            <div key={column.id} className="shrink-0 md:w-column h-full">
              <Column
                column={column}
                cards={getCardsForColumn(column.id)}
                isReadOnly={isReadOnly}
                canDelete={board.columns.length > 1}
                canMoveLeft={index > 0}
                canMoveRight={index < board.columns.length - 1}
                onCardClick={handleCardClick}
                onAddCard={handleAddCard}
                onUpdateTitle={handleUpdateColumnTitle}
                onDelete={handleDeleteColumn}
                onMoveLeft={handleMoveColumnLeft}
                onMoveRight={handleMoveColumnRight}
              />
            </div>
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
        boardMembers={board.members}
        boardUid={board.uid}
        isOpen={isModalOpen}
        isReadOnly={isReadOnly}
        currentUserEmail={userEmail}
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
