export type Privilege = 'read' | 'write';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface UserAuth {
  id: string;
  email: string;
  name: string;
}

export interface UsersDatabase {
  users: User[];
}
