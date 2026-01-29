import { UserAuth } from '@/types/user';
import { getTokenFromCookie, verifyToken } from './session';
import { getUserById } from '../storage/users';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

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

  // Return UserAuth (without password hash)
  const userAuth: UserAuth = {
    id: user.id,
    email: user.email,
    name: user.name,
    boardAccess: user.boardAccess,
  };

  return userAuth;
}

export async function requireBoardAccess(
  user: UserAuth,
  boardUid: string,
  requiredPrivilege: 'read' | 'write'
): Promise<void> {
  const access = user.boardAccess.find(ba => ba.boardUid === boardUid);

  if (!access) {
    throw new ForbiddenError('No access to this board');
  }

  if (requiredPrivilege === 'write' && access.privilege === 'read') {
    throw new ForbiddenError('Read-only access');
  }
}

export function getUserBoardPrivilege(
  user: UserAuth,
  boardUid: string
): 'read' | 'write' | null {
  const access = user.boardAccess.find(ba => ba.boardUid === boardUid);
  return access?.privilege || null;
}
