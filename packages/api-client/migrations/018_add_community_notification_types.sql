-- Migration 018: Add Community Notification Types
-- Updates notification type constraint to include community notifications

-- ============================================================================
-- UPDATE NOTIFICATION TYPE CONSTRAINT
-- ============================================================================

-- Drop existing notification type constraint
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add updated constraint with community notification types
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'borrow_request',
    'request_approved',
    'request_denied',
    'book_returned',
    'due_soon',
    'overdue',
    'new_message',
    'community_join_request',  -- Community join request notification
    'community_invitation',    -- Community invitation notification
    'announcement',            -- Admin system notification
    'alert',                   -- Admin urgent alert
    'info'                     -- Admin informational message
  ));

-- Update comment documenting the types
COMMENT ON CONSTRAINT notifications_type_check ON public.notifications IS
'Validates notification types: user notifications (borrow_request, request_approved, request_denied, book_returned, due_soon, overdue, new_message), community notifications (community_join_request, community_invitation), and admin notifications (announcement, alert, info)';

-- ============================================================================
-- UPDATE SECURE NOTIFICATION FUNCTION
-- ============================================================================

-- Update the secure notification function to validate new community types
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
  -- Validate notification type (updated to include community types)
  IF p_type NOT IN (
    'borrow_request',
    'request_approved',
    'request_denied',
    'book_returned',
    'due_soon',
    'overdue',
    'new_message',
    'community_join_request',
    'community_invitation',
    'announcement',
    'alert',
    'info'
  ) THEN
    RAISE EXCEPTION 'Invalid notification type: %', p_type;
  END IF;

  -- Insert notification
  INSERT INTO public.notifications (user_id, type, title, message, payload, read)
  VALUES (p_user_id, p_type, p_title, p_message, p_payload, FALSE)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Update function comment
COMMENT ON FUNCTION create_notification_secure IS
'Secure function to create system-generated notifications with elevated privileges.
Uses SECURITY DEFINER to bypass RLS policies. Supports user, community, and admin notification types.
This is safe because the function validates input and is only called by trusted application code.';
