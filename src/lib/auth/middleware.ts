import { UserAuth } from '@/types/user';
import { getTokenFromCookie, verifyToken } from './session';
import { getUserById } from '../storage/users';
import { getBoardMemberPrivilege } from '../storage/boards';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

/**
 * Checks authentication token
 * Throws error when not authenticated
 * Returns user object if authenticated
 * @returns
 */
export async function requireAuth(): Promise<UserAuth> {
  const token = await getTokenFromCookie();

  if (!token) {
    throw new UnauthorizedError('Not authenticated');
  }

  const payload = await verifyToken(token);

  if (!payload || !payload.userId) {
    throw new UnauthorizedError('Invalid token');
  }

  const user = await getUserById(payload.userId);

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  // Enforce email verification at middleware level (defense-in-depth)
  if (!user.emailVerified) {
    throw new UnauthorizedError('Email not verified');
  }

  // Return UserAuth (without password hash)
  const userAuth: UserAuth = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  return userAuth;
}

/**
 * When board access is needed requests access here from board with given user mail 
 * @param user 
 * @param boardUid 
 * @param requiredPrivilege 
 */
export async function requireBoardAccess(
  user: UserAuth,
  boardUid: string,
  requiredPrivilege: 'read' | 'write'
): Promise<void> {
  const privilege = await getBoardMemberPrivilege(boardUid, user.email);

  if (!privilege) {
    throw new ForbiddenError('No access to this board');
  }

  if (requiredPrivilege === 'write' && privilege === 'read') {
    throw new ForbiddenError('Read-only access');
  }
}

export async function getUserBoardPrivilege(
  user: UserAuth,
  boardUid: string
): Promise<'read' | 'write' | null> {
  return await getBoardMemberPrivilege(boardUid, user.email);
}
