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
  list: (filters?: unknown) => [...bookKeys.lists(), filters] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
};

/**
 * Hook to fetch all books for the current user
 */
export function useBooks() {
  return useQuery({
    queryKey: bookKeys.lists(),
    queryFn: async () => {
      const books = await getBooks();
      return books;
    },
  });
}

/**
 * Hook to create a new book
 */
export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBookInput) => {
      return await createBook(input);
    },
    onSuccess: () => {
      // Invalidate and refetch books list
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing book
 */
export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBookInput }) => {
      return await updateBook(id, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate both the specific book and the list
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
  });
}

/**
 * Hook to delete a book
 */
export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteBook(id);
      return id;
    },
    onSuccess: (id) => {
      // Invalidate the list and remove the specific book from cache
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.removeQueries({ queryKey: bookKeys.detail(id) });
    },
  });
}
