-- Migration 007: Fix RLS issue with message trigger
-- The update_last_message() trigger was failing because it couldn't update
-- borrow_requests due to strict RLS policies. Make the function run with
-- elevated privileges to bypass RLS for this specific system operation.

-- Recreate the function with SECURITY DEFINER to bypass RLS
-- This allows the trigger to update last_message fields regardless of RLS policies
CREATE OR REPLACE FUNCTION update_last_message()
RETURNS TRIGGER
SECURITY DEFINER -- Run with function owner's privileges (bypasses RLS)
SET search_path = public -- Security: prevent search_path attacks
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.borrow_requests
  SET
    last_message_at = NEW.created_at,
    last_message_content = LEFT(NEW.content, 100)
  WHERE id = NEW.borrow_request_id;
  RETURN NEW;
END;
$$;

-- Add comment explaining the security model
COMMENT ON FUNCTION update_last_message() IS
'Trigger function to update last_message fields on borrow_requests when a message is inserted.
Uses SECURITY DEFINER to bypass RLS policies since this is a system operation that should
always succeed regardless of user permissions. The INSERT on messages already has proper
RLS checks to ensure users can only send messages for their requests.';
