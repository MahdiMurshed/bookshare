import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  type CreateBookInput,
  type UpdateBookInput,
} from '@repo/api-client';

// Query keys
export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (userId: string) => [...bookKeys.lists(), userId] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
};

/**
 * Hook to fetch all books for the current user
 */
export function useBooks(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? bookKeys.list(userId) : ['books', 'list', 'unauthenticated'],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User must be authenticated to fetch books');
      }
      const books = await getBooks({ owner_id: userId });
      return books;
    },
    enabled: !!userId,
  });
}

/**
 * Hook to create a new book
 */
export function useCreateBook(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBookInput) => {
      return await createBook(input);
    },
    onSuccess: () => {
      // Invalidate and refetch books list for this user
      if (userId) {
        queryClient.invalidateQueries({ queryKey: bookKeys.list(userId) });
      }
    },
  });
}

/**
 * Hook to update an existing book
 */
export function useUpdateBook(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBookInput }) => {
      return await updateBook(id, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate both the specific book and the list for this user
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(variables.id) });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: bookKeys.list(userId) });
      }
    },
  });
}

/**
 * Hook to delete a book
 */
export function useDeleteBook(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteBook(id);
      return id;
    },
    onSuccess: (id) => {
      // Invalidate the list for this user and remove the specific book from cache
      if (userId) {
        queryClient.invalidateQueries({ queryKey: bookKeys.list(userId) });
      }
      queryClient.removeQueries({ queryKey: bookKeys.detail(id) });
    },
  });
}
