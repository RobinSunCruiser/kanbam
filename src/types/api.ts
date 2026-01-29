import { Board, BoardMetadata, Card } from './board';
import { UserAuth } from './user';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  name: string;
  password: string;
}

export interface CreateBoardRequest {
  title: string;
  description?: string;
}

export interface UpdateBoardRequest {
  title?: string;
  description?: string;
}

export interface CreateCardRequest {
  title: string;
  description?: string;
  columnId: string;
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  columnId?: string;
  order?: number;
}

export interface MoveCardRequest {
  cardId: string;
  targetColumnId: string;
  newOrder: number;
}
