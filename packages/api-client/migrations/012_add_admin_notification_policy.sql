-- Migration: Add RLS policy for admins to send notifications
-- Description: Allow admin users to insert notifications for any user

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can insert notifications for any user" ON notifications;

-- Create policy to allow admins to insert notifications
CREATE POLICY "Admins can insert notifications for any user"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Ensure users can still read their own notifications (verify existing policy)
-- This should already exist, but we'll recreate it to be safe
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Ensure users can update their own notifications (for marking as read)
-- This should already exist, but we'll recreate it to be safe
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own notifications
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications"
ON notifications
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
