'use server';

import { revalidatePath } from 'next/cache';
import { getLocale, getTranslations } from 'next-intl/server';
import { createBoardSchema, updateBoardSchema, addMemberSchema } from '../validation/schemas';
import { requireAuth, requireBoardAccess } from '../auth/middleware';
import {
  createBoard,
  updateBoardMetadata,
  deleteBoard,
  addBoardMember,
  removeBoardMember,
  loadBoard,
} from '../storage/boards';
import { getUserById } from '../storage/users';
import { boardEvents } from '../realtime/events';

/**
 * Server Action: Create Board
 * Creates a new board for the authenticated user
 */
export async function createBoardAction(formData: FormData) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
  };

  // Validate input
  const validation = createBoardSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || t('invalidInput'),
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
  } catch (error) {
    console.error('Create board error:', error);
    const errorMessage = error instanceof Error ? error.message : t('failedToCreateBoard');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update Board
 * Updates board metadata (title, description)
 */
export async function updateBoardAction(boardUid: string, formData: FormData) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });

  const toOptionalString = (value: FormDataEntryValue | null) =>
    value === null ? undefined : String(value);

  const rawData = {
    title: toOptionalString(formData.get('title')),
    description: toOptionalString(formData.get('description')),
  };

  // Validate input
  const validation = updateBoardSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || t('invalidInput'),
    };
  }

  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    const updates: { title?: string; description?: string } = {};
    if (validation.data.title !== undefined) updates.title = validation.data.title;
    if (validation.data.description !== undefined) updates.description = validation.data.description;

    if (Object.keys(updates).length > 0) {
      await updateBoardMetadata(boardUid, updates);
    }

    revalidatePath(`/board/${boardUid}`);
    revalidatePath('/dashboard');
    boardEvents.emit({ boardUid, actorId: user.id });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update board error:', error);
    const errorMessage = error instanceof Error ? error.message : t('failedToUpdateBoard');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Delete Board
 * Deletes a board and all its data
 */
export async function deleteBoardAction(boardUid: string) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });

  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    await deleteBoard(boardUid);

    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete board error:', error);
    const errorMessage = error instanceof Error ? error.message : t('failedToDeleteBoard');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Add Board Member
 * Invites a member to the board with specified privileges
 */
export async function addBoardMemberAction(boardUid: string, formData: FormData) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });

  const rawData = {
    email: formData.get('email'),
    privilege: formData.get('privilege'),
  };

  // Validate input
  const validation = addMemberSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || t('invalidInput'),
    };
  }

  try {
    const user = await requireAuth();
    await requireBoardAccess(user, boardUid, 'write');

    await addBoardMember(boardUid, validation.data.email, validation.data.privilege);

    revalidatePath(`/board/${boardUid}`);
    boardEvents.emit({ boardUid, actorId: user.id });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Add member error:', error);
    const errorMessage = error instanceof Error ? error.message : t('failedToAddMember');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Remove Board Member
 * Removes a member from the board
 * Authorization: Users can remove themselves, or users with write access can remove others (except the owner)
 */
export async function removeBoardMemberAction(boardUid: string, email: string) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });

  try {
    const user = await requireAuth();
    const isSelfRemoval = user.email.toLowerCase() === email.toLowerCase();

    if (!isSelfRemoval) {
      // Removing someone else - require write access
      await requireBoardAccess(user, boardUid, 'write');

      // Prevent removing the board owner
      const board = await loadBoard(boardUid);
      if (!board) {
        throw new Error(t('boardNotFound'));
      }

      const owner = await getUserById(board.ownerId);
      if (owner && owner.email.toLowerCase() === email.toLowerCase()) {
        throw new Error(t('cannotRemoveOwner'));
      }
    }
    // Self-removal always allowed (users can leave any board they're a member of)

    await removeBoardMember(boardUid, email);

    revalidatePath(`/board/${boardUid}`);
    revalidatePath('/dashboard');
    boardEvents.emit({ boardUid, actorId: user.id });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Remove member error:', error);
    const errorMessage = error instanceof Error ? error.message : t('failedToRemoveMember');
    return {
      success: false,
      error: errorMessage,
    };
  }
}
