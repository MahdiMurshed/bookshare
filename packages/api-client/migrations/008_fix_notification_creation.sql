-- Migration 008: Fix notification creation RLS issue
-- User A cannot create notifications for User B due to RLS policies.
-- Solution: Create a secure function to handle system-generated notifications.

-- Drop the overly permissive policy if it exists
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

-- Create a more restrictive policy: users can only create notifications for themselves
CREATE POLICY "Users can create own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a secure function to create notifications that bypasses RLS
-- This is used for system-generated notifications (messages, borrow requests, etc.)
CREATE OR REPLACE FUNCTION create_notification_secure(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_payload JSONB DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER -- Run with function owner's privileges (bypasses RLS)
SET search_path = public -- Security: prevent search_path attacks
LANGUAGE plpgsql
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Validate notification type
  IF p_type NOT IN ('borrow_request', 'request_approved', 'request_denied',
                     'book_returned', 'due_soon', 'overdue', 'new_message') THEN
    RAISE EXCEPTION 'Invalid notification type: %', p_type;
  END IF;

  -- Insert notification
  INSERT INTO public.notifications (user_id, type, title, message, payload, read)
  VALUES (p_user_id, p_type, p_title, p_message, p_payload, FALSE)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Update notification types to include 'new_message'
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('borrow_request', 'request_approved', 'request_denied',
                  'book_returned', 'due_soon', 'overdue', 'new_message'));

-- Add comment explaining the security model
COMMENT ON FUNCTION create_notification_secure IS
'Secure function to create system-generated notifications with elevated privileges.
Uses SECURITY DEFINER to bypass RLS policies. This is safe because the function
validates input and is only called by trusted application code.
Use this instead of direct INSERT for creating notifications for other users.';
