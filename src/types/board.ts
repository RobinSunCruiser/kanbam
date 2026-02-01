export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface CardLink {
  id: string;
  name: string;
  url: string;
}

export interface ActivityNote {
  id: string;
  text: string;
  createdBy: string; // email
  createdAt: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  columnId: string;
  assignee?: string; // email, defaults to creator
  checklist?: ChecklistItem[];
  links?: CardLink[];
  deadline?: string | null;
  activity?: ActivityNote[];
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
}

export interface BoardMember {
  email: string;
  privilege: 'read' | 'write';
}

export interface Board {
  uid: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  members: BoardMember[];
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
