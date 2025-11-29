-- Migration 019: Enhance Community Activity Tracking
-- Adds comprehensive activity tracking for all community operations

-- ============================================================================
-- STEP 1: UPDATE ACTIVITY TYPE CONSTRAINT
-- ============================================================================

-- Drop existing constraint
ALTER TABLE public.community_activity
  DROP CONSTRAINT IF EXISTS community_activity_type_check;

-- Add expanded constraint with all activity types
ALTER TABLE public.community_activity
  ADD CONSTRAINT community_activity_type_check
  CHECK (type IN (
    -- Member activities
    'member_joined',
    'member_left',
    'member_removed',
    'member_role_changed',
    'join_request_created',
    'join_request_approved',
    'join_request_denied',

    -- Invitation activities
    'user_invited',
    'invitation_accepted',
    'invitation_rejected',
    'invitation_cancelled',

    -- Book activities
    'book_added',
    'book_removed',

    -- Community lifecycle
    'community_created',
    'community_updated',
    'community_deleted',
    'ownership_transferred',

    -- Legacy types (keep for backward compatibility)
    'borrow_created',
    'borrow_returned',
    'review_posted'
  ));

-- ============================================================================
-- STEP 2: CREATE ACTIVITY TRACKING TRIGGERS
-- ============================================================================

-- ============================================================================
-- TRIGGER: Track when member leaves
-- ============================================================================

CREATE OR REPLACE FUNCTION track_member_left()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track when a member voluntarily leaves (status changes from approved to anything else)
  IF OLD.status = 'approved' AND NEW.status != 'approved' AND TG_OP = 'UPDATE' THEN
    INSERT INTO public.community_activity (community_id, type, user_id, metadata)
    VALUES (
      OLD.community_id,
      'member_left',
      OLD.user_id,
      jsonb_build_object('member_id', OLD.user_id, 'previous_role', OLD.role)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_member_left_trigger ON public.community_members;
CREATE TRIGGER track_member_left_trigger
  AFTER UPDATE ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION track_member_left();

-- ============================================================================
-- TRIGGER: Track when member is removed (DELETE)
-- ============================================================================

CREATE OR REPLACE FUNCTION track_member_removed()
RETURNS TRIGGER AS $$
BEGIN
  -- Track when a member is deleted/removed (by admin action)
  IF OLD.status = 'approved' THEN
    INSERT INTO public.community_activity (community_id, type, user_id, metadata)
    VALUES (
      OLD.community_id,
      'member_removed',
      OLD.user_id,
      jsonb_build_object('member_id', OLD.user_id, 'previous_role', OLD.role)
    );
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_member_removed_trigger ON public.community_members;
CREATE TRIGGER track_member_removed_trigger
  BEFORE DELETE ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION track_member_removed();

-- ============================================================================
-- TRIGGER: Track member role changes
-- ============================================================================

CREATE OR REPLACE FUNCTION track_member_role_changed()
RETURNS TRIGGER AS $$
BEGIN
  -- Track when member role changes (excluding initial join)
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO public.community_activity (community_id, type, user_id, metadata)
    VALUES (
      NEW.community_id,
      'member_role_changed',
      NEW.user_id,
      jsonb_build_object(
        'member_id', NEW.user_id,
        'old_role', OLD.role,
        'new_role', NEW.role
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_member_role_changed_trigger ON public.community_members;
CREATE TRIGGER track_member_role_changed_trigger
  AFTER UPDATE ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION track_member_role_changed();

-- ============================================================================
-- TRIGGER: Track book removal
-- ============================================================================

CREATE OR REPLACE FUNCTION track_book_removed()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.community_activity (community_id, type, user_id, metadata)
  VALUES (
    OLD.community_id,
    'book_removed',
    OLD.added_by,
    jsonb_build_object('book_id', OLD.book_id)
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_book_removed_trigger ON public.book_communities;
CREATE TRIGGER track_book_removed_trigger
  BEFORE DELETE ON public.book_communities
  FOR EACH ROW
  EXECUTE FUNCTION track_book_removed();

-- ============================================================================
-- TRIGGER: Track community creation
-- ============================================================================

CREATE OR REPLACE FUNCTION track_community_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.community_activity (community_id, type, user_id, metadata)
  VALUES (
    NEW.id,
    'community_created',
    NEW.created_by,
    jsonb_build_object(
      'name', NEW.name,
      'is_private', NEW.is_private
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_community_created_trigger ON public.communities;
CREATE TRIGGER track_community_created_trigger
  AFTER INSERT ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION track_community_created();

-- ============================================================================
-- TRIGGER: Track community updates
-- ============================================================================

CREATE OR REPLACE FUNCTION track_community_updated()
RETURNS TRIGGER AS $$
DECLARE
  changes JSONB := '{}'::jsonb;
  has_changes BOOLEAN := false;
BEGIN
  -- Track significant changes
  IF OLD.name != NEW.name THEN
    changes := changes || jsonb_build_object('name_changed', jsonb_build_object('from', OLD.name, 'to', NEW.name));
    has_changes := true;
  END IF;

  IF OLD.description IS DISTINCT FROM NEW.description THEN
    changes := changes || jsonb_build_object('description_changed', true);
    has_changes := true;
  END IF;

  IF OLD.is_private != NEW.is_private THEN
    changes := changes || jsonb_build_object('privacy_changed', jsonb_build_object('from', OLD.is_private, 'to', NEW.is_private));
    has_changes := true;
  END IF;

  IF OLD.location IS DISTINCT FROM NEW.location THEN
    changes := changes || jsonb_build_object('location_changed', true);
    has_changes := true;
  END IF;

  -- Only create activity if there were actual changes
  IF has_changes THEN
    INSERT INTO public.community_activity (community_id, type, user_id, metadata)
    VALUES (
      NEW.id,
      'community_updated',
      auth.uid(),  -- Current user making the update
      changes
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_community_updated_trigger ON public.communities;
CREATE TRIGGER track_community_updated_trigger
  AFTER UPDATE ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION track_community_updated();

-- ============================================================================
-- TRIGGER: Track join request creation
-- ============================================================================

CREATE OR REPLACE FUNCTION track_join_request_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Track when someone requests to join (status is pending on INSERT)
  IF NEW.status = 'pending' AND TG_OP = 'INSERT' AND NEW.role = 'member' THEN
    INSERT INTO public.community_activity (community_id, type, user_id, metadata)
    VALUES (
      NEW.community_id,
      'join_request_created',
      NEW.user_id,
      jsonb_build_object('requester_id', NEW.user_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_join_request_created_trigger ON public.community_members;
CREATE TRIGGER track_join_request_created_trigger
  AFTER INSERT ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION track_join_request_created();

-- ============================================================================
-- TRIGGER: Track join request approval/denial
-- ============================================================================

CREATE OR REPLACE FUNCTION track_join_request_decision()
RETURNS TRIGGER AS $$
BEGIN
  -- Track when join request is approved
  IF OLD.status = 'pending' AND NEW.status = 'approved' AND TG_OP = 'UPDATE' THEN
    INSERT INTO public.community_activity (community_id, type, user_id, metadata)
    VALUES (
      NEW.community_id,
      'join_request_approved',
      NEW.user_id,
      jsonb_build_object('requester_id', NEW.user_id)
    );
  END IF;

  -- Track when join request is denied (status changes from pending to denied or removed)
  IF OLD.status = 'pending' AND NEW.status = 'denied' AND TG_OP = 'UPDATE' THEN
    INSERT INTO public.community_activity (community_id, type, user_id, metadata)
    VALUES (
      NEW.community_id,
      'join_request_denied',
      NEW.user_id,
      jsonb_build_object('requester_id', NEW.user_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_join_request_decision_trigger ON public.community_members;
CREATE TRIGGER track_join_request_decision_trigger
  AFTER UPDATE ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION track_join_request_decision();

-- ============================================================================
-- TRIGGER: Track community invitations
-- ============================================================================

CREATE OR REPLACE FUNCTION track_invitation_sent()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.community_activity (community_id, type, user_id, metadata)
    VALUES (
      NEW.community_id,
      'user_invited',
      NEW.inviter_id,
      jsonb_build_object(
        'inviter_id', NEW.inviter_id,
        'invitee_id', NEW.invitee_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_invitation_sent_trigger ON public.community_invitations;
CREATE TRIGGER track_invitation_sent_trigger
  AFTER INSERT ON public.community_invitations
  FOR EACH ROW
  EXECUTE FUNCTION track_invitation_sent();

-- ============================================================================
-- TRIGGER: Track invitation responses
-- ============================================================================

CREATE OR REPLACE FUNCTION track_invitation_response()
RETURNS TRIGGER AS $$
BEGIN
  -- Track when invitation is accepted
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    INSERT INTO public.community_activity (community_id, type, user_id, metadata)
    VALUES (
      NEW.community_id,
      'invitation_accepted',
      NEW.invitee_id,
      jsonb_build_object('invitee_id', NEW.invitee_id)
    );
  END IF;

  -- Track when invitation is rejected
  IF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
    INSERT INTO public.community_activity (community_id, type, user_id, metadata)
    VALUES (
      NEW.community_id,
      'invitation_rejected',
      NEW.invitee_id,
      jsonb_build_object('invitee_id', NEW.invitee_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_invitation_response_trigger ON public.community_invitations;
CREATE TRIGGER track_invitation_response_trigger
  AFTER UPDATE ON public.community_invitations
  FOR EACH ROW
  EXECUTE FUNCTION track_invitation_response();

-- ============================================================================
-- TRIGGER: Track invitation cancellation
-- ============================================================================

CREATE OR REPLACE FUNCTION track_invitation_cancelled()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'pending' THEN
    INSERT INTO public.community_activity (community_id, type, user_id, metadata)
    VALUES (
      OLD.community_id,
      'invitation_cancelled',
      OLD.inviter_id,
      jsonb_build_object(
        'inviter_id', OLD.inviter_id,
        'invitee_id', OLD.invitee_id
      )
    );
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_invitation_cancelled_trigger ON public.community_invitations;
CREATE TRIGGER track_invitation_cancelled_trigger
  BEFORE DELETE ON public.community_invitations
  FOR EACH ROW
  EXECUTE FUNCTION track_invitation_cancelled();

-- ============================================================================
-- NOTE: Ownership transfer tracking
-- ============================================================================

-- Ownership transfer is tracked by the member_role_changed trigger
-- when a member's role changes from 'admin' or 'member' to 'owner'
-- The previous owner's role change to 'admin' or 'member' is also tracked

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.community_activity IS
'Comprehensive activity log for all community operations. Tracks member actions, book changes, invitations, and administrative activities.';

COMMENT ON COLUMN public.community_activity.type IS
'Activity type: member_joined, member_left, member_removed, member_role_changed, join_request_created, join_request_approved, join_request_denied, user_invited, invitation_accepted, invitation_rejected, invitation_cancelled, book_added, book_removed, community_created, community_updated, ownership_transferred, and legacy types (borrow_created, borrow_returned, review_posted)';

COMMENT ON COLUMN public.community_activity.metadata IS
'JSONB field containing activity-specific data such as member_id, book_id, role changes, etc.';
