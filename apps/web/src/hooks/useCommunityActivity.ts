import { useQuery } from '@tanstack/react-query';
import { getCommunityActivity } from '@repo/api-client';
import { communityKeys } from './useCommunities';

// Query keys for activity
export const activityKeys = {
  activity: (communityId: string) => [...communityKeys.detail(communityId), 'activity'] as const,
};

/**
 * Hook to fetch community activity feed
 */
export function useCommunityActivity(communityId: string, limit = 50) {
  return useQuery({
    queryKey: activityKeys.activity(communityId),
    queryFn: async () => {
      return await getCommunityActivity(communityId, limit);
    },
    enabled: !!communityId,
  });
}
