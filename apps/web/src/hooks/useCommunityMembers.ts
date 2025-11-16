import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCommunityMembers,
  getPendingJoinRequests,
  joinCommunity,
  approveMember,
  updateMemberRole,
  removeMember,
  leaveCommunity,
} from '@repo/api-client';
import { communityKeys } from './useCommunities';

// Query keys for members
export const memberKeys = {
  members: (communityId: string) => [...communityKeys.detail(communityId), 'members'] as const,
  pending: (communityId: string) => [...communityKeys.detail(communityId), 'pending'] as const,
};

/**
 * Hook to fetch community members
 */
export function useCommunityMembers(communityId: string) {
  return useQuery({
    queryKey: memberKeys.members(communityId),
    queryFn: async () => {
      return await getCommunityMembers(communityId);
    },
    enabled: !!communityId,
  });
}

/**
 * Hook to fetch pending join requests
 */
export function usePendingJoinRequests(communityId: string) {
  return useQuery({
    queryKey: memberKeys.pending(communityId),
    queryFn: async () => {
      return await getPendingJoinRequests(communityId);
    },
    enabled: !!communityId,
  });
}

/**
 * Hook to join a community
 */
export function useJoinCommunity(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityId: string) => {
      if (!userId) throw new Error('User must be authenticated');
      return await joinCommunity(communityId, userId);
    },
    onSuccess: (_, communityId) => {
      // Invalidate members, pending requests, community details, and user's communities
      queryClient.invalidateQueries({ queryKey: memberKeys.members(communityId) });
      queryClient.invalidateQueries({ queryKey: memberKeys.pending(communityId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: communityKeys.myCommunities(userId) });
      }
    },
  });
}

/**
 * Hook to approve a pending member
 */
export function useApproveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ communityId, userId }: { communityId: string; userId: string }) => {
      return await approveMember(communityId, userId);
    },
    onSuccess: (_, variables) => {
      // Invalidate members and pending lists
      queryClient.invalidateQueries({ queryKey: memberKeys.members(variables.communityId) });
      queryClient.invalidateQueries({ queryKey: memberKeys.pending(variables.communityId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(variables.communityId) });
    },
  });
}

/**
 * Hook to update a member's role
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      communityId,
      userId,
      role,
    }: {
      communityId: string;
      userId: string;
      role: 'admin' | 'member';
    }) => {
      return await updateMemberRole(communityId, userId, role);
    },
    onSuccess: (_, variables) => {
      // Invalidate members list
      queryClient.invalidateQueries({ queryKey: memberKeys.members(variables.communityId) });
    },
  });
}

/**
 * Hook to remove a member from a community
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ communityId, userId }: { communityId: string; userId: string }) => {
      await removeMember(communityId, userId);
      return { communityId, userId };
    },
    onSuccess: (variables) => {
      // Invalidate members list and community details
      queryClient.invalidateQueries({ queryKey: memberKeys.members(variables.communityId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(variables.communityId) });
    },
  });
}

/**
 * Hook to leave a community
 */
export function useLeaveCommunity(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityId: string) => {
      if (!userId) throw new Error('User must be authenticated');
      await leaveCommunity(communityId, userId);
      return communityId;
    },
    onSuccess: (communityId) => {
      // Invalidate members, community details, and user's communities
      queryClient.invalidateQueries({ queryKey: memberKeys.members(communityId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: communityKeys.myCommunities(userId) });
      }
    },
  });
}
