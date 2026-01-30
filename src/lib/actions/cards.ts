'use server';

import { revalidatePath } from 'next/cache';
import { createCardSchema, updateCardSchema } from '../validation/schemas';
import { requireAuth, requireBoardAccess } from '../auth/middleware';
import { addCard, updateCard, deleteCard } from '../storage/boards';

/**
 * Server Action: Create Card
 * Creates a new card in the specified column
 */
export async function createCardAction(boardUid: string, formData: FormData) {
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
      error: validation.error.issues[0]?.message || 'Invalid input',
    };
  }

  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    const card = await addCard(boardUid, {
      title: validation.data.title.trim(),
      description: validation.data.description?.trim(),
      columnId: String(validation.data.columnId) as 'todo' | 'in-progress' | 'done',
    });

    revalidatePath(`/board/${boardUid}`);

    return {
      success: true,
      card,
    };
  } catch (error) {
    console.error('Create card error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create card';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update Card
 * Updates card properties (title, description, column, order)
 */
export async function updateCardAction(
  boardUid: string,
  cardId: string,
  updates: {
    title?: string;
    description?: string;
    columnId?: string;
    order?: number;
  }
) {
  // Validate input
  const validation = updateCardSchema.safeParse(updates);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    };
  }

  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    const card = await updateCard(boardUid, cardId, {
      ...validation.data,
      columnId: validation.data.columnId ? String(validation.data.columnId) as 'todo' | 'in-progress' | 'done' : undefined,
    });

    revalidatePath(`/board/${boardUid}`);

    return {
      success: true,
      card,
    };
  } catch (error) {
    console.error('Update card error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update card';
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
  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    await deleteCard(boardUid, cardId);

    revalidatePath(`/board/${boardUid}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete card error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete card';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
