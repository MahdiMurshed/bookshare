/**
 * Book-related Zod schemas
 * Single source of truth for book validation and types
 */

import { z } from 'zod';

// ============================================================================
// Book Condition
// ============================================================================

export const bookConditionSchema = z.enum(['excellent', 'good', 'fair', 'poor']);
export type BookCondition = z.infer<typeof bookConditionSchema>;
export const BOOK_CONDITIONS = bookConditionSchema.options;

// ============================================================================
// Book Form Schemas
// ============================================================================

export const bookFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title is too long'),
  author: z.string().min(1, 'Author is required').max(200, 'Author name is too long'),
  isbn: z.string().max(20, 'ISBN must be less than 20 characters').optional().or(z.literal('')),
  genre: z.string().optional().or(z.literal('')),
  description: z.string().max(2000, 'Description is too long').optional().or(z.literal('')),
  cover_image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  condition: bookConditionSchema,
  borrowable: z.boolean(),
});
export type BookFormValues = z.infer<typeof bookFormSchema>;

export const editBookFormSchema = bookFormSchema.partial().required({
  title: true,
  author: true,
  condition: true,
  borrowable: true,
});
export type EditBookFormValues = z.infer<typeof editBookFormSchema>;
