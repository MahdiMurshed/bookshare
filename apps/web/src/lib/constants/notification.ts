/**
 * Notification-related constants
 * Single source of truth for notification types across the application
 */

// Admin notification types (for admin-sent notifications)
export const ADMIN_NOTIFICATION_TYPES = ['announcement', 'alert', 'info'] as const;

// User groups for targeted notifications
export const USER_GROUPS = ['all', 'admins', 'borrowers', 'lenders', 'suspended'] as const;

// User group labels for UI
export const USER_GROUP_LABELS: Record<UserGroup, string> = {
  all: 'All Users',
  admins: 'Administrators',
  borrowers: 'Active Borrowers',
  lenders: 'Book Lenders',
  suspended: 'Suspended Users',
};

// Type exports - inferred from constants
export type AdminNotificationType = (typeof ADMIN_NOTIFICATION_TYPES)[number];
export type UserGroup = (typeof USER_GROUPS)[number];
