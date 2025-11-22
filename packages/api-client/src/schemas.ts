/**
 * Zod schemas for BookShare API
 * Single source of truth for validation schemas
 * Types are inferred from these schemas
 */

import { z } from 'zod';

// ============================================================================
// BOOK SCHEMAS
// ============================================================================

// Book condition enum schema
export const bookConditionSchema = z.enum(['excellent', 'good', 'fair', 'poor']);
export type BookCondition = z.infer<typeof bookConditionSchema>;

// Book conditions constant array (derived from schema)
export const BOOK_CONDITIONS = bookConditionSchema.options;

// Book form schema (for creating/editing books)
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

// Edit book form schema (all fields optional except required ones)
export const editBookFormSchema = bookFormSchema.partial().required({
  title: true,
  author: true,
  condition: true,
  borrowable: true,
});
export type EditBookFormValues = z.infer<typeof editBookFormSchema>;

// ============================================================================
// BORROW REQUEST SCHEMAS
// ============================================================================

// Borrow request status enum schema
export const borrowRequestStatusSchema = z.enum([
  'pending',
  'approved',
  'borrowed',
  'return_initiated',
  'returned',
  'denied',
]);
export type BorrowRequestStatus = z.infer<typeof borrowRequestStatusSchema>;
export const BORROW_REQUEST_STATUSES = borrowRequestStatusSchema.options;

// Handover method enum schema
export const handoverMethodSchema = z.enum(['ship', 'meetup', 'pickup']);
export type HandoverMethod = z.infer<typeof handoverMethodSchema>;
export const HANDOVER_METHODS = handoverMethodSchema.options;

// Return method enum schema
export const returnMethodSchema = z.enum(['ship', 'meetup', 'dropoff']);
export type ReturnMethod = z.infer<typeof returnMethodSchema>;
export const RETURN_METHODS = returnMethodSchema.options;

// ============================================================================
// NOTIFICATION SCHEMAS
// ============================================================================

// Admin notification type enum schema
export const adminNotificationTypeSchema = z.enum(['announcement', 'alert', 'info']);
export type AdminNotificationType = z.infer<typeof adminNotificationTypeSchema>;
export const ADMIN_NOTIFICATION_TYPES = adminNotificationTypeSchema.options;

// User group enum schema (for targeted notifications)
export const userGroupSchema = z.enum(['all', 'admins', 'borrowers', 'lenders', 'suspended']);
export type UserGroup = z.infer<typeof userGroupSchema>;
export const USER_GROUPS = userGroupSchema.options;

// Broadcast notification schema
export const broadcastNotificationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message must be less than 500 characters'),
  type: adminNotificationTypeSchema,
});
export type BroadcastNotificationFormValues = z.infer<typeof broadcastNotificationSchema>;

// Group notification schema
export const groupNotificationSchema = z.object({
  group: userGroupSchema,
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message must be less than 500 characters'),
  type: adminNotificationTypeSchema,
});
export type GroupNotificationFormValues = z.infer<typeof groupNotificationSchema>;

// User notification schema
export const userNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message must be less than 500 characters'),
  type: adminNotificationTypeSchema,
});
export type UserNotificationFormValues = z.infer<typeof userNotificationSchema>;
