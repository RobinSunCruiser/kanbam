'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
} from '@dnd-kit/core';
import { Board as BoardType, BoardLabel, Card as CardType, type ReminderOption } from '@/types/board';
import { createCardAction, updateCardAction, deleteCardAction } from '@/lib/actions/cards';
import {
  createColumnAction,
  updateColumnAction,
  deleteColumnAction,
  reorderColumnAction,
} from '@/lib/actions/columns';
import confetti from 'canvas-confetti';
import Column from './Column';
import CardModal from './CardModal/index';
import ColumnDialog from './ColumnDialog';
import LabelFilter from './LabelFilter';
import MemberFilter from './MemberFilter';
import AlertDialog from '../ui/AlertDialog';
import { PlusIcon, FilterIcon } from '../ui/Icons';
import { useBoardSync } from '@/lib/hooks/useBoardSync';
import { useDndSensors } from '@/lib/hooks/useDndSensors';
import { useTranslations } from 'next-intl';

interface BoardProps {
  initialBoard: BoardType;
  userPrivilege: 'read' | 'write';
  userEmail: string;
}

export default function Board({ initialBoard, userPrivilege, userEmail }: BoardProps) {
  const router = useRouter();
  const t = useTranslations('board');
  const [board, setBoard] = useState(initialBoard);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [errorAlert, setErrorAlert] = useState<{ title: string; message: string } | null>(null);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [activeLabelFilters, setActiveLabelFilters] = useState<string[]>([]);
  const [activeMemberFilters, setActiveMemberFilters] = useState<string[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Sync board state when server data changes (e.g., from router.refresh())
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => setBoard(initialBoard), [initialBoard.updatedAt]);

  // Subscribe to real-time updates from other users
  useBoardSync(board.uid);

  const isReadOnly = userPrivilege === 'read';

  const sensors = useDndSensors();

  // Derive selected card from board state (auto-updates when board refreshes)
  const selectedCard = selectedCardId ? board.cards[selectedCardId] ?? null : null;

  const handleCardClick = (card: CardType) => {
    setSelectedCardId(card.id);
    setCreateColumnId(null);
    setIsModalOpen(true);
  };

  const handleAddCard = (columnId: string) => {
    setSelectedCardId(null);
    setCreateColumnId(columnId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCardId(null);
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

  const handleBoardLabelsChange = (labels: BoardLabel[]) => {
    setBoard((prevBoard) => ({
      ...prevBoard,
      labels,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Derive valid label filter IDs (auto-prunes stale IDs when labels change)
  const validLabelIds = new Set(board.labels.map(l => l.id));
  const effectiveLabelFilters = activeLabelFilters.filter(id => validLabelIds.has(id));

  const handleToggleLabelFilter = (labelId: string) => {
    setActiveLabelFilters(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  // Derive valid member filter emails (auto-prunes stale emails when members change)
  const validMemberEmails = new Set(board.members.map(m => m.email));
  const effectiveMemberFilters = activeMemberFilters.filter(e => validMemberEmails.has(e));

  const totalActiveFilters = effectiveLabelFilters.length + effectiveMemberFilters.length;
  const hasFilterableContent = board.labels.length > 0 || board.members.length > 1;

  const handleToggleMemberFilter = (email: string) => {
    setActiveMemberFilters(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleClearAllFilters = () => {
    setActiveLabelFilters([]);
    setActiveMemberFilters([]);
  };

  const handleUpdateCard = async (
    cardId: string,
    updates: {
      title?: string;
      description?: string;
      assignee?: string;
      deadline?: string | null;
      reminder?: ReminderOption | null;
      checklist?: CardType['checklist'];
      links?: CardType['links'];
      activity?: CardType['activity'];
      labelIds?: string[];
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

  // Optimistic removal of a single card from board state
  const removeCardFromBoard = (cardId: string, columnId: string) => {
    setBoard((prevBoard) => {
      const newColumns = prevBoard.columns.map((col) => {
        if (col.id === columnId) {
          return { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) };
        }
        return col;
      });
      const newCards = { ...prevBoard.cards };
      delete newCards[cardId];
      return { ...prevBoard, columns: newColumns, cards: newCards, updatedAt: new Date().toISOString() };
    });
  };

  const handleDeleteCard = async (cardId: string) => {
    const cardToDelete = board.cards[cardId];
    if (!cardToDelete) return;

    removeCardFromBoard(cardId, cardToDelete.columnId);

    const result = await deleteCardAction(board.uid, cardId);
    if (result?.error) {
      router.refresh();
      throw new Error(result.error);
    }
  };

  const handleClearColumn = async (columnId: string) => {
    const column = board.columns.find((col) => col.id === columnId);
    if (!column || column.cardIds.length === 0) return;

    const cardIds = [...column.cardIds].reverse();
    const confettiColors = ['#f97316', '#fb923c', '#fdba74', '#fbbf24', '#facc15'];
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Remove cards one by one (bottom to top) with confetti at each position
    await delay(1000);
    for (let i = 0; i < cardIds.length; i++) {
      if (i > 0) await delay(500);

      const el = document.querySelector(`[data-card-id="${cardIds[i]}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        confetti({
          particleCount: 60,
          spread: 70,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          },
          colors: confettiColors,
        });
      }

      removeCardFromBoard(cardIds[i], columnId);
    }

    // Delete all cards on the server
    const results = await Promise.all(
      cardIds.map((id) => deleteCardAction(board.uid, id))
    );
    if (results.some((r) => r?.error)) {
      router.refresh();
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
          title: t('moveFailed'),
          message: result.error || t('moveFailedMessage'),
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
        title: t('moveFailed'),
        message: t('moveFailedRetry'),
      });
    }
  };

  const getCardsForColumn = (columnId: string): CardType[] => {
    const column = board.columns.find((c) => c.id === columnId);
    if (!column) return [];

    return column.cardIds
      .map((id) => board.cards[id])
      .filter(Boolean)
      .filter((card) => {
        const matchesLabels = effectiveLabelFilters.length === 0 ||
          (card.labelIds || []).some(id => effectiveLabelFilters.includes(id));
        const matchesMembers = effectiveMemberFilters.length === 0 ||
          (card.assignee != null && effectiveMemberFilters.includes(card.assignee));
        return matchesLabels && matchesMembers;
      });
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
        title: t('updateFailed'),
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
        title: t('deleteFailed'),
        message: result.error,
      });
    }
  };

  const handleAddColumnClick = () => {
    setIsColumnDialogOpen(true);
  };

  const handleCreateColumn = async (title: string) => {
    const formData = new FormData();
    formData.append('title', title);

    const result = await createColumnAction(board.uid, formData);

    if (result?.error) {
      throw new Error(result.error);
    } else if (result?.column) {
      setBoard((prevBoard) => ({
        ...prevBoard,
        columns: [...prevBoard.columns, result.column],
        updatedAt: new Date().toISOString(),
      }));
    }
  };

  const handleMoveColumn = async (columnId: string, direction: 'left' | 'right') => {
    const currentIndex = board.columns.findIndex((c) => c.id === columnId);
    const canMove = direction === 'left' ? currentIndex > 0 : currentIndex < board.columns.length - 1;
    if (!canMove) return;

    const swapIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

    // Optimistic update
    setBoard((prevBoard) => {
      const newColumns = [...prevBoard.columns];
      const temp = newColumns[currentIndex];
      newColumns[currentIndex] = newColumns[swapIndex];
      newColumns[swapIndex] = temp;
      return {
        ...prevBoard,
        columns: newColumns,
        updatedAt: new Date().toISOString(),
      };
    });

    const result = await reorderColumnAction(board.uid, columnId, direction);

    if (result?.error) {
      router.refresh();
      setErrorAlert({
        title: t('reorderFailed'),
        message: result.error,
      });
    }
  };

  return (
    <div className="h-full flex flex-col" suppressHydrationWarning>
      <div className="flex items-center justify-end gap-1.5 flex-wrap mb-2 shrink-0 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {isFilterVisible && hasFilterableContent && (
          <>
            {board.members.length > 1 && (
              <MemberFilter
                members={board.members}
                activeMemberEmails={effectiveMemberFilters}
                currentUserEmail={userEmail}
                onToggleMember={handleToggleMemberFilter}
              />
            )}
            {board.labels.length > 0 && board.members.length > 1 && (
              <span className="text-slate-300 dark:text-slate-600 text-sm select-none">|</span>
            )}
            {board.labels.length > 0 && (
              <LabelFilter
                labels={board.labels}
                activeLabelIds={effectiveLabelFilters}
                hasAnyActiveFilters={totalActiveFilters > 0}
                onToggleLabel={handleToggleLabelFilter}
                onClearAll={handleClearAllFilters}
              />
            )}
          </>
        )}

        {hasFilterableContent && (
          <button
            onClick={() => setIsFilterVisible(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shrink-0 ${
              totalActiveFilters > 0
                ? 'text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
            }`}
          >
            <FilterIcon className="w-3.5 h-3.5" />
            {t('filterLabels')}
            {totalActiveFilters > 0 && (
              <span className="bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                {totalActiveFilters}
              </span>
            )}
          </button>
        )}

        {!isReadOnly && (
          <button
            onClick={handleAddColumnClick}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            {t('addColumn')}
          </button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 min-h-0 overflow-x-auto py-2 h-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 w-full md:w-fit max-w-full mx-auto h-full">
            {board.columns.map((column, index) => (
              <div key={column.id} className="shrink-0 w-full md:w-column h-full">
                <Column
                  column={column}
                  cards={getCardsForColumn(column.id)}
                  boardLabels={board.labels}
                  isReadOnly={isReadOnly}
                  canDelete={board.columns.length > 1}
                  canMoveLeft={index > 0}
                  canMoveRight={index < board.columns.length - 1}
                  onCardClick={handleCardClick}
                  onAddCard={handleAddCard}
                  onUpdateTitle={handleUpdateColumnTitle}
                  onDelete={handleDeleteColumn}
                  onMoveColumn={handleMoveColumn}
                  onClearCards={handleClearColumn}
                />
              </div>
            ))}
          </div>
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
        boardLabels={board.labels}
        boardUid={board.uid}
        isOpen={isModalOpen}
        isReadOnly={isReadOnly}
        currentUserEmail={userEmail}
        onClose={handleCloseModal}
        onUpdate={handleUpdateCard}
        onDelete={handleDeleteCard}
        onBoardLabelsChange={handleBoardLabelsChange}
        onCreate={createColumnId ? handleCreateCard : undefined}
        columnId={createColumnId || undefined}
      />

      <ColumnDialog
        isOpen={isColumnDialogOpen}
        onClose={() => setIsColumnDialogOpen(false)}
        onCreate={handleCreateColumn}
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
