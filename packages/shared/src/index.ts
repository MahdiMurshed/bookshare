/**
 * @repo/shared
 * Shared types, schemas, and constants for BookShare
 *
 * This package contains:
 * - Zod validation schemas (single source of truth)
 * - TypeScript types inferred from schemas
 * - Constants derived from schema definitions
 *
 * @example
 * ```typescript
 * import { bookFormSchema, BOOK_CONDITIONS } from '@repo/shared';
 * import type { BookCondition, BookFormValues } from '@repo/shared';
 * ```
 */

// Re-export everything from schemas
export * from './schemas/index.js';
