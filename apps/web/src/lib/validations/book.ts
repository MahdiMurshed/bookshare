/**
 * Book validation schemas
 * Re-exported from @repo/api-client for convenience
 */

// Re-export all book schemas from api-client (single source of truth)
export {
  bookConditionSchema,
  bookFormSchema,
  editBookFormSchema,
} from '@repo/api-client';

// Re-export types
export type { BookFormValues, EditBookFormValues } from '@repo/api-client';
