-- Migration 014: Create Communities Tables
-- Add community feature for sharing books within communities

-- ============================================================================
-- COMMUNITIES TABLE
-- ============================================================================
-- Communities allow users to create groups for sharing books
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

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS communities_created_by_idx ON public.communities(created_by);
CREATE INDEX IF NOT EXISTS communities_is_private_idx ON public.communities(is_private);
CREATE INDEX IF NOT EXISTS communities_name_search_idx ON public.communities USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Row Level Security (RLS)
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Anyone can view public communities
CREATE POLICY "Anyone can view public communities"
  ON public.communities FOR SELECT
  USING (
    is_private = false
    OR EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = id
      AND cm.user_id = auth.uid()
      AND cm.status = 'approved'
    )
  );

-- Authenticated users can create communities
CREATE POLICY "Authenticated users can create communities"
  ON public.communities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Community owners and admins can update communities
CREATE POLICY "Owners and admins can update communities"
  ON public.communities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'approved'
    )
  );

-- Only owners can delete communities
CREATE POLICY "Owners can delete communities"
  ON public.communities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = id
      AND cm.user_id = auth.uid()
      AND cm.role = 'owner'
      AND cm.status = 'approved'
    )
  );

-- ============================================================================
-- COMMUNITY_MEMBERS TABLE
-- ============================================================================
-- Tracks community membership and roles
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  status TEXT NOT NULL CHECK (status IN ('approved', 'pending')) DEFAULT 'pending',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS community_members_community_id_idx ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS community_members_user_id_idx ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS community_members_status_idx ON public.community_members(status);

-- Row Level Security (RLS)
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Members can view other members in their communities
CREATE POLICY "Members can view members in their communities"
  ON public.community_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'approved'
    )
    OR user_id = auth.uid()
  );

-- Users can join communities (status depends on community settings)
CREATE POLICY "Users can join communities"
  ON public.community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owners and admins can update member roles and status
CREATE POLICY "Owners and admins can update members"
  ON public.community_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'approved'
    )
  );

-- Members can leave communities (delete their membership)
CREATE POLICY "Members can leave communities"
  ON public.community_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'approved'
    )
  );

-- ============================================================================
-- BOOK_COMMUNITIES TABLE
-- ============================================================================
-- Many-to-many relationship between books and communities
CREATE TABLE IF NOT EXISTS public.book_communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(book_id, community_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS book_communities_book_id_idx ON public.book_communities(book_id);
CREATE INDEX IF NOT EXISTS book_communities_community_id_idx ON public.book_communities(community_id);

-- Row Level Security (RLS)
ALTER TABLE public.book_communities ENABLE ROW LEVEL SECURITY;

-- Members can view books in their communities
CREATE POLICY "Members can view books in their communities"
  ON public.book_communities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'approved'
    )
    OR EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = community_id
      AND c.is_private = false
    )
  );

-- Book owners can add their books to communities they're members of
CREATE POLICY "Book owners can add books to their communities"
  ON public.book_communities FOR INSERT
  WITH CHECK (
    auth.uid() = added_by
    AND EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = book_id
      AND b.owner_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'approved'
    )
  );

-- Book owners and community admins can remove books
CREATE POLICY "Owners and admins can remove books from communities"
  ON public.book_communities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = book_id
      AND b.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'approved'
    )
  );

-- ============================================================================
-- COMMUNITY_ACTIVITY TABLE
-- ============================================================================
-- Track activity feed for communities
CREATE TABLE IF NOT EXISTS public.community_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('member_joined', 'book_added', 'borrow_created', 'borrow_returned', 'review_posted')),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS community_activity_community_id_idx ON public.community_activity(community_id);
CREATE INDEX IF NOT EXISTS community_activity_type_idx ON public.community_activity(type);
CREATE INDEX IF NOT EXISTS community_activity_created_at_idx ON public.community_activity(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.community_activity ENABLE ROW LEVEL SECURITY;

-- Members can view activity in their communities
CREATE POLICY "Members can view activity in their communities"
  ON public.community_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'approved'
    )
    OR EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = community_id
      AND c.is_private = false
    )
  );

-- System can create activity records
CREATE POLICY "Authenticated users can create activity"
  ON public.community_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Apply updated_at trigger to communities
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

CREATE TRIGGER create_book_added_activity_trigger AFTER INSERT ON public.book_communities
  FOR EACH ROW EXECUTE FUNCTION create_book_added_activity();
