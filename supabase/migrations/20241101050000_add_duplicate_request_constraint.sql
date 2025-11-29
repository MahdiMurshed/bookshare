-- Migration: Add unique constraint to prevent duplicate borrow requests
-- Prevents TOCTOU race condition by enforcing uniqueness at database level
-- A user cannot have multiple active requests for the same book

-- Drop index if it exists (for idempotency)
DROP INDEX IF EXISTS idx_unique_active_borrow_request;

-- Create partial unique index on (book_id, borrower_id) for active requests
-- Only enforces uniqueness for non-final statuses (pending, approved, handover_pending, borrowed)
CREATE UNIQUE INDEX idx_unique_active_borrow_request
ON public.borrow_requests (book_id, borrower_id)
WHERE status IN ('pending', 'approved', 'handover_pending', 'borrowed');

-- Add comment for documentation
COMMENT ON INDEX idx_unique_active_borrow_request IS
'Prevents duplicate active borrow requests for the same book by the same borrower. Only applies to non-final statuses.';
