import { Board, Card, ColumnType } from '@/types/board';
import { NotFoundError, ValidationError } from '../utils/errors';
import { generateBoardUid, generateCardId, isValidUid } from '../utils/uid';
import { getUserByEmail } from './users';
import { sql } from './db';

export async function loadBoard(uid: string): Promise<Board | null> {
  if (!isValidUid(uid)) {
    throw new ValidationError('Invalid board UID format');
  }

  const result = await sql`
    SELECT uid, title, owner_id as "ownerId", data, created_at as "createdAt", updated_at as "updatedAt"
    FROM boards
    WHERE uid = ${uid}
  `;

  if (result.length === 0) return null;

  const row = result[0];
  const boardData = row.data;

  return {
    uid: row.uid,
    title: row.title,
    ownerId: row.ownerId,
    description: boardData.description,
    members: boardData.members || [],
    columns: boardData.columns || [],
    cards: boardData.cards || {},
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function saveBoard(board: Board): Promise<void> {
  if (!isValidUid(board.uid)) {
    throw new ValidationError('Invalid board UID format');
  }

  const data = {
    description: board.description,
    members: board.members,
    columns: board.columns,
    cards: board.cards,
  };

  await sql`
    INSERT INTO boards (uid, title, owner_id, data, created_at, updated_at)
    VALUES (${board.uid}, ${board.title}, ${board.ownerId}, ${JSON.stringify(data)}, ${board.createdAt}, ${board.updatedAt})
    ON CONFLICT (uid)
    DO UPDATE SET
      title = EXCLUDED.title,
      data = EXCLUDED.data,
      updated_at = EXCLUDED.updated_at
  `;
}

export async function deleteBoard(uid: string): Promise<void> {
  if (!isValidUid(uid)) {
    throw new ValidationError('Invalid board UID format');
  }

  const result = await sql`
    DELETE FROM boards
    WHERE uid = ${uid}
    RETURNING uid
  `;

  if (result.length === 0) {
    throw new NotFoundError('Board not found');
  }
}

export async function boardExists(uid: string): Promise<boolean> {
  if (!isValidUid(uid)) {
    return false;
  }

  const result = await sql`
    SELECT 1 FROM boards WHERE uid = ${uid}
  `;

  return result.length > 0;
}

export async function createBoard(
  data: Omit<Board, 'uid' | 'createdAt' | 'updatedAt' | 'columns' | 'cards' | 'members'>,
  ownerEmail: string
): Promise<Board> {
  const uid = generateBoardUid();
  const now = new Date().toISOString();

  const board: Board = {
    ...data,
    uid,
    createdAt: now,
    updatedAt: now,
    members: [
      {
        email: ownerEmail,
        privilege: 'write',
      },
    ],
    columns: [
      {
        id: 'todo',
        title: 'To Do',
        cardIds: [],
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        cardIds: [],
      },
      {
        id: 'done',
        title: 'Done',
        cardIds: [],
      },
    ],
    cards: {},
  };

  await saveBoard(board);
  return board;
}

export async function updateBoardMetadata(
  uid: string,
  updates: { title?: string; description?: string }
): Promise<Board> {
  const board = await loadBoard(uid);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  const updatedBoard: Board = {
    ...board,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await saveBoard(updatedBoard);
  return updatedBoard;
}

export async function addCard(
  boardUid: string,
  cardData: { title: string; description?: string; columnId: ColumnType }
): Promise<Card> {
  const board = await loadBoard(boardUid);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  const column = board.columns.find(c => c.id === cardData.columnId);
  if (!column) {
    throw new ValidationError('Invalid column ID');
  }

  const now = new Date().toISOString();
  const card: Card = {
    id: generateCardId(),
    title: cardData.title,
    description: cardData.description || '',
    createdAt: now,
    updatedAt: now,
    columnId: cardData.columnId,
  };

  board.cards[card.id] = card;
  column.cardIds.push(card.id);
  board.updatedAt = now;

  await saveBoard(board);
  return card;
}

export async function updateCard(
  boardUid: string,
  cardId: string,
  updates: { title?: string; description?: string; columnId?: ColumnType; order?: number }
): Promise<Card> {
  const board = await loadBoard(boardUid);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  const card = board.cards[cardId];
  if (!card) {
    throw new NotFoundError('Card not found');
  }

  const now = new Date().toISOString();

  // Handle column change or reordering
  if (updates.columnId || updates.order !== undefined) {
    const targetColumnId = updates.columnId || card.columnId;
    const oldColumn = board.columns.find(c => c.id === card.columnId);
    const newColumn = board.columns.find(c => c.id === targetColumnId);

    if (!newColumn) {
      throw new ValidationError('Invalid column ID');
    }

    // Remove from old column
    if (oldColumn) {
      oldColumn.cardIds = oldColumn.cardIds.filter(id => id !== cardId);
    }

    // Add to new column at specified position
    const targetIndex = updates.order !== undefined ? updates.order : newColumn.cardIds.length;
    newColumn.cardIds.splice(targetIndex, 0, cardId);

    // Update card's columnId if changed
    if (updates.columnId) {
      card.columnId = updates.columnId;
    }
  }

  // Update other fields
  if (updates.title !== undefined) card.title = updates.title;
  if (updates.description !== undefined) card.description = updates.description;

  card.updatedAt = now;
  board.updatedAt = now;

  await saveBoard(board);
  return card;
}

export async function deleteCard(boardUid: string, cardId: string): Promise<void> {
  const board = await loadBoard(boardUid);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  const card = board.cards[cardId];
  if (!card) {
    throw new NotFoundError('Card not found');
  }

  // Remove from column
  const column = board.columns.find(c => c.id === card.columnId);
  if (column) {
    column.cardIds = column.cardIds.filter(id => id !== cardId);
  }

  // Delete card
  delete board.cards[cardId];
  board.updatedAt = new Date().toISOString();

  await saveBoard(board);
}

export async function addBoardMember(
  boardUid: string,
  email: string,
  privilege: 'read' | 'write'
): Promise<void> {
  const board = await loadBoard(boardUid);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  // Check if email is registered
  const user = await getUserByEmail(email);
  if (!user) {
    throw new ValidationError('User with this email does not exist');
  }

  // Check if member already exists
  const existingMember = board.members.find(
    m => m.email.toLowerCase() === email.toLowerCase()
  );

  if (existingMember) {
    // Update privilege
    existingMember.privilege = privilege;
  } else {
    // Add new member
    board.members.push({ email: email.toLowerCase(), privilege });
  }

  board.updatedAt = new Date().toISOString();
  await saveBoard(board);
}

export async function removeBoardMember(
  boardUid: string,
  email: string
): Promise<void> {
  const board = await loadBoard(boardUid);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  // Remove member
  board.members = board.members.filter(
    m => m.email.toLowerCase() !== email.toLowerCase()
  );

  // If no members left, delete the board
  if (board.members.length === 0) {
    await deleteBoard(boardUid);
    return;
  }

  board.updatedAt = new Date().toISOString();
  await saveBoard(board);
}

export async function listBoardsByEmail(email: string): Promise<Board[]> {
  const result = await sql`
    SELECT uid, title, owner_id as "ownerId", data, created_at as "createdAt", updated_at as "updatedAt"
    FROM boards
    WHERE data->'members' @> ${JSON.stringify([{ email: email.toLowerCase() }])}::jsonb
  `;

  return result.map(row => ({
    uid: row.uid,
    title: row.title,
    ownerId: row.ownerId,
    description: row.data.description,
    members: row.data.members || [],
    columns: row.data.columns || [],
    cards: row.data.cards || {},
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function getBoardMemberPrivilege(
  boardUid: string,
  email: string
): Promise<'read' | 'write' | null> {
  const board = await loadBoard(boardUid);
  if (!board) {
    return null;
  }

  const member = board.members?.find(
    m => m.email.toLowerCase() === email.toLowerCase()
  );

  return member?.privilege || null;
}
