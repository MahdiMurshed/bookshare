import { useQuery } from '@tanstack/react-query';
import { getAvailableBooksWithOwners } from '@repo/api-client';

interface UseAvailableBooksParams {
  genre?: string;
  search?: string;
}

export function useAvailableBooks({ genre, search }: UseAvailableBooksParams = {}) {
  return useQuery({
    queryKey: ['books', 'browse', genre, search],
    queryFn: async () => {
      const filters: { genre?: string; search?: string } = {};

      if (genre && genre !== 'all') {
        filters.genre = genre;
      }

      if (search?.trim()) {
        filters.search = search.trim();
      }

      return getAvailableBooksWithOwners(filters);
    },
  });
}
