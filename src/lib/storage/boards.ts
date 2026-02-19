import { Board, BoardLabel, Card, Column, ChecklistItem, CardLink, ActivityNote, type ReminderOption } from '@/types/board';
import { NotFoundError, ValidationError } from '../utils/errors';
import { generateUid, isValidUid } from '../utils/uid';
import { getUserByEmail } from './users';
import { queryBoardByUid, queryBoardsByMemberEmail, upsertBoard, deleteBoardByUid, updateBoardOwner } from './db';

/** Remove board labels not referenced by any card */
function pruneOrphanedLabels(board: Board): void {
  const usedIds = new Set(Object.values(board.cards).flatMap(c => c.labelIds || []));
  board.labels = board.labels.filter(l => usedIds.has(l.id));
}

// ============================================================================
// BOARD CRUD OPERATIONS
// ============================================================================

/** Load board by UID - returns Board object or null if not found */
export async function loadBoard(uid: string): Promise<Board | null> {
  if (!isValidUid(uid)) {
    throw new ValidationError('Invalid board UID format');
  }

  const row = await queryBoardByUid(uid);
  if (!row) return null;

  const boardData = row.data;

  return {
    uid: row.uid,
    title: row.title,
    ownerId: row.ownerId,
    description: boardData.description,
    members: boardData.members || [],
    columns: boardData.columns || [],
    cards: boardData.cards || {},
    labels: boardData.labels || [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Save board to database (upsert) - inserts new or updates existing board */
export async function saveBoard(board: Board): Promise<void> {
  if (!isValidUid(board.uid)) {
    throw new ValidationError('Invalid board UID format');
  }

  const data = {
    description: board.description,
    members: board.members,
    columns: board.columns,
    cards: board.cards,
    labels: board.labels,
  };

  await upsertBoard(board.uid, board.title, board.ownerId, data, board.createdAt, board.updatedAt);
}

/** Delete board by UID - throws NotFoundError if board doesn't exist */
export async function deleteBoard(uid: string): Promise<void> {
  if (!isValidUid(uid)) {
    throw new ValidationError('Invalid board UID format');
  }

  const deleted = await deleteBoardByUid(uid);
  if (!deleted) {
    throw new NotFoundError('Board not found');
  }
}

/** List all boards where user is a member */
export async function listBoardsByEmail(email: string): Promise<Board[]> {
  const rows = await queryBoardsByMemberEmail(email);

  return rows.map(row => ({
    uid: row.uid,
    title: row.title,
    ownerId: row.ownerId,
    description: row.data.description,
    members: row.data.members || [],
    columns: row.data.columns || [],
    cards: row.data.cards || {},
    labels: row.data.labels || [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

// ============================================================================
// BOARD BUSINESS LOGIC
// ============================================================================

/** Create new board with default columns and owner as member */
export async function createBoard(
  data: Omit<Board, 'uid' | 'createdAt' | 'updatedAt' | 'columns' | 'cards' | 'members' | 'labels'>,
  ownerEmail: string
): Promise<Board> {
  const uid = generateUid();
  const now = new Date().toISOString();

  const board: Board = {
    ...data,
    uid,
    createdAt: now,
    updatedAt: now,
    members: [{ email: ownerEmail, privilege: 'write' }],
    columns: [
      { id: generateUid(), title: 'To Do', cardIds: [] },
      { id: generateUid(), title: 'In Progress', cardIds: [] },
      { id: generateUid(), title: 'Done', cardIds: [] },
    ],
    cards: {},
    labels: [],
  };

  await saveBoard(board);
  return board;
}

/** Update board title and/or description */
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

/** Get member's privilege level for a board - returns 'read', 'write', or null */
export async function getBoardMemberPrivilege(
  boardUid: string,
  email: string
): Promise<'read' | 'write' | null> {
  const board = await loadBoard(boardUid);
  if (!board) return null;

  const member = board.members?.find(
    m => m.email.toLowerCase() === email.toLowerCase()
  );

  return member?.privilege || null;
}

// ============================================================================
// BOARD MEMBER OPERATIONS
// ============================================================================

/** Add member to board or update their privilege if already member */
export async function addBoardMember(
  boardUid: string,
  email: string,
  privilege: 'read' | 'write'
): Promise<void> {
  const board = await loadBoard(boardUid);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  // Validate email belongs to registered user
  const user = await getUserByEmail(email);
  if (!user) {
    throw new ValidationError('User with this email does not exist');
  }

  const existingMember = board.members.find(
    m => m.email.toLowerCase() === email.toLowerCase()
  );

  if (existingMember) {
    existingMember.privilege = privilege;
  } else {
    board.members.push({ email: email.toLowerCase(), privilege });
  }

  board.updatedAt = new Date().toISOString();
  await saveBoard(board);
}

/** Remove member from board - deletes board if no members remain */
export async function removeBoardMember(
  boardUid: string,
  email: string
): Promise<void> {
  const board = await loadBoard(boardUid);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  board.members = board.members.filter(
    m => m.email.toLowerCase() !== email.toLowerCase()
  );

  // Delete board if no members left
  if (board.members.length === 0) {
    await deleteBoard(boardUid);
    return;
  }

  board.updatedAt = new Date().toISOString();
  await saveBoard(board);
}

/** Clear assignee from all cards on a board where the assignee matches the given email */
export async function clearAssigneeFromBoard(
  boardUid: string,
  email: string
): Promise<void> {
  const board = await loadBoard(boardUid);
  if (!board) return;

  const lowerEmail = email.toLowerCase();
  let changed = false;

  for (const card of Object.values(board.cards)) {
    if (card.assignee && card.assignee.toLowerCase() === lowerEmail) {
      card.assignee = undefined;
      card.updatedAt = new Date().toISOString();
      changed = true;
    }
  }

  if (changed) {
    board.updatedAt = new Date().toISOString();
    await saveBoard(board);
  }
}

/** Transfer board ownership to another member */
export async function transferBoardOwnership(
  boardUid: string,
  newOwnerEmail: string
): Promise<void> {
  const newOwner = await getUserByEmail(newOwnerEmail);
  if (!newOwner) {
    throw new ValidationError('New owner must be a registered user');
  }

  await updateBoardOwner(boardUid, newOwner.id);
}

// ============================================================================
// CARD OPERATIONS
// ============================================================================

/** Add new card to specified column */
export async function addCard(
  boardUid: string,
  cardData: { title: string; description?: string; columnId: string }
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
    id: generateUid(),
    title: cardData.title,
    description: cardData.description || '',
    createdAt: now,
    updatedAt: now,
    columnId: cardData.columnId,
    assignee: undefined,
    checklist: [],
    links: [],
    activity: [],
    deadline: null,
    reminder: null,
    labelIds: [],
  };

  board.cards[card.id] = card;
  column.cardIds.push(card.id);
  board.updatedAt = now;

  await saveBoard(board);
  return card;
}

/** Update card - handles text edits, column changes, and reordering */
export async function updateCard(
  boardUid: string,
  cardId: string,
  updates: {
    title?: string;
    description?: string;
    columnId?: string;
    order?: number;
    assignee?: string;
    checklist?: ChecklistItem[];
    links?: CardLink[];
    deadline?: string | null;
    reminder?: ReminderOption | null;
    activity?: ActivityNote[];
    labelIds?: string[];
  }
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

  // Update text fields
  if (updates.title !== undefined) card.title = updates.title;
  if (updates.description !== undefined) card.description = updates.description;

  // Update new fields
  if (updates.assignee !== undefined) card.assignee = updates.assignee;
  if (updates.checklist !== undefined) card.checklist = updates.checklist;
  if (updates.links !== undefined) card.links = updates.links;
  if (updates.deadline !== undefined) card.deadline = updates.deadline;
  if (updates.reminder !== undefined) card.reminder = updates.reminder;
  if (updates.activity !== undefined) card.activity = updates.activity;
  if (updates.labelIds !== undefined) {
    card.labelIds = updates.labelIds;
    pruneOrphanedLabels(board);
  }

  card.updatedAt = now;
  board.updatedAt = now;

  await saveBoard(board);
  return card;
}

/** Delete card from board */
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

  delete board.cards[cardId];
  pruneOrphanedLabels(board);

  board.updatedAt = new Date().toISOString();

  await saveBoard(board);
}

// ============================================================================
// BOARD LABEL OPERATIONS
// ============================================================================

/** Add a new label to the board */
export async function addBoardLabel(
  boardUid: string,
  data: { name: string; color: string }
): Promise<BoardLabel> {
  const board = await loadBoard(boardUid);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  const label: BoardLabel = {
    id: generateUid(),
    name: data.name,
    color: data.color,
  };

  board.labels.push(label);
  board.updatedAt = new Date().toISOString();

  await saveBoard(board);
  return label;
}

// ============================================================================
// COLUMN OPERATIONS
// ============================================================================

/** Add new column to board */
export async function addColumn(boardUid: string, title: string): Promise<Column> {
  const board = await loadBoard(boardUid);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  const newColumn: Column = {
    id: generateUid(),
    title,
    cardIds: [],
  };

  board.columns.push(newColumn);
  board.updatedAt = new Date().toISOString();

  await saveBoard(board);
  return newColumn;
}

/** Update column title */
export async function updateColumn(
  boardUid: string,
  columnId: string,
  title: string
): Promise<Column> {
  const board = await loadBoard(boardUid);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  const column = board.columns.find(c => c.id === columnId);
  if (!column) {
    throw new NotFoundError('Column not found');
  }

  column.title = title;
  board.updatedAt = new Date().toISOString();

  await saveBoard(board);
  return column;
}

/** Delete column from board (must be empty) */
export async function deleteColumn(boardUid: string, columnId: string): Promise<void> {
  const board = await loadBoard(boardUid);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  if (board.columns.length <= 1) {
    throw new ValidationError('Cannot delete the last column');
  }

  const column = board.columns.find(c => c.id === columnId);
  if (!column) {
    throw new NotFoundError('Column not found');
  }

  if (column.cardIds.length > 0) {
    throw new ValidationError('Cannot delete column with cards. Move or delete cards first.');
  }

  board.columns = board.columns.filter(c => c.id !== columnId);
  board.updatedAt = new Date().toISOString();

  await saveBoard(board);
}

/** Reorder column (move left or right) */
export async function reorderColumn(
  boardUid: string,
  columnId: string,
  direction: 'left' | 'right'
): Promise<Column[]> {
  const board = await loadBoard(boardUid);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  const currentIndex = board.columns.findIndex(c => c.id === columnId);
  if (currentIndex === -1) {
    throw new NotFoundError('Column not found');
  }

  const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

  if (newIndex < 0 || newIndex >= board.columns.length) {
    throw new ValidationError(`Cannot move column ${direction}`);
  }

  // Swap columns
  const temp = board.columns[currentIndex];
  board.columns[currentIndex] = board.columns[newIndex];
  board.columns[newIndex] = temp;

  board.updatedAt = new Date().toISOString();

  await saveBoard(board);
  return board.columns;
}