-- Migration 017: Add Community Invitations and Notifications
-- Adds ability to invite users to communities and notify about join requests/invitations

-- ============================================================================
-- STEP 1: CREATE COMMUNITY_INVITATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.community_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(community_id, invitee_id)
);

-- ============================================================================
-- STEP 2: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS community_invitations_community_id_idx ON public.community_invitations(community_id);
CREATE INDEX IF NOT EXISTS community_invitations_inviter_id_idx ON public.community_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS community_invitations_invitee_id_idx ON public.community_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS community_invitations_status_idx ON public.community_invitations(status);

-- ============================================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.community_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: CREATE RLS POLICIES FOR INVITATIONS
-- ============================================================================

-- Users can view invitations they sent or received
DROP POLICY IF EXISTS "Users can view their invitations" ON public.community_invitations;
CREATE POLICY "Users can view their invitations"
  ON public.community_invitations FOR SELECT
  USING (
    auth.uid() = inviter_id
    OR auth.uid() = invitee_id
    OR is_community_admin(community_id, auth.uid())
  );

-- Community admins/owners can send invitations
DROP POLICY IF EXISTS "Community admins can send invitations" ON public.community_invitations;
CREATE POLICY "Community admins can send invitations"
  ON public.community_invitations FOR INSERT
  WITH CHECK (
    auth.uid() = inviter_id
    AND is_community_admin(community_id, auth.uid())
  );

-- Invitees can update their own invitation status
DROP POLICY IF EXISTS "Invitees can respond to invitations" ON public.community_invitations;
CREATE POLICY "Invitees can respond to invitations"
  ON public.community_invitations FOR UPDATE
  USING (auth.uid() = invitee_id);

-- Community admins can delete invitations
DROP POLICY IF EXISTS "Community admins can delete invitations" ON public.community_invitations;
CREATE POLICY "Community admins can delete invitations"
  ON public.community_invitations FOR DELETE
  USING (
    auth.uid() = inviter_id
    OR is_community_admin(community_id, auth.uid())
  );

-- ============================================================================
-- STEP 5: CREATE NOTIFICATION TRIGGERS
-- ============================================================================

-- Trigger: Notify community admins when someone requests to join
CREATE OR REPLACE FUNCTION notify_community_admins_of_join_request()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
  community_name TEXT;
  requester_name TEXT;
BEGIN
  -- Only trigger for pending join requests
  IF NEW.status = 'pending' AND TG_OP = 'INSERT' THEN
    -- Get community name
    SELECT name INTO community_name FROM public.communities WHERE id = NEW.community_id;

    -- Get requester name
    SELECT name INTO requester_name FROM public.users WHERE id = NEW.user_id;

    -- Create notification for all admins and owners
    FOR admin_record IN
      SELECT user_id FROM public.community_members
      WHERE community_id = NEW.community_id
      AND role IN ('owner', 'admin')
      AND status = 'approved'
    LOOP
      INSERT INTO public.notifications (user_id, type, title, message, payload)
      VALUES (
        admin_record.user_id,
        'community_join_request',
        'New Join Request',
        requester_name || ' requested to join ' || community_name,
        jsonb_build_object(
          'community_id', NEW.community_id,
          'community_name', community_name,
          'requester_id', NEW.user_id,
          'requester_name', requester_name,
          'membership_id', NEW.id,
          'link', '/communities/' || NEW.community_id || '?tab=members'
        )
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_admins_of_join_request ON public.community_members;
CREATE TRIGGER notify_admins_of_join_request
  AFTER INSERT ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_community_admins_of_join_request();

-- Trigger: Notify user when invited to community
CREATE OR REPLACE FUNCTION notify_user_of_community_invitation()
RETURNS TRIGGER AS $$
DECLARE
  community_name TEXT;
  inviter_name TEXT;
BEGIN
  IF NEW.status = 'pending' AND TG_OP = 'INSERT' THEN
    -- Get community name
    SELECT name INTO community_name FROM public.communities WHERE id = NEW.community_id;

    -- Get inviter name
    SELECT name INTO inviter_name FROM public.users WHERE id = NEW.inviter_id;

    -- Create notification for invitee
    INSERT INTO public.notifications (user_id, type, title, message, payload)
    VALUES (
      NEW.invitee_id,
      'community_invitation',
      'Community Invitation',
      inviter_name || ' invited you to join ' || community_name,
      jsonb_build_object(
        'community_id', NEW.community_id,
        'community_name', community_name,
        'inviter_id', NEW.inviter_id,
        'inviter_name', inviter_name,
        'invitation_id', NEW.id,
        'link', '/communities/' || NEW.community_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_user_of_invitation ON public.community_invitations;
CREATE TRIGGER notify_user_of_invitation
  AFTER INSERT ON public.community_invitations
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_of_community_invitation();

-- Trigger: Auto-add to community when invitation accepted
CREATE OR REPLACE FUNCTION auto_join_on_invitation_accept()
RETURNS TRIGGER AS $$
BEGIN
  -- When invitation is accepted, add user as member
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Set responded_at timestamp
    NEW.responded_at = NOW();

    -- Insert into community_members (or update if exists)
    INSERT INTO public.community_members (community_id, user_id, role, status)
    VALUES (NEW.community_id, NEW.invitee_id, 'member', 'approved')
    ON CONFLICT (community_id, user_id)
    DO UPDATE SET status = 'approved', role = 'member';
  END IF;

  -- Set responded_at for rejections too
  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    NEW.responded_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_join_on_accept ON public.community_invitations;
CREATE TRIGGER auto_join_on_accept
  BEFORE UPDATE ON public.community_invitations
  FOR EACH ROW
  EXECUTE FUNCTION auto_join_on_invitation_accept();
