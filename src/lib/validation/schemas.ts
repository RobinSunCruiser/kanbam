import { z } from 'zod';
import { isValidColumnId, COLUMN_TITLE_MAX_LENGTH } from '../constants';

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
  activity: z.array(activityNoteSchema).optional(),
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

export const removeMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * Type inference from schemas
 */

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
