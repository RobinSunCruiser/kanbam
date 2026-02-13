'use server';

import { revalidatePath } from 'next/cache';
import { getLocale, getTranslations } from 'next-intl/server';
import { createCardSchema, updateCardSchema } from '../validation/schemas';
import { requireAuth, requireBoardAccess } from '../auth/middleware';
import { addCard, updateCard, deleteCard, loadBoard } from '../storage/boards';
import { sendCardAssignmentEmail } from '../email/send';
import { boardEvents } from '../realtime/events';

/**
 * Server Action: Create Card
 * Creates a new card in the specified column
 */
export async function createCardAction(boardUid: string, formData: FormData) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    columnId: formData.get('columnId'),
  };

  // Validate input
  const validation = createCardSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || t('invalidInput'),
    };
  }

  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    const card = await addCard(boardUid, {
      title: validation.data.title.trim(),
      description: validation.data.description?.trim(),
      columnId: String(validation.data.columnId),
    });

    revalidatePath(`/board/${boardUid}`);
    boardEvents.emit({ boardUid, actorId: user.id });

    return {
      success: true,
      card,
    };
  } catch (error) {
    console.error('Create card error:', error);
    const errorMessage = error instanceof Error ? error.message : t('failedToCreateCard');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update Card
 * Updates card properties (title, description, column, order, and new fields)
 */
export async function updateCardAction(
  boardUid: string,
  cardId: string,
  updates: {
    title?: string;
    description?: string;
    columnId?: string;
    order?: number;
    assignee?: string;
    checklist?: Array<{ id: string; text: string; checked: boolean }>;
    links?: Array<{ id: string; name: string; url: string }>;
    deadline?: string | null;
    reminder?: string | null;
    activity?: Array<{ id: string; text: string; createdBy: string; createdAt: string }>;
  }
) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });

  // Validate input
  const validation = updateCardSchema.safeParse(updates);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || t('invalidInput'),
    };
  }

  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    const card = await updateCard(boardUid, cardId, {
      ...validation.data,
      columnId: validation.data.columnId ? String(validation.data.columnId) : undefined,
    });

    revalidatePath(`/board/${boardUid}`);
    boardEvents.emit({ boardUid, actorId: user.id });

    return {
      success: true,
      card,
    };
  } catch (error) {
    console.error('Update card error:', error);
    const errorMessage = error instanceof Error ? error.message : t('failedToUpdateCard');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Delete Card
 * Removes a card from the board
 */
export async function deleteCardAction(boardUid: string, cardId: string) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });

  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    await deleteCard(boardUid, cardId);

    revalidatePath(`/board/${boardUid}`);
    boardEvents.emit({ boardUid, actorId: user.id });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete card error:', error);
    const errorMessage = error instanceof Error ? error.message : t('failedToDeleteCard');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Send assignment notification email
 */
export async function sendAssignmentEmailAction(
  boardUid: string,
  cardTitle: string,
  assigneeEmail: string
) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });

  try {
    const user = await requireAuth();
    const board = await loadBoard(boardUid);
    if (!board) return { success: false, error: t('boardNotFound') };

    await sendCardAssignmentEmail(
      assigneeEmail,
      user.name,
      cardTitle,
      board.title,
      boardUid,
      locale
    );

    return { success: true };
  } catch (error) {
    console.error('Send assignment email error:', error);
    return { success: false, error: t('failedToSendEmail') };
  }
}
