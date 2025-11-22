/**
 * Notification-related Zod schemas
 * Single source of truth for notification validation and types
 */

import { z } from 'zod';

// ============================================================================
// Admin Notification Type
// ============================================================================

export const adminNotificationTypeSchema = z.enum(['announcement', 'alert', 'info']);
export type AdminNotificationType = z.infer<typeof adminNotificationTypeSchema>;
export const ADMIN_NOTIFICATION_TYPES = adminNotificationTypeSchema.options;

// ============================================================================
// User Group (for targeted notifications)
// ============================================================================

export const userGroupSchema = z.enum(['all', 'admins', 'borrowers', 'lenders', 'suspended']);
export type UserGroup = z.infer<typeof userGroupSchema>;
export const USER_GROUPS = userGroupSchema.options;

// User group labels for UI display
export const USER_GROUP_LABELS: Record<UserGroup, string> = {
  all: 'All Users',
  admins: 'Administrators',
  borrowers: 'Active Borrowers',
  lenders: 'Book Lenders',
  suspended: 'Suspended Users',
};

// ============================================================================
// Notification Form Schemas
// ============================================================================

export const broadcastNotificationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message must be less than 500 characters'),
  type: adminNotificationTypeSchema,
});
export type BroadcastNotificationFormValues = z.infer<typeof broadcastNotificationSchema>;

export const groupNotificationSchema = z.object({
  group: userGroupSchema,
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message must be less than 500 characters'),
  type: adminNotificationTypeSchema,
});
export type GroupNotificationFormValues = z.infer<typeof groupNotificationSchema>;

export const userNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message must be less than 500 characters'),
  type: adminNotificationTypeSchema,
});
export type UserNotificationFormValues = z.infer<typeof userNotificationSchema>;
