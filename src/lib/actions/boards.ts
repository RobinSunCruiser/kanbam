'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createBoardSchema, updateBoardSchema, addMemberSchema, removeMemberSchema } from '../validation/schemas';
import { requireAuth, requireBoardAccess } from '../auth/middleware';
import {
  createBoard,
  updateBoardMetadata,
  deleteBoard,
  addBoardMember,
  removeBoardMember,
} from '../storage/boards';

/**
 * Server Action: Create Board
 * Creates a new board for the authenticated user
 */
export async function createBoardAction(formData: FormData) {
  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
  };

  // Validate input
  const validation = createBoardSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    };
  }

  try {
    const user = await requireAuth();
    const board = await createBoard(
      {
        ...validation.data,
        ownerId: user.id,
        title: validation.data.title,
      },
      user.email
    );

    revalidatePath('/dashboard');

    return {
      success: true,
      boardUid: board.uid,
    };
  } catch (error: any) {
    console.error('Create board error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create board',
    };
  }
}

/**
 * Server Action: Update Board
 * Updates board metadata (title, description)
 */
export async function updateBoardAction(boardUid: string, formData: FormData) {
  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
  };

  // Validate input
  const validation = updateBoardSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    };
  }

  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    await updateBoardMetadata(boardUid, validation.data);

    revalidatePath(`/board/${boardUid}`);
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Update board error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update board',
    };
  }
}

/**
 * Server Action: Delete Board
 * Deletes a board and all its data
 */
export async function deleteBoardAction(boardUid: string) {
  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    await deleteBoard(boardUid);

    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Delete board error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete board',
    };
  }
}

/**
 * Server Action: Add Board Member
 * Invites a member to the board with specified privileges
 */
export async function addBoardMemberAction(boardUid: string, formData: FormData) {
  const rawData = {
    email: formData.get('email'),
    privilege: formData.get('privilege'),
  };

  // Validate input
  const validation = addMemberSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    };
  }

  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    await addBoardMember(boardUid, validation.data.email, validation.data.privilege);

    revalidatePath(`/board/${boardUid}`);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Add member error:', error);
    return {
      success: false,
      error: error.message || 'Failed to add member',
    };
  }
}

/**
 * Server Action: Remove Board Member
 * Removes a member from the board
 */
export async function removeBoardMemberAction(boardUid: string, email: string) {
  try {
    const user = await requireAuth();

    // Allow users to remove themselves, or require write access
    if (user.email !== email) {
      await requireBoardAccess(user, boardUid, 'write');
    }

    await removeBoardMember(boardUid, email);

    revalidatePath(`/board/${boardUid}`);
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Remove member error:', error);
    return {
      success: false,
      error: error.message || 'Failed to remove member',
    };
  }
}
