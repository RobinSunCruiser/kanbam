import { z } from 'zod';
import { isValidColumnId } from '../constants';

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
 * Card validation schemas
 */

export const createCardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  columnId: z.string().refine(isValidColumnId, {
    message: 'Invalid column ID',
  }),
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
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
