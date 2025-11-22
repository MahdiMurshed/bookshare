import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyBorrowRequestsWithDetails,
  getIncomingBorrowRequestsWithDetails,
  createBorrowRequest,
  approveBorrowRequest,
  denyBorrowRequest,
  markHandoverComplete,
  updateHandoverTracking,
  initiateReturn,
  markBookReturned,
  notifyBorrowRequest,
  notifyRequestApproved,
  notifyRequestDenied,
  getBookCommunities,
  createActivity,
  getBook,
} from '@repo/api-client';
import type {
  CreateBorrowRequestInput,
  BorrowRequest,
  BorrowRequestStatus,
  HandoverDetails,
  ReturnDetails,
} from '@repo/api-client';
import { bookKeys } from './useBooks';
import { logError } from '../lib/utils/errors';

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
export function useMyBorrowRequests(status?: BorrowRequestStatus) {
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
export function useIncomingBorrowRequests(status?: BorrowRequestStatus) {
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
        logError(error, 'sending borrow request notification');
      }

      // Create activity records for communities the book belongs to
      try {
        const communities = await getBookCommunities(request.book_id);
        const book = await getBook(request.book_id);

        if (communities.length > 0 && book) {
          await Promise.all(
            communities.map((community) =>
              createActivity({
                community_id: community.id,
                type: 'borrow_created',
                user_id: request.borrower_id,
                metadata: {
                  book_id: request.book_id,
                  borrower_id: request.borrower_id,
                  book_title: book.title,
                },
              })
            )
          );
        }
      } catch (error) {
        logError(error, 'creating borrow activity');
      }
    },
  });
}

/**
 * Hook to approve a borrow request with handover details
 */
export function useApproveBorrowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dueDate,
      handoverDetails,
      message,
    }: {
      id: string;
      dueDate: string;
      handoverDetails: HandoverDetails;
      message?: string;
    }) => {
      const request = await approveBorrowRequest(id, dueDate, handoverDetails, message);
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
        logError(error, 'sending approval notification');
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
        logError(error, 'sending denial notification');
      }
    },
  });
}

/**
 * Hook to mark handover as complete
 */
export function useMarkHandoverComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const request = await markHandoverComplete(id);
      return request;
    },
    onSuccess: (request: BorrowRequest) => {
      // Invalidate incoming requests
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.incoming() });
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.detail(request.id) });
    },
  });
}

/**
 * Hook to update handover tracking number
 */
export function useUpdateHandoverTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tracking }: { id: string; tracking: string }) => {
      const request = await updateHandoverTracking(id, tracking);
      return request;
    },
    onSuccess: (request: BorrowRequest) => {
      // Invalidate incoming requests
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.incoming() });
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.detail(request.id) });
    },
  });
}

/**
 * Hook to initiate return
 */
export function useInitiateReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      returnDetails,
    }: {
      id: string;
      returnDetails: ReturnDetails;
    }) => {
      const request = await initiateReturn(id, returnDetails);
      return request;
    },
    onSuccess: (request: BorrowRequest) => {
      // Invalidate my borrow requests
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.detail(request.id) });
    },
  });
}

/**
 * Hook to confirm return received (mark book as returned)
 */
export function useConfirmReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const request = await markBookReturned(id);
      return request;
    },
    onSuccess: async (request: BorrowRequest) => {
      // Invalidate incoming requests
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.incoming() });
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.detail(request.id) });

      // Invalidate book queries so the book's availability status updates
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(request.book_id) });

      // Create activity records for communities the book belongs to
      try {
        const communities = await getBookCommunities(request.book_id);
        const book = await getBook(request.book_id);

        if (communities.length > 0 && book && request.approved_at) {
          // Calculate duration in days
          const borrowDate = new Date(request.approved_at);
          const returnDate = new Date();
          const durationDays = Math.ceil((returnDate.getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24));

          await Promise.all(
            communities.map((community) =>
              createActivity({
                community_id: community.id,
                type: 'borrow_returned',
                user_id: request.borrower_id,
                metadata: {
                  book_id: request.book_id,
                  borrower_id: request.borrower_id,
                  book_title: book.title,
                  duration_days: durationDays,
                },
              })
            )
          );
        }
      } catch (error) {
        logError(error, 'creating return activity');
      }
    },
  });
}
