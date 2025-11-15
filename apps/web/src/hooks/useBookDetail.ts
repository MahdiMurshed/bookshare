import { useQuery } from '@tanstack/react-query';
import { getBookWithOwner } from '@repo/api-client';
import { bookKeys } from './useBooks';

export function useBookDetail(bookId: string | undefined) {
  return useQuery({
    queryKey: bookId ? bookKeys.detail(bookId) : ['books', 'detail', 'disabled'],
    queryFn: async () => {
      if (!bookId) throw new Error('Book ID is required');
      const result = await getBookWithOwner(bookId);
      if (!result) throw new Error('Book not found');
      return result;
    },
    enabled: !!bookId,
  });
}
