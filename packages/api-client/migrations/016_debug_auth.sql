-- Migration 016: Debug Authentication for Communities
-- Temporary query to check if auth is working

-- Check current user ID
SELECT auth.uid() as current_user_id;

-- Check if there are any users in the auth.users table
SELECT id, email FROM auth.users LIMIT 5;

-- Try to see what RLS policies are active on communities
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'communities';
