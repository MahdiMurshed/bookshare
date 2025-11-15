import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUserProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  getUserStats,
  type UpdateProfileInput,
} from '@repo/api-client';

// Query keys
export const profileKeys = {
  all: ['profile'] as const,
  profile: (userId: string) => [...profileKeys.all, userId] as const,
  stats: (userId: string) => [...profileKeys.all, 'stats', userId] as const,
};

/**
 * Hook to fetch user profile
 */
export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? profileKeys.profile(userId) : ['profile', 'unauthenticated'],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User must be authenticated to fetch profile');
      }
      return await getUserProfile(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch user statistics
 */
export function useUserStats(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? profileKeys.stats(userId) : ['profile', 'stats', 'unauthenticated'],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User must be authenticated to fetch stats');
      }
      return await getUserStats(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      if (!userId) {
        throw new Error('User must be authenticated to update profile');
      }
      return await updateProfile(userId, input);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: profileKeys.profile(userId) });
      }
    },
  });
}

/**
 * Hook to upload user avatar
 */
export function useUploadAvatar(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!userId) {
        throw new Error('User must be authenticated to upload avatar');
      }
      return await uploadAvatar(userId, file);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: profileKeys.profile(userId) });
      }
    },
  });
}

/**
 * Hook to delete user account
 */
export function useDeleteAccount(userId: string | undefined) {
  return useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error('User must be authenticated to delete account');
      }
      return await deleteAccount(userId);
    },
  });
}
