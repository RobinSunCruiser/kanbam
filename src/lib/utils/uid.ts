import { nanoid } from 'nanoid';

export function generateUid(): string {
  return nanoid(16);
}

const UID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function isValidUid(uid: string): boolean {
  return UID_PATTERN.test(uid) && uid.length > 0 && uid.length <= 64;
}
