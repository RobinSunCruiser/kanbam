'use server';

import { revalidatePath } from 'next/cache';
import { createColumnSchema, updateColumnSchema } from '../validation/schemas';
import { requireAuth, requireBoardAccess } from '../auth/middleware';
import { addColumn, updateColumn, deleteColumn, reorderColumn } from '../storage/boards';

/**
 * Server Action: Create Column
 * Adds a new column to the board
 */
export async function createColumnAction(boardUid: string, formData: FormData) {
  const rawData = {
    title: formData.get('title'),
  };

  const validation = createColumnSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    };
  }

  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    const column = await addColumn(boardUid, validation.data.title.trim());

    revalidatePath(`/board/${boardUid}`);

    return {
      success: true,
      column,
    };
  } catch (error) {
    console.error('Create column error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create column';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update Column
 * Renames a column
 */
export async function updateColumnAction(
  boardUid: string,
  columnId: string,
  formData: FormData
) {
  const rawData = {
    title: formData.get('title'),
  };

  const validation = updateColumnSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    };
  }

  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    const column = await updateColumn(boardUid, columnId, validation.data.title.trim());

    revalidatePath(`/board/${boardUid}`);

    return {
      success: true,
      column,
    };
  } catch (error) {
    console.error('Update column error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update column';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Delete Column
 * Removes a column (must be empty)
 */
export async function deleteColumnAction(boardUid: string, columnId: string) {
  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    await deleteColumn(boardUid, columnId);

    revalidatePath(`/board/${boardUid}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete column error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete column';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Reorder Column
 * Moves a column left or right
 */
export async function reorderColumnAction(
  boardUid: string,
  columnId: string,
  direction: 'left' | 'right'
) {
  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    const columns = await reorderColumn(boardUid, columnId, direction);

    revalidatePath(`/board/${boardUid}`);

    return {
      success: true,
      columns,
    };
  } catch (error) {
    console.error('Reorder column error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to reorder column';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
