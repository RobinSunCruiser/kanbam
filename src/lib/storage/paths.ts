import path from 'path';

export const DATA_DIR = path.join(process.cwd(), 'data');
export const USERS_FILE = path.join(DATA_DIR, 'users.json');
export const BOARDS_DIR = path.join(DATA_DIR, 'boards');

export function getBoardFilePath(uid: string): string {
  return path.join(BOARDS_DIR, `${uid}.json`);
}
