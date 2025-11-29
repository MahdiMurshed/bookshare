-- Migration 014: Create Communities Tables (FIXED v2)
-- Add community feature for sharing books within communities
-- Fixed: Infinite recursion in RLS policies

-- ============================================================================
-- STEP 1: CREATE ALL TABLES (without RLS policies)
-- ============================================================================

-- COMMUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COMMUNITY_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  status TEXT NOT NULL CHECK (status IN ('approved', 'pending')) DEFAULT 'pending',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- BOOK_COMMUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.book_communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(book_id, community_id)
);

-- COMMUNITY_ACTIVITY TABLE
CREATE TABLE IF NOT EXISTS public.community_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('member_joined', 'book_added', 'borrow_created', 'borrow_returned', 'review_posted')),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: CREATE INDEXES
-- ============================================================================

-- Communities indexes
CREATE INDEX IF NOT EXISTS communities_created_by_idx ON public.communities(created_by);
CREATE INDEX IF NOT EXISTS communities_is_private_idx ON public.communities(is_private);
CREATE INDEX IF NOT EXISTS communities_name_search_idx ON public.communities USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Community members indexes
CREATE INDEX IF NOT EXISTS community_members_community_id_idx ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS community_members_user_id_idx ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS community_members_status_idx ON public.community_members(status);

-- Book communities indexes
CREATE INDEX IF NOT EXISTS book_communities_book_id_idx ON public.book_communities(book_id);
CREATE INDEX IF NOT EXISTS book_communities_community_id_idx ON public.book_communities(community_id);

-- Community activity indexes
CREATE INDEX IF NOT EXISTS community_activity_community_id_idx ON public.community_activity(community_id);
CREATE INDEX IF NOT EXISTS community_activity_type_idx ON public.community_activity(type);
CREATE INDEX IF NOT EXISTS community_activity_created_at_idx ON public.community_activity(created_at DESC);

-- ============================================================================
-- STEP 3: CREATE HELPER FUNCTIONS (before RLS policies)
-- ============================================================================

-- Helper function to check if user is approved member (bypasses RLS)
CREATE OR REPLACE FUNCTION is_community_member(community_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = community_id_param
    AND user_id = user_id_param
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has admin/owner role (bypasses RLS)
CREATE OR REPLACE FUNCTION is_community_admin(community_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = community_id_param
    AND user_id = user_id_param
    AND role IN ('owner', 'admin')
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is owner (bypasses RLS)
CREATE OR REPLACE FUNCTION is_community_owner(community_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = community_id_param
    AND user_id = user_id_param
    AND role = 'owner'
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_activity ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: CREATE RLS POLICIES (using helper functions)
-- ============================================================================

-- COMMUNITIES POLICIES
DROP POLICY IF EXISTS "Anyone can view public communities" ON public.communities;
CREATE POLICY "Anyone can view public communities"
  ON public.communities FOR SELECT
  USING (
    is_private = false
    OR is_community_member(id, auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;
CREATE POLICY "Authenticated users can create communities"
  ON public.communities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Owners and admins can update communities" ON public.communities;
CREATE POLICY "Owners and admins can update communities"
  ON public.communities FOR UPDATE
  USING (is_community_admin(id, auth.uid()));

DROP POLICY IF EXISTS "Owners can delete communities" ON public.communities;
CREATE POLICY "Owners can delete communities"
  ON public.communities FOR DELETE
  USING (is_community_owner(id, auth.uid()));

-- COMMUNITY_MEMBERS POLICIES (simplified to avoid recursion)
DROP POLICY IF EXISTS "Members can view members in their communities" ON public.community_members;
CREATE POLICY "Members can view members in their communities"
  ON public.community_members FOR SELECT
  USING (
    -- User can always see their own membership
    user_id = auth.uid()
    -- Or user is an approved member of the community
    OR is_community_member(community_id, auth.uid())
  );

DROP POLICY IF EXISTS "Users can join communities" ON public.community_members;
CREATE POLICY "Users can join communities"
  ON public.community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners and admins can update members" ON public.community_members;
CREATE POLICY "Owners and admins can update members"
  ON public.community_members FOR UPDATE
  USING (is_community_admin(community_id, auth.uid()));

DROP POLICY IF EXISTS "Members can leave communities" ON public.community_members;
CREATE POLICY "Members can leave communities"
  ON public.community_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR is_community_admin(community_id, auth.uid())
  );

-- BOOK_COMMUNITIES POLICIES
DROP POLICY IF EXISTS "Members can view books in their communities" ON public.book_communities;
CREATE POLICY "Members can view books in their communities"
  ON public.book_communities FOR SELECT
  USING (
    is_community_member(community_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = community_id
      AND c.is_private = false
    )
  );

DROP POLICY IF EXISTS "Book owners can add books to their communities" ON public.book_communities;
CREATE POLICY "Book owners can add books to their communities"
  ON public.book_communities FOR INSERT
  WITH CHECK (
    auth.uid() = added_by
    AND EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = book_id
      AND b.owner_id = auth.uid()
    )
    AND is_community_member(community_id, auth.uid())
  );

DROP POLICY IF EXISTS "Owners and admins can remove books from communities" ON public.book_communities;
CREATE POLICY "Owners and admins can remove books from communities"
  ON public.book_communities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = book_id
      AND b.owner_id = auth.uid()
    )
    OR is_community_admin(community_id, auth.uid())
  );

-- COMMUNITY_ACTIVITY POLICIES
DROP POLICY IF EXISTS "Members can view activity in their communities" ON public.community_activity;
CREATE POLICY "Members can view activity in their communities"
  ON public.community_activity FOR SELECT
  USING (
    is_community_member(community_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = community_id
      AND c.is_private = false
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create activity" ON public.community_activity;
CREATE POLICY "Authenticated users can create activity"
  ON public.community_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STEP 6: CREATE TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Apply updated_at trigger to communities
DROP TRIGGER IF EXISTS update_communities_updated_at ON public.communities;
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-add creator as owner when creating a community
CREATE OR REPLACE FUNCTION add_community_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.community_members (community_id, user_id, role, status)
  VALUES (NEW.id, NEW.created_by, 'owner', 'approved');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS add_creator_as_owner ON public.communities;
CREATE TRIGGER add_creator_as_owner AFTER INSERT ON public.communities
  FOR EACH ROW EXECUTE FUNCTION add_community_creator_as_owner();

-- Create activity when member joins
CREATE OR REPLACE FUNCTION create_member_joined_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status = 'pending')) THEN
    INSERT INTO public.community_activity (community_id, type, user_id, metadata)
    VALUES (
      NEW.community_id,
      'member_joined',
      NEW.user_id,
      jsonb_build_object('member_id', NEW.user_id, 'role', NEW.role)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS create_member_joined_activity_trigger ON public.community_members;
CREATE TRIGGER create_member_joined_activity_trigger AFTER INSERT OR UPDATE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION create_member_joined_activity();

-- Create activity when book is added to community
CREATE OR REPLACE FUNCTION create_book_added_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.community_activity (community_id, type, user_id, metadata)
  VALUES (
    NEW.community_id,
    'book_added',
    NEW.added_by,
    jsonb_build_object('book_id', NEW.book_id, 'added_by', NEW.added_by)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS create_book_added_activity_trigger ON public.book_communities;
CREATE TRIGGER create_book_added_activity_trigger AFTER INSERT ON public.book_communities
  FOR EACH ROW EXECUTE FUNCTION create_book_added_activity();
