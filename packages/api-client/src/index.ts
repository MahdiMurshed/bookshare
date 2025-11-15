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
  BorrowRequestWithDetails,
  BorrowRequestStatus,
  HandoverMethod,
  ReturnMethod,
  Review,
  Notification,
  NotificationType,
  Message,
  MessageWithSender,
  ChatSummary,
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
  HandoverDetails,
  ReturnDetails,
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
  getMyBorrowRequestsWithDetails,
  getIncomingBorrowRequestsWithDetails,
  getActiveChats,
  deleteBorrowRequest,
  markHandoverComplete,
  updateHandoverTracking,
  initiateReturn,
  updateReturnTracking,
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

// Export message functions
export {
  getMessagesByRequest,
  sendMessage,
  subscribeToMessages,
  markMessagesAsRead,
  getUnreadMessageCount,
  getTotalUnreadCount,
} from './messages.js';

// Export admin functions
export type {
  AdminStats,
  ActivityItem,
  UserFilters,
  BookFilters as AdminBookFilters,
  BorrowRequestFilters as AdminBorrowRequestFilters,
  GenreDistribution,
  BorrowActivityData,
  UserGrowthData,
  UserActivityLog,
  UpdateUserInput,
  UpdateBookInput as AdminUpdateBookInput,
} from './admin.js';
export {
  getAdminStats,
  getAllUsers,
  getAllBooks,
  getAllBorrowRequests,
  getRecentActivity,
  getGenreDistribution,
  getBorrowActivityData,
  getUserGrowthData,
  checkIsAdmin,
  // User management functions
  updateUserAdminStatus,
  suspendUser,
  unsuspendUser,
  updateUserProfile,
  getUserActivityHistory,
  deleteUser,
  // Content moderation functions
  deleteBook as adminDeleteBook,
  updateBook as adminUpdateBook,
  flagBook,
  unflagBook,
  getAllReviews,
  deleteReview as adminDeleteReview,
  // Request override functions
  adminApproveRequest,
  adminDenyRequest,
  adminCancelRequest,
  adminMarkAsReturned,
} from './admin.js';

// Export user profile functions
export type { UpdateProfileInput } from './users.js';
export {
  getUserProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  getUserStats,
} from './users.js';

// Export Supabase client for advanced use cases (use sparingly)
// Note: Direct use of supabase client should be avoided in apps
export { supabase } from './supabaseClient.js';
