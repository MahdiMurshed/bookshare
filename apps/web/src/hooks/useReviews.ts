/**
 * Review Query Keys and Hooks
 *
 * Centralized query key factory for review-related queries
 * Ensures consistent cache management and invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createReview,
  getBookCommunities,
  createActivity,
  getBook,
  type CreateReviewInput,
} from '@repo/api-client';
import { logError } from '../lib/utils/errors';

// Query key factory for reviews
export const reviewKeys = {
  all: ['reviews'] as const,

  // Lists
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...reviewKeys.lists(), filters] as const,

  // Details
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,

  // By book
  byBook: (bookId: string) => [...reviewKeys.all, 'book', bookId] as const,
  bookAverageRating: (bookId: string) => [...reviewKeys.byBook(bookId), 'average'] as const,

  // By user
  byUser: (userId: string) => [...reviewKeys.all, 'user', userId] as const,

  // User has reviewed book check
  hasReviewed: (bookId: string, userId: string) =>
    [...reviewKeys.all, 'has-reviewed', bookId, userId] as const,
};

/**
 * Hook to create a review with automatic activity tracking
 */
export function useCreateReview(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      const review = await createReview(input);
      return review;
    },
    onSuccess: async (review, variables) => {
      // Invalidate review queries
      queryClient.invalidateQueries({ queryKey: reviewKeys.byBook(variables.book_id) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.bookAverageRating(variables.book_id) });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: reviewKeys.byUser(userId) });
        queryClient.invalidateQueries({ queryKey: reviewKeys.hasReviewed(variables.book_id, userId) });
      }

      // Create activity records for communities the book belongs to
      try {
        const communities = await getBookCommunities(variables.book_id);
        const book = await getBook(variables.book_id);

        if (communities.length > 0 && book && userId) {
          await Promise.all(
            communities.map((community) =>
              createActivity({
                community_id: community.id,
                type: 'review_posted',
                user_id: userId,
                metadata: {
                  book_id: variables.book_id,
                  review_id: review.id,
                  rating: variables.rating,
                },
              })
            )
          );
        }
      } catch (error) {
        logError(error, 'creating review activity');
      }
    },
  });
}
