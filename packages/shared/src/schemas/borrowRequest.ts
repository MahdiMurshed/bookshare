/**
 * Borrow Request-related Zod schemas
 * Single source of truth for borrow request validation and types
 */

import { z } from 'zod';

// ============================================================================
// Borrow Request Status
// ============================================================================

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

// ============================================================================
// Handover Method
// ============================================================================

export const handoverMethodSchema = z.enum(['ship', 'meetup', 'pickup']);
export type HandoverMethod = z.infer<typeof handoverMethodSchema>;
export const HANDOVER_METHODS = handoverMethodSchema.options;

// ============================================================================
// Return Method
// ============================================================================

export const returnMethodSchema = z.enum(['ship', 'meetup', 'dropoff']);
export type ReturnMethod = z.infer<typeof returnMethodSchema>;
export const RETURN_METHODS = returnMethodSchema.options;
