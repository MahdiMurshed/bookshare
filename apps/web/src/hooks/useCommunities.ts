import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCommunities,
  getMyCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  getCommunityBooks,
  addBookToCommunity,
  removeBookFromCommunity,
  type CreateCommunityInput,
  type UpdateCommunityInput,
  type CommunityFilters,
} from '@repo/api-client';

// Query keys
export const communityKeys = {
  all: ['communities'] as const,
  lists: () => [...communityKeys.all, 'list'] as const,
  list: (filters?: CommunityFilters) => [...communityKeys.lists(), filters] as const,
  myCommunities: (userId: string) => [...communityKeys.all, 'my', userId] as const,
  details: () => [...communityKeys.all, 'detail'] as const,
  detail: (id: string) => [...communityKeys.details(), id] as const,
  books: (id: string) => [...communityKeys.detail(id), 'books'] as const,
};

/**
 * Hook to fetch all communities with optional filters
 */
export function useCommunities(filters?: CommunityFilters) {
  return useQuery({
    queryKey: communityKeys.list(filters),
    queryFn: async () => {
      return await getCommunities(filters);
    },
  });
}

/**
 * Hook to fetch communities the user is a member of
 */
export function useMyCommunities(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? communityKeys.myCommunities(userId) : ['communities', 'my', 'unauthenticated'],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User must be authenticated to fetch communities');
      }
      return await getMyCommunities(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch a single community by ID
 */
export function useCommunity(id: string, userId?: string) {
  return useQuery({
    queryKey: communityKeys.detail(id),
    queryFn: async () => {
      return await getCommunityById(id, userId);
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch books in a community
 */
export function useCommunityBooks(communityId: string) {
  return useQuery({
    queryKey: communityKeys.books(communityId),
    queryFn: async () => {
      return await getCommunityBooks(communityId);
    },
    enabled: !!communityId,
  });
}

/**
 * Hook to create a new community
 */
export function useCreateCommunity(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCommunityInput) => {
      return await createCommunity(input);
    },
    onSuccess: () => {
      // Invalidate all community lists
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: communityKeys.myCommunities(userId) });
      }
    },
  });
}

/**
 * Hook to update a community
 */
export function useUpdateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCommunityInput }) => {
      return await updateCommunity(id, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific community and all lists
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
    },
  });
}

/**
 * Hook to delete a community
 */
export function useDeleteCommunity(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteCommunity(id);
      return id;
    },
    onSuccess: (id) => {
      // Invalidate all lists and remove the specific community from cache
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: communityKeys.myCommunities(userId) });
      }
      queryClient.removeQueries({ queryKey: communityKeys.detail(id) });
    },
  });
}

/**
 * Hook to add a book to a community
 */
export function useAddBookToCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, communityId }: { bookId: string; communityId: string }) => {
      return await addBookToCommunity(bookId, communityId);
    },
    onSuccess: (_, variables) => {
      // Invalidate community books and community details
      queryClient.invalidateQueries({ queryKey: communityKeys.books(variables.communityId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(variables.communityId) });
    },
  });
}

/**
 * Hook to remove a book from a community
 */
export function useRemoveBookFromCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, communityId }: { bookId: string; communityId: string }) => {
      await removeBookFromCommunity(bookId, communityId);
      return { bookId, communityId };
    },
    onSuccess: (variables) => {
      // Invalidate community books and community details
      queryClient.invalidateQueries({ queryKey: communityKeys.books(variables.communityId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(variables.communityId) });
    },
  });
}
