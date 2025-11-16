/**
 * Communities abstraction layer
 *
 * Provides backend-agnostic community CRUD operations.
 * Currently implemented with Supabase.
 *
 * MIGRATION NOTE: When migrating to NestJS, replace Supabase calls
 * with REST API calls to /communities/* endpoints while keeping function signatures identical.
 */

import { supabase } from './supabaseClient.js';
import type { User, Book, BookWithOwner } from './types.js';

// ============================================================================
// TYPES
// ============================================================================

export interface Community {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  location: string | null;
  is_private: boolean;
  requires_approval: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Computed fields (not in DB)
  memberCount?: number;
  bookCount?: number;
  userRole?: 'owner' | 'admin' | 'member';
  userStatus?: 'approved' | 'pending';
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'approved' | 'pending';
  joined_at: string;
  user?: User;
}

export interface CommunityActivity {
  id: string;
  community_id: string;
  type: 'member_joined' | 'book_added' | 'borrow_created' | 'borrow_returned' | 'review_posted';
  user_id: string;
  metadata: any;
  created_at: string;
  user?: User;
}

export interface BookCommunity {
  id: string;
  book_id: string;
  community_id: string;
  added_by: string;
  added_at: string;
}

export interface CreateCommunityInput {
  name: string;
  description?: string;
  avatar_url?: string;
  location?: string;
  is_private: boolean;
  requires_approval: boolean;
}

export interface UpdateCommunityInput {
  name?: string;
  description?: string;
  avatar_url?: string;
  location?: string;
  is_private?: boolean;
  requires_approval?: boolean;
}

export interface CommunityFilters {
  isPrivate?: boolean;
  search?: string;
  location?: string;
}

export interface CreateActivityInput {
  community_id: string;
  type: 'member_joined' | 'book_added' | 'borrow_created' | 'borrow_returned' | 'review_posted';
  user_id: string;
  metadata?: any;
}

export interface CommunityInvitation {
  id: string;
  community_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  responded_at: string | null;
  inviter?: User;
  invitee?: User;
  community?: Community;
}

export interface CreateInvitationInput {
  community_id: string;
  invitee_id: string;
}

// ============================================================================
// COMMUNITY MANAGEMENT
// ============================================================================

/**
 * Get all communities with optional filters
 */
export async function getCommunities(filters?: CommunityFilters): Promise<Community[]> {
  let query = supabase.from('communities').select('*');

  if (filters?.isPrivate !== undefined) {
    query = query.eq('is_private', filters.isPrivate);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Community[];
}

/**
 * Get communities the user is a member of
 */
export async function getMyCommunities(userId: string): Promise<Community[]> {
  const { data, error } = await supabase
    .from('community_members')
    .select(`
      role,
      status,
      communities (*)
    `)
    .eq('user_id', userId)
    .eq('status', 'approved');

  if (error) throw error;

  // Map to Community[] with user role
  return (data || []).map((item: any) => ({
    ...item.communities,
    userRole: item.role,
    userStatus: item.status,
  })) as Community[];
}

/**
 * Get a single community by ID with member/book counts
 */
export async function getCommunityById(id: string, userId?: string): Promise<Community | null> {
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('*')
    .eq('id', id)
    .single();

  if (communityError) {
    if (communityError.code === 'PGRST116') return null;
    throw communityError;
  }

  // Get member count
  const { count: memberCount, error: memberCountError } = await supabase
    .from('community_members')
    .select('*', { count: 'exact', head: true })
    .eq('community_id', id)
    .eq('status', 'approved');

  if (memberCountError) throw memberCountError;

  // Get book count
  const { count: bookCount, error: bookCountError } = await supabase
    .from('book_communities')
    .select('*', { count: 'exact', head: true })
    .eq('community_id', id);

  if (bookCountError) throw bookCountError;

  // Get user's role and status if userId provided
  let userRole: 'owner' | 'admin' | 'member' | undefined;
  let userStatus: 'approved' | 'pending' | undefined;

  if (userId) {
    const { data: membership, error: membershipError } = await supabase
      .from('community_members')
      .select('role, status')
      .eq('community_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (membershipError) throw membershipError;

    if (membership) {
      userRole = membership.role;
      userStatus = membership.status;
    }
  }

  return {
    ...community,
    memberCount: memberCount || 0,
    bookCount: bookCount || 0,
    userRole,
    userStatus,
  } as Community;
}

/**
 * Create a new community
 */
export async function createCommunity(input: CreateCommunityInput): Promise<Community> {
  // Get current session to ensure we have a valid auth token
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Session error:', sessionError);
    throw new Error(`Authentication session error: ${sessionError.message}`);
  }

  if (!session?.user) {
    console.error('No active session found');
    throw new Error('Not authenticated. Please log in again.');
  }

  console.log('Creating community with user ID:', session.user.id);
  console.log('Community data:', { ...input, created_by: session.user.id });

  const { data, error } = await supabase
    .from('communities')
    .insert({
      ...input,
      created_by: session.user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create community. Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    // Enhanced error message for RLS violations
    if (error.code === '42501') {
      throw new Error(
        'Permission denied: Unable to create community. This usually means:\n' +
        '1. You need to log out and log back in (stale auth token)\n' +
        '2. Database migrations may not have run correctly\n' +
        `Technical details: ${error.message}`
      );
    }

    throw error;
  }

  console.log('Community created successfully:', data);
  return data as Community;
}

/**
 * Update a community
 */
export async function updateCommunity(id: string, input: UpdateCommunityInput): Promise<Community> {
  const { data, error } = await supabase
    .from('communities')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Community;
}

/**
 * Delete a community
 */
export async function deleteCommunity(id: string): Promise<void> {
  const { error } = await supabase.from('communities').delete().eq('id', id);

  if (error) throw error;
}

// ============================================================================
// MEMBER MANAGEMENT
// ============================================================================

/**
 * Get members of a community
 */
export async function getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
  const { data, error } = await supabase
    .from('community_members')
    .select(`
      *,
      user:users (*)
    `)
    .eq('community_id', communityId)
    .eq('status', 'approved')
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return (data || []) as CommunityMember[];
}

/**
 * Get pending join requests for a community
 */
export async function getPendingJoinRequests(communityId: string): Promise<CommunityMember[]> {
  const { data, error } = await supabase
    .from('community_members')
    .select(`
      *,
      user:users (*)
    `)
    .eq('community_id', communityId)
    .eq('status', 'pending')
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return (data || []) as CommunityMember[];
}

/**
 * Join a community (or request to join if private and requires approval)
 */
export async function joinCommunity(communityId: string, userId: string): Promise<CommunityMember> {
  // Get community settings
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('is_private, requires_approval')
    .eq('id', communityId)
    .single();

  if (communityError) throw communityError;

  // Determine status based on community settings
  const status = community.is_private && community.requires_approval ? 'pending' : 'approved';

  const { data, error } = await supabase
    .from('community_members')
    .insert({
      community_id: communityId,
      user_id: userId,
      role: 'member',
      status,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CommunityMember;
}

/**
 * Approve a pending member
 */
export async function approveMember(communityId: string, userId: string): Promise<CommunityMember> {
  const { data, error } = await supabase
    .from('community_members')
    .update({ status: 'approved' })
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as CommunityMember;
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
  communityId: string,
  userId: string,
  role: 'admin' | 'member'
): Promise<CommunityMember> {
  const { data, error } = await supabase
    .from('community_members')
    .update({ role })
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as CommunityMember;
}

/**
 * Remove a member from a community
 */
export async function removeMember(communityId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Leave a community
 */
export async function leaveCommunity(communityId: string, userId: string): Promise<void> {
  // Check if user is the owner
  const { data: membership, error: membershipError } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .single();

  if (membershipError) throw membershipError;

  if (membership.role === 'owner') {
    throw new Error('Community owner cannot leave. Please transfer ownership or delete the community.');
  }

  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Transfer community ownership to another member
 * The current owner will become an admin, and the new member will become the owner.
 */
export async function transferOwnership(
  communityId: string,
  currentOwnerId: string,
  newOwnerId: string
): Promise<void> {
  // Verify current owner
  const { data: currentOwnerMembership, error: currentOwnerError } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', communityId)
    .eq('user_id', currentOwnerId)
    .single();

  if (currentOwnerError) throw currentOwnerError;

  if (currentOwnerMembership.role !== 'owner') {
    throw new Error('Only the community owner can transfer ownership.');
  }

  // Verify new owner is a member
  const { data: newOwnerMembership, error: newOwnerError } = await supabase
    .from('community_members')
    .select('role, status')
    .eq('community_id', communityId)
    .eq('user_id', newOwnerId)
    .single();

  if (newOwnerError) throw newOwnerError;

  if (newOwnerMembership.status !== 'approved') {
    throw new Error('New owner must be an approved member.');
  }

  // Update current owner to admin
  const { error: demoteError } = await supabase
    .from('community_members')
    .update({ role: 'admin' })
    .eq('community_id', communityId)
    .eq('user_id', currentOwnerId);

  if (demoteError) throw demoteError;

  // Update new owner to owner role
  const { error: promoteError } = await supabase
    .from('community_members')
    .update({ role: 'owner' })
    .eq('community_id', communityId)
    .eq('user_id', newOwnerId);

  if (promoteError) {
    // Rollback: restore current owner if new owner update fails
    await supabase
      .from('community_members')
      .update({ role: 'owner' })
      .eq('community_id', communityId)
      .eq('user_id', currentOwnerId);

    throw promoteError;
  }
}

// ============================================================================
// BOOK-COMMUNITY ASSOCIATION
// ============================================================================

/**
 * Add a book to a community
 */
export async function addBookToCommunity(bookId: string, communityId: string): Promise<BookCommunity> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('book_communities')
    .insert({
      book_id: bookId,
      community_id: communityId,
      added_by: user.user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as BookCommunity;
}

/**
 * Remove a book from a community
 */
export async function removeBookFromCommunity(bookId: string, communityId: string): Promise<void> {
  const { error } = await supabase
    .from('book_communities')
    .delete()
    .eq('book_id', bookId)
    .eq('community_id', communityId);

  if (error) throw error;
}

/**
 * Get all books in a community with owner information
 */
export async function getCommunityBooks(communityId: string): Promise<BookWithOwner[]> {
  const { data, error } = await supabase
    .from('book_communities')
    .select(`
      books (
        *,
        owner:users!owner_id (
          id,
          name,
          email,
          avatar_url
        )
      )
    `)
    .eq('community_id', communityId);

  if (error) throw error;

  // Extract books from the nested structure
  return (data || []).map((item: any) => item.books).filter(Boolean) as BookWithOwner[];
}

/**
 * Get which communities a book belongs to
 */
export async function getBookCommunities(bookId: string): Promise<Community[]> {
  const { data, error } = await supabase
    .from('book_communities')
    .select(`
      communities (*)
    `)
    .eq('book_id', bookId);

  if (error) throw error;

  // Extract communities from the nested structure
  return (data || []).map((item: any) => item.communities).filter(Boolean) as Community[];
}

// ============================================================================
// ACTIVITY FEED
// ============================================================================

/**
 * Get activity feed for a community
 */
export async function getCommunityActivity(communityId: string, limit = 50): Promise<CommunityActivity[]> {
  const { data, error } = await supabase
    .from('community_activity')
    .select(`
      *,
      user:users (*)
    `)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as CommunityActivity[];
}

/**
 * Create an activity record
 */
export async function createActivity(input: CreateActivityInput): Promise<CommunityActivity> {
  const { data, error} = await supabase
    .from('community_activity')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as CommunityActivity;
}

// ============================================================================
// COMMUNITY INVITATIONS
// ============================================================================

/**
 * Send invitation to user to join community
 */
export async function inviteUserToCommunity(input: CreateInvitationInput): Promise<CommunityInvitation> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('community_invitations')
    .insert({
      ...input,
      inviter_id: session.user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CommunityInvitation;
}

/**
 * Get pending invitations for a community (admin/owner only)
 */
export async function getCommunityInvitations(communityId: string): Promise<CommunityInvitation[]> {
  const { data, error } = await supabase
    .from('community_invitations')
    .select(`
      *,
      inviter:users!community_invitations_inviter_id_fkey (*),
      invitee:users!community_invitations_invitee_id_fkey (*)
    `)
    .eq('community_id', communityId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as CommunityInvitation[];
}

/**
 * Get invitations received by current user
 */
export async function getMyInvitations(userId: string): Promise<CommunityInvitation[]> {
  const { data, error } = await supabase
    .from('community_invitations')
    .select(`
      *,
      inviter:users!community_invitations_inviter_id_fkey (*),
      community:communities (*)
    `)
    .eq('invitee_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as CommunityInvitation[];
}

/**
 * Accept community invitation
 */
export async function acceptInvitation(invitationId: string): Promise<CommunityInvitation> {
  const { data, error } = await supabase
    .from('community_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) throw error;
  return data as CommunityInvitation;
}

/**
 * Reject community invitation
 */
export async function rejectInvitation(invitationId: string): Promise<CommunityInvitation> {
  const { data, error } = await supabase
    .from('community_invitations')
    .update({ status: 'rejected' })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) throw error;
  return data as CommunityInvitation;
}

/**
 * Cancel/delete invitation (inviter or admin only)
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase
    .from('community_invitations')
    .delete()
    .eq('id', invitationId);

  if (error) throw error;
}
