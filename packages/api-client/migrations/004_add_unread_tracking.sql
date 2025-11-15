-- Migration 004: Add Unread Message Tracking and Last Message Info
-- Enhances chat functionality with unread tracking and recent message display

-- ============================================================================
-- UPDATE MESSAGES TABLE - Add unread tracking
-- ============================================================================
ALTER TABLE public.messages
  ADD COLUMN read_by_owner BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN read_by_borrower BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for efficient unread queries
CREATE INDEX IF NOT EXISTS messages_unread_owner_idx
  ON public.messages(borrow_request_id, read_by_owner)
  WHERE read_by_owner = FALSE;

CREATE INDEX IF NOT EXISTS messages_unread_borrower_idx
  ON public.messages(borrow_request_id, read_by_borrower)
  WHERE read_by_borrower = FALSE;

-- ============================================================================
-- UPDATE BORROW_REQUESTS TABLE - Add last message info
-- ============================================================================
ALTER TABLE public.borrow_requests
  ADD COLUMN last_message_at TIMESTAMPTZ,
  ADD COLUMN last_message_content TEXT;

-- Index for sorting by recent activity (for chat list)
CREATE INDEX IF NOT EXISTS borrow_requests_last_message_at_idx
  ON public.borrow_requests(last_message_at DESC NULLS LAST);

-- ============================================================================
-- FUNCTION: Update last message info when new message inserted
-- ============================================================================
CREATE OR REPLACE FUNCTION update_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.borrow_requests
  SET
    last_message_at = NEW.created_at,
    last_message_content = LEFT(NEW.content, 100) -- Store first 100 chars
  WHERE id = NEW.borrow_request_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_message when new message is inserted
DROP TRIGGER IF EXISTS message_update_last_message ON public.messages;
CREATE TRIGGER message_update_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_message();

-- ============================================================================
-- BACKFILL: Set last_message for existing requests with messages
-- ============================================================================
UPDATE public.borrow_requests br
SET
  last_message_at = m.created_at,
  last_message_content = LEFT(m.content, 100)
FROM (
  SELECT DISTINCT ON (borrow_request_id)
    borrow_request_id,
    content,
    created_at
  FROM public.messages
  ORDER BY borrow_request_id, created_at DESC
) m
WHERE br.id = m.borrow_request_id;
