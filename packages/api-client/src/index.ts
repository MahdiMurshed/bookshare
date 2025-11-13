/**
 * BookShare API Client
 *
 * Backend abstraction layer for all data operations.
 * Import functions from this package instead of calling backend directly.
 *
 * @example
 * ```typescript
 * import { signIn, getBooks, createBorrowRequest } from '@repo/api-client';
 *
 * await signIn({ email: 'user@example.com', password: 'password' });
 * const books = await getBooks({ borrowable: true });
 * const request = await createBorrowRequest({ book_id: 'abc123' });
 * ```
 */

// Export all types
export type {
  Database,
  User,
  Book,
  BookWithOwner,
  BorrowRequest,
  BorrowRequestStatus,
  Review,
  Notification,
  NotificationType,
  AuthUser,
  Session,
  SignUpCredentials,
  SignInCredentials,
  ApiError,
  ApiResponse,
} from './types.js';

// Export auth functions
export {
  signUp,
  signIn,
  signOut,
  getSession,
  getCurrentUser,
  onAuthStateChange,
  resetPassword,
  updatePassword,
} from './auth.js';

// Export book functions
export type { CreateBookInput, UpdateBookInput, BookFilters } from './books.js';
export {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getUserBooks,
  getAvailableBooks,
  getBooksWithOwners,
  getAvailableBooksWithOwners,
  getBookWithOwner,
  uploadBookCover,
} from './books.js';

// Export book search functions
export type { BookSearchResult } from './bookSearch.js';
export {
  searchBooks,
  getBookDetails,
  mapCategoryToGenre,
} from './bookSearch.js';

// Export borrow request functions
export type {
  CreateBorrowRequestInput,
  UpdateBorrowRequestInput,
  BorrowRequestFilters,
} from './borrowRequests.js';
export {
  getBorrowRequests,
  getBorrowRequest,
  createBorrowRequest,
  updateBorrowRequest,
  approveBorrowRequest,
  denyBorrowRequest,
  markBookReturned,
  getMyBorrowRequests,
  getIncomingBorrowRequests,
  deleteBorrowRequest,
} from './borrowRequests.js';

// Export review functions
export type { CreateReviewInput, UpdateReviewInput, ReviewFilters } from './reviews.js';
export {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getBookReviews,
  getUserReviews,
  getBookAverageRating,
  hasUserReviewedBook,
} from './reviews.js';

// Export notification functions
export type { CreateNotificationInput, NotificationFilters } from './notifications.js';
export {
  getNotifications,
  getMyNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  subscribeToNotifications,
  notifyBorrowRequest,
  notifyRequestApproved,
  notifyRequestDenied,
} from './notifications.js';

// Export Supabase client for advanced use cases (use sparingly)
// Note: Direct use of supabase client should be avoided in apps
export { supabase } from './supabaseClient.js';
