-- Migration 003: Create Messages Table
-- Add simple chat/messaging functionality for borrow requests

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
-- Messages allow borrowers and owners to communicate about a borrow request
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  borrow_request_id UUID NOT NULL REFERENCES public.borrow_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS messages_request_id_idx ON public.messages(borrow_request_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);

-- Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages for requests they're involved in (either as borrower or owner)
DROP POLICY IF EXISTS "Users can view messages for their requests" ON public.messages;
CREATE POLICY "Users can view messages for their requests"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.borrow_requests br
      WHERE br.id = borrow_request_id
      AND (br.borrower_id = auth.uid() OR br.owner_id = auth.uid())
    )
  );

-- Users can send messages for requests they're involved in
DROP POLICY IF EXISTS "Users can send messages for their requests" ON public.messages;
CREATE POLICY "Users can send messages for their requests"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.borrow_requests br
      WHERE br.id = borrow_request_id
      AND (br.borrower_id = auth.uid() OR br.owner_id = auth.uid())
    )
  );

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
