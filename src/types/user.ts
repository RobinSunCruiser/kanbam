export type Privilege = 'read' | 'write';

export interface BoardAccess {
  boardUid: string;
  privilege: Privilege;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  boardAccess: BoardAccess[];
}

export interface UserAuth {
  id: string;
  email: string;
  name: string;
  boardAccess: BoardAccess[];
}

export interface UsersDatabase {
  users: User[];
}
