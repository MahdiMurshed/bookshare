/**
 * Shared constants for BookShare API
 * Re-exports from schemas.ts - types are inferred from Zod schemas
 */

// Re-export constants (arrays derived from Zod schemas)
export {
  BOOK_CONDITIONS,
  BORROW_REQUEST_STATUSES,
  HANDOVER_METHODS,
  RETURN_METHODS,
  ADMIN_NOTIFICATION_TYPES,
  USER_GROUPS,
} from './schemas.js';

// Re-export types (inferred from Zod schemas)
export type {
  BookCondition,
  BorrowRequestStatus,
  HandoverMethod,
  ReturnMethod,
  AdminNotificationType,
  UserGroup,
} from './schemas.js';
