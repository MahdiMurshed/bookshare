/**
 * Community Invitations Hooks
 *
 * React Query hooks for managing community invitations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  inviteUserToCommunity,
  getCommunityInvitations,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
} from '@repo/api-client';

// Query Keys
export const invitationKeys = {
  all: ['community-invitations'] as const,
  lists: () => [...invitationKeys.all, 'list'] as const,
  community: (communityId: string) => [...invitationKeys.lists(), 'community', communityId] as const,
  user: (userId: string) => [...invitationKeys.lists(), 'user', userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get pending invitations for a community (admin/owner only)
 */
export function useCommunityInvitations(communityId: string | undefined) {
  return useQuery({
    queryKey: communityId ? invitationKeys.community(communityId) : ['no-community'],
    queryFn: () => {
      if (!communityId) throw new Error('Community ID required');
      return getCommunityInvitations(communityId);
    },
    enabled: !!communityId,
  });
}

/**
 * Get invitations received by current user
 */
export function useMyInvitations(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? invitationKeys.user(userId) : ['no-user'],
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return getMyInvitations(userId);
    },
    enabled: !!userId,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Invite user to community
 */
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, inviteeId }: { communityId: string; inviteeId: string }) =>
      inviteUserToCommunity({ community_id: communityId, invitee_id: inviteeId }),
    onSuccess: (data) => {
      // Invalidate community invitations
      queryClient.invalidateQueries({ queryKey: invitationKeys.community(data.community_id) });

      // Invalidate invitee's invitation list
      queryClient.invalidateQueries({ queryKey: invitationKeys.user(data.invitee_id) });
    },
  });
}

/**
 * Accept invitation
 */
export function useAcceptInvitation(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptInvitation,
    onSuccess: (data) => {
      // Invalidate user's invitations
      if (userId) {
        queryClient.invalidateQueries({ queryKey: invitationKeys.user(userId) });
      }

      // Invalidate community invitations
      queryClient.invalidateQueries({ queryKey: invitationKeys.community(data.community_id) });

      // Invalidate user's communities list
      queryClient.invalidateQueries({ queryKey: ['communities', 'my'] });

      // Invalidate community members
      queryClient.invalidateQueries({ queryKey: ['community-members', data.community_id] });

      // Invalidate community detail to refresh userStatus
      queryClient.invalidateQueries({ queryKey: ['communities', 'detail', data.community_id] });
    },
  });
}

/**
 * Reject invitation
 */
export function useRejectInvitation(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectInvitation,
    onSuccess: (data) => {
      // Invalidate user's invitations
      if (userId) {
        queryClient.invalidateQueries({ queryKey: invitationKeys.user(userId) });
      }

      // Invalidate community invitations
      queryClient.invalidateQueries({ queryKey: invitationKeys.community(data.community_id) });

      // Invalidate community detail to refresh userStatus
      queryClient.invalidateQueries({ queryKey: ['communities', 'detail', data.community_id] });
    },
  });
}

/**
 * Cancel invitation (inviter or admin only)
 */
export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelInvitation,
    onSuccess: () => {
      // Invalidate all invitation queries
      queryClient.invalidateQueries({ queryKey: invitationKeys.all });
    },
  });
}
