/**
 * Schemas barrel export
 * Re-exports all domain schemas from a single entry point
 */

// Book schemas
export {
  bookConditionSchema,
  bookFormSchema,
  editBookFormSchema,
  BOOK_CONDITIONS,
} from './book.js';
export type { BookCondition, BookFormValues, EditBookFormValues } from './book.js';

// Borrow request schemas
export {
  borrowRequestStatusSchema,
  handoverMethodSchema,
  returnMethodSchema,
  BORROW_REQUEST_STATUSES,
  HANDOVER_METHODS,
  RETURN_METHODS,
} from './borrowRequest.js';
export type { BorrowRequestStatus, HandoverMethod, ReturnMethod } from './borrowRequest.js';

// Notification schemas
export {
  adminNotificationTypeSchema,
  userGroupSchema,
  broadcastNotificationSchema,
  groupNotificationSchema,
  userNotificationSchema,
  ADMIN_NOTIFICATION_TYPES,
  USER_GROUPS,
  USER_GROUP_LABELS,
} from './notification.js';
export type {
  AdminNotificationType,
  UserGroup,
  BroadcastNotificationFormValues,
  GroupNotificationFormValues,
  UserNotificationFormValues,
} from './notification.js';
