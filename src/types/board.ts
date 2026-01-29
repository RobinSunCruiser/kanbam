export type ColumnType = 'todo' | 'in-progress' | 'done';

export interface Card {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  columnId: ColumnType;
}

export interface Column {
  id: ColumnType;
  title: string;
  cardIds: string[];
}

export interface Board {
  uid: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  columns: Column[];
  cards: Record<string, Card>;
}

export interface BoardMetadata {
  uid: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  cardCount: number;
  privilege: 'read' | 'write';
}
