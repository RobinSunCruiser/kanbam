import { z } from 'zod';
import { isValidColumnId, COLUMN_TITLE_MAX_LENGTH, REMINDER_OPTIONS, LABEL_NAME_MAX_LENGTH, LABEL_COLORS } from '../constants';

/**
 * Authentication validation schemas
 */

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
});

/**
 * Board validation schemas
 */

export const createBoardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
});

export const updateBoardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long').optional(),
  description: z.string().max(500, 'Description is too long').optional(),
});

/**
 * Column validation schemas
 */

export const createColumnSchema = z.object({
  title: z
    .string()
    .min(1, 'Column title is required')
    .max(COLUMN_TITLE_MAX_LENGTH, 'Column title is too long'),
});

export const updateColumnSchema = z.object({
  title: z
    .string()
    .min(1, 'Column title is required')
    .max(COLUMN_TITLE_MAX_LENGTH, 'Column title is too long'),
});

/**
 * Board label validation schemas
 */

export const createBoardLabelSchema = z.object({
  name: z.string().min(1, 'Label name is required').max(LABEL_NAME_MAX_LENGTH, 'Label name is too long'),
  color: z.enum(LABEL_COLORS as unknown as [string, ...string[]]),
});

/**
 * Card validation schemas
 */

export const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Checklist item cannot be empty').max(200, 'Checklist item is too long'),
  checked: z.boolean(),
});

export const cardLinkSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Link name is required').max(100, 'Link name is too long'),
  url: z.string().url('Invalid URL'),
});

export const activityNoteSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Note cannot be empty').max(1000, 'Note is too long'),
  createdBy: z.string(),
  createdAt: z.string(),
});

export const createCardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  columnId: z.string().refine(isValidColumnId, {
    message: 'Invalid column ID',
  }),
  assignee: z.string().email().optional(),
  deadline: z.string().nullable().optional(),
});

export const updateCardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  description: z.string().max(2000, 'Description is too long').optional(),
  columnId: z
    .string()
    .refine(isValidColumnId, {
      message: 'Invalid column ID',
    })
    .optional(),
  order: z.number().int().nonnegative().optional(),
  assignee: z.union([z.string().email(), z.literal(''), z.undefined()]).optional(),
  checklist: z.array(checklistItemSchema).optional(),
  links: z.array(cardLinkSchema).optional(),
  deadline: z.string().nullable().optional(),
  reminder: z.enum(REMINDER_OPTIONS).nullable().optional(),
  activity: z.array(activityNoteSchema).optional(),
  labelIds: z.array(z.string()).optional(),
});

/**
 * Board member validation schemas
 */

export const addMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  privilege: z.enum(['read', 'write'], {
    message: 'Privilege must be "read" or "write"',
  }),
});

