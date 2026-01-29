import { nanoid } from 'nanoid';

export function generateBoardUid(): string {
  return nanoid(12);
}

export function generateCardId(): string {
  return nanoid(16);
}

export function generateUserId(): string {
  return nanoid(16);
}

const UID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function isValidUid(uid: string): boolean {
  return UID_PATTERN.test(uid) && uid.length > 0 && uid.length <= 64;
}
