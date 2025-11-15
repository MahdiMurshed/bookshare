/**
 * Review Query Keys and Hooks
 *
 * Centralized query key factory for review-related queries
 * Ensures consistent cache management and invalidation
 */

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
