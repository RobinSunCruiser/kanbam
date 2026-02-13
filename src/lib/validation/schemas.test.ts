import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createBoardSchema,
  updateBoardSchema,
  createColumnSchema,
  updateColumnSchema,
  checklistItemSchema,
  cardLinkSchema,
  activityNoteSchema,
  createCardSchema,
  updateCardSchema,
  addMemberSchema,
} from './schemas';

describe('loginSchema', () => {
  it('accepts valid input', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'secret' });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({ password: 'secret' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' });
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('signupSchema', () => {
  const valid = { name: 'Alice', email: 'alice@example.com', password: 'password123' };

  it('accepts valid input', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(signupSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    expect(signupSchema.safeParse({ ...valid, name: 'a'.repeat(101) }).success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    expect(signupSchema.safeParse({ ...valid, password: 'short' }).success).toBe(false);
  });

  it('rejects password longer than 100 characters', () => {
    expect(signupSchema.safeParse({ ...valid, password: 'a'.repeat(101) }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(signupSchema.safeParse({ ...valid, email: 'bad' }).success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'bad' }).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('accepts valid password', () => {
    expect(resetPasswordSchema.safeParse({ password: 'newpass12' }).success).toBe(true);
  });

  it('rejects too short password', () => {
    expect(resetPasswordSchema.safeParse({ password: '1234567' }).success).toBe(false);
  });

  it('rejects too long password', () => {
    expect(resetPasswordSchema.safeParse({ password: 'a'.repeat(101) }).success).toBe(false);
  });
});

describe('createBoardSchema', () => {
  it('accepts valid input with title only', () => {
    expect(createBoardSchema.safeParse({ title: 'My Board' }).success).toBe(true);
  });

  it('accepts valid input with title and description', () => {
    expect(createBoardSchema.safeParse({ title: 'Board', description: 'Details' }).success).toBe(true);
  });

  it('rejects empty title', () => {
    expect(createBoardSchema.safeParse({ title: '' }).success).toBe(false);
  });

  it('rejects title longer than 100 characters', () => {
    expect(createBoardSchema.safeParse({ title: 'a'.repeat(101) }).success).toBe(false);
  });

  it('rejects description longer than 500 characters', () => {
    expect(createBoardSchema.safeParse({ title: 'ok', description: 'a'.repeat(501) }).success).toBe(false);
  });
});

describe('updateBoardSchema', () => {
  it('accepts empty object (all optional)', () => {
    expect(updateBoardSchema.safeParse({}).success).toBe(true);
  });

  it('rejects empty title string when provided', () => {
    expect(updateBoardSchema.safeParse({ title: '' }).success).toBe(false);
  });

  it('rejects description longer than 500 characters', () => {
    expect(updateBoardSchema.safeParse({ description: 'a'.repeat(501) }).success).toBe(false);
  });
});

describe('createColumnSchema', () => {
  it('accepts valid title', () => {
    expect(createColumnSchema.safeParse({ title: 'To Do' }).success).toBe(true);
  });

  it('rejects empty title', () => {
    expect(createColumnSchema.safeParse({ title: '' }).success).toBe(false);
  });

  it('rejects title longer than 50 characters', () => {
    expect(createColumnSchema.safeParse({ title: 'a'.repeat(51) }).success).toBe(false);
  });

  it('accepts exactly 50 characters', () => {
    expect(createColumnSchema.safeParse({ title: 'a'.repeat(50) }).success).toBe(true);
  });
});

describe('updateColumnSchema', () => {
  it('accepts valid title', () => {
    expect(updateColumnSchema.safeParse({ title: 'Done' }).success).toBe(true);
  });

  it('rejects empty title', () => {
    expect(updateColumnSchema.safeParse({ title: '' }).success).toBe(false);
  });

  it('rejects title longer than 50 characters', () => {
    expect(updateColumnSchema.safeParse({ title: 'a'.repeat(51) }).success).toBe(false);
  });
});

describe('checklistItemSchema', () => {
  it('accepts valid input', () => {
    expect(checklistItemSchema.safeParse({ id: '1', text: 'Task', checked: false }).success).toBe(true);
  });

  it('rejects empty text', () => {
    expect(checklistItemSchema.safeParse({ id: '1', text: '', checked: false }).success).toBe(false);
  });

  it('rejects text longer than 200 characters', () => {
    expect(checklistItemSchema.safeParse({ id: '1', text: 'a'.repeat(201), checked: false }).success).toBe(false);
  });

  it('rejects missing checked field', () => {
    expect(checklistItemSchema.safeParse({ id: '1', text: 'Task' }).success).toBe(false);
  });
});

describe('cardLinkSchema', () => {
  it('accepts valid input', () => {
    expect(cardLinkSchema.safeParse({ id: '1', name: 'Docs', url: 'https://example.com' }).success).toBe(true);
  });

  it('rejects invalid URL', () => {
    expect(cardLinkSchema.safeParse({ id: '1', name: 'Docs', url: 'not-a-url' }).success).toBe(false);
  });

  it('rejects empty name', () => {
    expect(cardLinkSchema.safeParse({ id: '1', name: '', url: 'https://example.com' }).success).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    expect(cardLinkSchema.safeParse({ id: '1', name: 'a'.repeat(101), url: 'https://example.com' }).success).toBe(false);
  });
});

describe('activityNoteSchema', () => {
  it('accepts valid input', () => {
    const result = activityNoteSchema.safeParse({
      id: '1', text: 'Note', createdBy: 'user@test.com', createdAt: '2025-01-01T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty text', () => {
    const result = activityNoteSchema.safeParse({
      id: '1', text: '', createdBy: 'user', createdAt: '2025-01-01T00:00:00Z',
    });
    expect(result.success).toBe(false);
  });

  it('rejects text longer than 1000 characters', () => {
    const result = activityNoteSchema.safeParse({
      id: '1', text: 'a'.repeat(1001), createdBy: 'user', createdAt: '2025-01-01T00:00:00Z',
    });
    expect(result.success).toBe(false);
  });
});

describe('createCardSchema', () => {
  const validColumnId = 'abcdef1234567890';
  const valid = { title: 'Card', columnId: validColumnId };

  it('accepts valid input', () => {
    expect(createCardSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty title', () => {
    expect(createCardSchema.safeParse({ ...valid, title: '' }).success).toBe(false);
  });

  it('rejects title longer than 200 characters', () => {
    expect(createCardSchema.safeParse({ ...valid, title: 'a'.repeat(201) }).success).toBe(false);
  });

  it('rejects description longer than 2000 characters', () => {
    expect(createCardSchema.safeParse({ ...valid, description: 'a'.repeat(2001) }).success).toBe(false);
  });

  it('rejects invalid columnId', () => {
    expect(createCardSchema.safeParse({ ...valid, columnId: '!!invalid!!' }).success).toBe(false);
  });

  it('validates assignee as email when present', () => {
    expect(createCardSchema.safeParse({ ...valid, assignee: 'user@test.com' }).success).toBe(true);
    expect(createCardSchema.safeParse({ ...valid, assignee: 'not-email' }).success).toBe(false);
  });

  it('accepts nullable deadline', () => {
    expect(createCardSchema.safeParse({ ...valid, deadline: null }).success).toBe(true);
    expect(createCardSchema.safeParse({ ...valid, deadline: '2025-06-15' }).success).toBe(true);
  });
});

describe('updateCardSchema', () => {
  it('accepts empty object (all optional)', () => {
    expect(updateCardSchema.safeParse({}).success).toBe(true);
  });

  it('validates title when present', () => {
    expect(updateCardSchema.safeParse({ title: '' }).success).toBe(false);
    expect(updateCardSchema.safeParse({ title: 'Valid' }).success).toBe(true);
  });

  it('validates order as non-negative integer', () => {
    expect(updateCardSchema.safeParse({ order: 0 }).success).toBe(true);
    expect(updateCardSchema.safeParse({ order: -1 }).success).toBe(false);
    expect(updateCardSchema.safeParse({ order: 1.5 }).success).toBe(false);
  });

  it('validates reminder as one of REMINDER_OPTIONS or null', () => {
    expect(updateCardSchema.safeParse({ reminder: '1d' }).success).toBe(true);
    expect(updateCardSchema.safeParse({ reminder: '2w' }).success).toBe(true);
    expect(updateCardSchema.safeParse({ reminder: null }).success).toBe(true);
    expect(updateCardSchema.safeParse({ reminder: '5d' }).success).toBe(false);
  });

  it('validates checklist array items', () => {
    const valid = { checklist: [{ id: '1', text: 'item', checked: true }] };
    expect(updateCardSchema.safeParse(valid).success).toBe(true);

    const invalid = { checklist: [{ id: '1', text: '', checked: true }] };
    expect(updateCardSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates links array items', () => {
    const valid = { links: [{ id: '1', name: 'link', url: 'https://example.com' }] };
    expect(updateCardSchema.safeParse(valid).success).toBe(true);

    const invalid = { links: [{ id: '1', name: 'link', url: 'bad' }] };
    expect(updateCardSchema.safeParse(invalid).success).toBe(false);
  });

  it('accepts assignee as email, empty string, or undefined', () => {
    expect(updateCardSchema.safeParse({ assignee: 'a@b.com' }).success).toBe(true);
    expect(updateCardSchema.safeParse({ assignee: '' }).success).toBe(true);
    expect(updateCardSchema.safeParse({ assignee: undefined }).success).toBe(true);
  });
});

describe('addMemberSchema', () => {
  it('accepts valid input', () => {
    expect(addMemberSchema.safeParse({ email: 'a@b.com', privilege: 'read' }).success).toBe(true);
    expect(addMemberSchema.safeParse({ email: 'a@b.com', privilege: 'write' }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(addMemberSchema.safeParse({ email: 'bad', privilege: 'read' }).success).toBe(false);
  });

  it('rejects invalid privilege', () => {
    expect(addMemberSchema.safeParse({ email: 'a@b.com', privilege: 'admin' }).success).toBe(false);
  });
});
