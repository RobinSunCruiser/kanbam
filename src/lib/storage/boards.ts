import fs from 'fs/promises';
import lockfile from 'proper-lockfile';
import { Board, Card, ColumnType } from '@/types/board';
import { getBoardFilePath, BOARDS_DIR } from './paths';
import { NotFoundError, ValidationError } from '../utils/errors';
import { generateBoardUid, generateCardId, isValidUid } from '../utils/uid';

async function ensureBoardsDir() {
  try {
    await fs.mkdir(BOARDS_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore error
  }
}

export async function loadBoard(uid: string): Promise<Board | null> {
  if (!isValidUid(uid)) {
    throw new ValidationError('Invalid board UID format');
  }

  const filePath = getBoardFilePath(uid);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function retryRename(source: string, dest: string, maxRetries = 5): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // On Windows, try to delete the destination first
      if (process.platform === 'win32') {
        try {
          await fs.unlink(dest);
        } catch (error: any) {
          // File might not exist yet, that's okay
          if (error.code !== 'ENOENT') {
            // Wait a bit and retry
            await new Promise(resolve => setTimeout(resolve, 50 * (i + 1)));
          }
        }
      }
      await fs.rename(source, dest);
      return; // Success!
    } catch (error: any) {
      if (error.code === 'EPERM' && i < maxRetries - 1) {
        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
}

export async function saveBoard(board: Board): Promise<void> {
  if (!isValidUid(board.uid)) {
    throw new ValidationError('Invalid board UID format');
  }

  await ensureBoardsDir();

  const filePath = getBoardFilePath(board.uid);
  const tempFile = `${filePath}.tmp`;
  const data = JSON.stringify(board, null, 2);

  let release: (() => Promise<void>) | null = null;

  try {
    // Create file if it doesn't exist
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, '{}');
    }

    release = await lockfile.lock(filePath, { retries: 10 });

    // Write to temp file
    await fs.writeFile(tempFile, data, 'utf-8');

    // Atomic rename with retry logic for Windows
    await retryRename(tempFile, filePath);
  } catch (error) {
    // Clean up temp file on error
    try {
      await fs.unlink(tempFile);
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  } finally {
    if (release) {
      await release();
    }
  }
}

export async function deleteBoard(uid: string): Promise<void> {
  if (!isValidUid(uid)) {
    throw new ValidationError('Invalid board UID format');
  }

  const filePath = getBoardFilePath(uid);

  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new NotFoundError('Board not found');
    }
    throw error;
  }
}

export async function boardExists(uid: string): Promise<boolean> {
  if (!isValidUid(uid)) {
    return false;
  }

  const filePath = getBoardFilePath(uid);

  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function createBoard(
  data: Omit<Board, 'uid' | 'createdAt' | 'updatedAt' | 'columns' | 'cards'>
): Promise<Board> {
  const uid = generateBoardUid();
  const now = new Date().toISOString();

  const board: Board = {
    ...data,
    uid,
    createdAt: now,
    updatedAt: now,
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
