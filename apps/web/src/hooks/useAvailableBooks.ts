import { useQuery } from '@tanstack/react-query';
import { getAvailableBooksWithOwners } from '@repo/api-client';
import { bookKeys } from './useBooks';

interface UseAvailableBooksParams {
  genre?: string;
  search?: string;
}

export function useAvailableBooks({ genre, search }: UseAvailableBooksParams = {}) {
  return useQuery({
    queryKey: [...bookKeys.all, 'browse', genre, search],
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
