-- Migration 010: Fix infinite recursion in admin RLS policies
-- The admin policies were causing infinite recursion by querying the users
-- table within policies on the users table itself.

-- Solution: Drop the conflicting admin policies. Admin access will be handled
-- at the application level through the admin API functions, not through RLS.

-- Drop all the problematic admin RLS policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all books" ON public.books;
DROP POLICY IF EXISTS "Admins can view all borrow_requests" ON public.borrow_requests;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;

-- Keep the is_admin column and index - they're still useful
-- The is_admin function is also fine since it uses SECURITY DEFINER

-- Update the is_admin function to be more efficient
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- This bypasses RLS
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND is_admin = TRUE
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_user_admin(UUID) TO authenticated;

COMMENT ON FUNCTION public.is_user_admin IS
'Check if a user has admin privileges. Uses SECURITY DEFINER to bypass RLS.
Admin data access is handled at the application layer through admin API functions.';

-- Note: Admin users will access data through the admin API functions in
-- packages/api-client/src/admin.ts, which handle authorization checks
-- at the application level rather than through RLS policies.
