import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBorrowRequest } from '@repo/api-client';
import { borrowRequestKeys } from './useBorrowRequests';

interface UseBorrowRequestParams {
  bookId: string;
  onSuccess?: () => void;
}

export function useBorrowRequest({ bookId, onSuccess }: UseBorrowRequestParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) => {
      return createBorrowRequest({
        book_id: bookId,
        request_message: message || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.all });
      onSuccess?.();
    },
  });
}
