-- Migration: Add automatic user profile creation trigger
-- This fixes the RLS violation during signup by automatically creating
-- the user profile when a new auth user is created

-- ============================================================================
-- DROP OLD POLICY AND CREATE NEW ONE
-- ============================================================================

-- Drop the old policy that required auth.uid() during insert
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create a new policy that allows service role to insert (for triggers)
CREATE POLICY "Enable insert for service role"
  ON public.users FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Keep the authenticated user insert policy but make it permissive
CREATE POLICY "Enable insert for authenticated users matching their uid"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- CREATE TRIGGER FUNCTION
-- ============================================================================

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, bio)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CREATE TRIGGER
-- ============================================================================

-- Trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.users TO service_role;
