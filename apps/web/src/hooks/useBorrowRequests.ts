import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyBorrowRequestsWithDetails,
  getIncomingBorrowRequestsWithDetails,
  createBorrowRequest,
  approveBorrowRequest,
  denyBorrowRequest,
  notifyBorrowRequest,
  notifyRequestApproved,
  notifyRequestDenied,
  type CreateBorrowRequestInput,
  type BorrowRequest,
} from '@repo/api-client';
import { bookKeys } from './useBooks';

// Query keys
export const borrowRequestKeys = {
  all: ['borrowRequests'] as const,
  myRequests: () => [...borrowRequestKeys.all, 'my'] as const,
  myRequestsWithStatus: (status?: string) =>
    [...borrowRequestKeys.myRequests(), status] as const,
  incoming: () => [...borrowRequestKeys.all, 'incoming'] as const,
  incomingWithStatus: (status?: string) =>
    [...borrowRequestKeys.incoming(), status] as const,
  detail: (id: string) => [...borrowRequestKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch borrow requests made by the current user
 */
export function useMyBorrowRequests(status?: 'pending' | 'approved' | 'denied' | 'returned') {
  return useQuery({
    queryKey: borrowRequestKeys.myRequestsWithStatus(status),
    queryFn: async () => {
      const requests = await getMyBorrowRequestsWithDetails(status);
      return requests;
    },
  });
}

/**
 * Hook to fetch incoming borrow requests for the current user's books
 */
export function useIncomingBorrowRequests(
  status?: 'pending' | 'approved' | 'denied' | 'returned'
) {
  return useQuery({
    queryKey: borrowRequestKeys.incomingWithStatus(status),
    queryFn: async () => {
      const requests = await getIncomingBorrowRequestsWithDetails(status);
      return requests;
    },
  });
}

/**
 * Hook to create a new borrow request
 */
export function useCreateBorrowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBorrowRequestInput) => {
      const request = await createBorrowRequest(input);
      return request;
    },
    onSuccess: async (request: BorrowRequest) => {
      // Invalidate my borrow requests
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.myRequests() });

      // Send notification to book owner
      try {
        await notifyBorrowRequest(
          request.owner_id,
          request.borrower_id,
          request.book_id
        );
      } catch (error) {
        console.error('Failed to send borrow request notification:', error);
      }
    },
  });
}

/**
 * Hook to approve a borrow request
 */
export function useApproveBorrowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dueDate,
      message,
    }: {
      id: string;
      dueDate: string;
      message?: string;
    }) => {
      const request = await approveBorrowRequest(id, dueDate, message);
      return request;
    },
    onSuccess: async (request: BorrowRequest) => {
      // Invalidate incoming requests and detail
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.incoming() });
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.detail(request.id) });

      // Invalidate book queries so the book's availability status updates
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(request.book_id) });

      // Send notification to borrower
      try {
        await notifyRequestApproved(
          request.borrower_id,
          request.owner_id,
          request.book_id
        );
      } catch (error) {
        console.error('Failed to send approval notification:', error);
      }
    },
  });
}

/**
 * Hook to deny a borrow request
 */
export function useDenyBorrowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, message }: { id: string; message?: string }) => {
      const request = await denyBorrowRequest(id, message);
      return request;
    },
    onSuccess: async (request: BorrowRequest) => {
      // Invalidate incoming requests and detail
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.incoming() });
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.detail(request.id) });

      // Send notification to borrower
      try {
        await notifyRequestDenied(
          request.borrower_id,
          request.owner_id,
          request.book_id
        );
      } catch (error) {
        console.error('Failed to send denial notification:', error);
      }
    },
  });
}
