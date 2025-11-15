/**
 * Admin API Functions
 *
 * Provides backend-agnostic admin functions for the admin dashboard.
 * Currently implemented with Supabase.
 *
 * IMPORTANT: These functions should only be called by admin users.
 * Authorization is enforced at the application level by checking the
 * is_admin flag on the user. Always use the useIsAdmin() hook to
 * verify admin status before calling these functions.
 */

import { supabase } from './supabaseClient.js';
import type { User, BorrowRequest, BookWithOwner, BorrowRequestWithDetails, Review } from './types.js';

// Admin-specific types

export interface AdminStats {
  totalUsers: number;
  totalBooks: number;
  activeBorrows: number;
  pendingRequests: number;
  totalBorrowRequests: number;
  completedBorrows: number;
}

export interface ActivityItem {
  id: string;
  type: 'user_signup' | 'book_added' | 'borrow_request' | 'book_returned' | 'request_approved' | 'request_denied';
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  bookId?: string;
  bookTitle?: string;
}

export interface UserFilters {
  search?: string; // Search by name or email
  isAdmin?: boolean;
  sortBy?: 'created_at' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface BookFilters {
  search?: string; // Search by title or author
  genre?: string;
  borrowable?: boolean;
  sortBy?: 'created_at' | 'title' | 'author';
  sortOrder?: 'asc' | 'desc';
}

export interface BorrowRequestFilters {
  status?: BorrowRequest['status'];
  sortBy?: 'requested_at' | 'approved_at' | 'returned_at';
  sortOrder?: 'asc' | 'desc';
}

export interface GenreDistribution {
  genre: string;
  count: number;
}

export interface BorrowActivityData {
  date: string;
  requests: number;
  approvals: number;
  returns: number;
}

export interface UserGrowthData {
  date: string;
  totalUsers: number;
  newUsers: number;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface UpdateUserInput {
  name?: string;
  bio?: string;
  avatar_url?: string;
}

export interface UpdateBookInput {
  title?: string;
  author?: string;
  isbn?: string;
  genre?: string;
  description?: string;
  cover_image_url?: string;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  borrowable?: boolean;
}

// System Notifications types
export type UserGroup = 'all' | 'admins' | 'borrowers' | 'lenders' | 'suspended';

export interface BroadcastNotificationInput {
  title: string;
  message: string;
  type?: 'announcement' | 'alert' | 'info';
}

export interface GroupNotificationInput {
  group: UserGroup;
  title: string;
  message: string;
  type?: 'announcement' | 'alert' | 'info';
}

export interface UserNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: 'announcement' | 'alert' | 'info';
}

// Advanced Analytics types
export interface ActiveUser {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  totalBorrows: number;
  totalLends: number;
  activeRequests: number;
}

export interface PopularBook {
  id: string;
  title: string;
  author: string;
  cover_image_url: string | null;
  genre: string | null;
  owner_id: string;
  ownerName: string;
  totalBorrows: number;
  averageRating: number | null;
}

export interface BorrowDurationMetrics {
  averageDays: number;
  medianDays: number;
  minDays: number;
  maxDays: number;
  totalCompletedBorrows: number;
}

export interface UserRetentionMetrics {
  totalUsers: number;
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  retentionRate7Days: number;
  retentionRate30Days: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
}

export interface PlatformKPIs {
  totalUsers: number;
  totalBooks: number;
  totalBorrows: number;
  activeBorrows: number;
  completedBorrows: number;
  averageBooksPerUser: number;
  averageBorrowsPerBook: number;
  userGrowthRate30Days: number;
  bookGrowthRate30Days: number;
  borrowGrowthRate30Days: number;
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
  // Get total users
  const { count: totalUsers, error: usersError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  if (usersError) throw usersError;

  // Get total books
  const { count: totalBooks, error: booksError } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true });

  if (booksError) throw booksError;

  // Get active borrows (borrowed status)
  const { count: activeBorrows, error: activeBorrowsError } = await supabase
    .from('borrow_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'borrowed');

  if (activeBorrowsError) throw activeBorrowsError;

  // Get pending requests
  const { count: pendingRequests, error: pendingError } = await supabase
    .from('borrow_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (pendingError) throw pendingError;

  // Get total borrow requests
  const { count: totalBorrowRequests, error: totalRequestsError } = await supabase
    .from('borrow_requests')
    .select('*', { count: 'exact', head: true });

  if (totalRequestsError) throw totalRequestsError;

  // Get completed borrows (returned status)
  const { count: completedBorrows, error: completedError } = await supabase
    .from('borrow_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'returned');

  if (completedError) throw completedError;

  return {
    totalUsers: totalUsers ?? 0,
    totalBooks: totalBooks ?? 0,
    activeBorrows: activeBorrows ?? 0,
    pendingRequests: pendingRequests ?? 0,
    totalBorrowRequests: totalBorrowRequests ?? 0,
    completedBorrows: completedBorrows ?? 0,
  };
}

/**
 * Get all users with optional filters
 */
export async function getAllUsers(filters?: UserFilters): Promise<User[]> {
  let query = supabase
    .from('users')
    .select('*');

  // Apply search filter
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  // Apply admin filter
  if (filters?.isAdmin !== undefined) {
    query = query.eq('is_admin', filters.isAdmin);
  }

  // Apply sorting
  const sortBy = filters?.sortBy ?? 'created_at';
  const sortOrder = filters?.sortOrder ?? 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all books with optional filters and owner details
 */
export async function getAllBooks(filters?: BookFilters): Promise<BookWithOwner[]> {
  let query = supabase
    .from('books')
    .select(`
      *,
      owner:users!owner_id (
        id,
        name,
        email,
        avatar_url
      )
    `);

  // Apply search filter
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
  }

  // Apply genre filter
  if (filters?.genre) {
    query = query.eq('genre', filters.genre);
  }

  // Apply borrowable filter
  if (filters?.borrowable !== undefined) {
    query = query.eq('borrowable', filters.borrowable);
  }

  // Apply sorting
  const sortBy = filters?.sortBy ?? 'created_at';
  const sortOrder = filters?.sortOrder ?? 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all borrow requests with optional filters and related details
 */
export async function getAllBorrowRequests(
  filters?: BorrowRequestFilters
): Promise<BorrowRequestWithDetails[]> {
  let query = supabase
    .from('borrow_requests')
    .select(`
      *,
      book:books!book_id (
        id,
        title,
        author,
        cover_image_url,
        genre
      ),
      borrower:users!borrower_id (
        id,
        name,
        email,
        avatar_url
      ),
      owner:users!owner_id (
        id,
        name,
        email,
        avatar_url
      )
    `);

  // Apply status filter
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  // Apply sorting
  const sortBy = filters?.sortBy ?? 'requested_at';
  const sortOrder = filters?.sortOrder ?? 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

/**
 * Get recent activity for the admin dashboard
 */
export async function getRecentActivity(limit: number = 20): Promise<ActivityItem[]> {
  const activities: ActivityItem[] = [];

  // Get recent users (sign ups)
  const { data: recentUsers } = await supabase
    .from('users')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (recentUsers) {
    activities.push(
      ...recentUsers.map((user) => ({
        id: `user-${user.id}`,
        type: 'user_signup' as const,
        description: `${user.name} joined BookShare`,
        timestamp: user.created_at,
        userId: user.id,
        userName: user.name,
      }))
    );
  }

  // Get recent books
  const { data: recentBooks } = await supabase
    .from('books')
    .select(`
      id,
      title,
      created_at,
      owner:users!owner_id (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (recentBooks) {
    activities.push(
      ...recentBooks.map((book: any) => {
        const ownerData = Array.isArray(book.owner) ? book.owner[0] : book.owner;
        return {
          id: `book-${book.id}`,
          type: 'book_added' as const,
          description: `${ownerData?.name ?? 'Someone'} added "${book.title}"`,
          timestamp: book.created_at,
          userId: ownerData?.id,
          userName: ownerData?.name,
          bookId: book.id,
          bookTitle: book.title,
        };
      })
    );
  }

  // Get recent borrow requests
  const { data: recentRequests } = await supabase
    .from('borrow_requests')
    .select(`
      id,
      status,
      requested_at,
      approved_at,
      returned_at,
      book:books!book_id (
        id,
        title
      ),
      borrower:users!borrower_id (
        id,
        name
      )
    `)
    .order('requested_at', { ascending: false })
    .limit(10);

  if (recentRequests) {
    for (const request of recentRequests as any[]) {
      const bookData = Array.isArray(request.book) ? request.book[0] : request.book;
      const borrowerData = Array.isArray(request.borrower) ? request.borrower[0] : request.borrower;

      // Add request event
      activities.push({
        id: `request-${request.id}`,
        type: 'borrow_request',
        description: `${borrowerData?.name ?? 'Someone'} requested "${bookData?.title ?? 'a book'}"`,
        timestamp: request.requested_at,
        userId: borrowerData?.id,
        userName: borrowerData?.name,
        bookId: bookData?.id,
        bookTitle: bookData?.title,
      });

      // Add approval event if approved
      if (request.status === 'approved' && request.approved_at) {
        activities.push({
          id: `approved-${request.id}`,
          type: 'request_approved',
          description: `Request for "${bookData?.title ?? 'a book'}" was approved`,
          timestamp: request.approved_at,
          bookId: bookData?.id,
          bookTitle: bookData?.title,
        });
      }

      // Add denial event if denied
      if (request.status === 'denied' && request.approved_at) {
        activities.push({
          id: `denied-${request.id}`,
          type: 'request_denied',
          description: `Request for "${bookData?.title ?? 'a book'}" was denied`,
          timestamp: request.approved_at,
          bookId: bookData?.id,
          bookTitle: bookData?.title,
        });
      }

      // Add return event if returned
      if (request.status === 'returned' && request.returned_at) {
        activities.push({
          id: `returned-${request.id}`,
          type: 'book_returned',
          description: `"${bookData?.title ?? 'A book'}" was returned`,
          timestamp: request.returned_at,
          bookId: bookData?.id,
          bookTitle: bookData?.title,
        });
      }
    }
  }

  // Sort all activities by timestamp and limit
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get genre distribution for charts
 */
export async function getGenreDistribution(): Promise<GenreDistribution[]> {
  const { data, error } = await supabase
    .from('books')
    .select('genre');

  if (error) throw error;

  // Count books by genre
  const genreCounts = new Map<string, number>();

  data?.forEach((book) => {
    const genre = book.genre ?? 'Unknown';
    genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
  });

  return Array.from(genreCounts.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get borrow activity data for the last 30 days
 */
export async function getBorrowActivityData(): Promise<BorrowActivityData[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('borrow_requests')
    .select('status, requested_at, approved_at, returned_at')
    .gte('requested_at', thirtyDaysAgo.toISOString());

  if (error) throw error;

  // Group by date
  const activityByDate = new Map<string, { requests: number; approvals: number; returns: number }>();

  data?.forEach((request) => {
    // Count requests
    const requestDate = new Date(request.requested_at).toISOString().split('T')[0];
    if (!activityByDate.has(requestDate)) {
      activityByDate.set(requestDate, { requests: 0, approvals: 0, returns: 0 });
    }
    activityByDate.get(requestDate)!.requests += 1;

    // Count approvals
    if (request.approved_at) {
      const approvalDate = new Date(request.approved_at).toISOString().split('T')[0];
      if (!activityByDate.has(approvalDate)) {
        activityByDate.set(approvalDate, { requests: 0, approvals: 0, returns: 0 });
      }
      activityByDate.get(approvalDate)!.approvals += 1;
    }

    // Count returns
    if (request.returned_at) {
      const returnDate = new Date(request.returned_at).toISOString().split('T')[0];
      if (!activityByDate.has(returnDate)) {
        activityByDate.set(returnDate, { requests: 0, approvals: 0, returns: 0 });
      }
      activityByDate.get(returnDate)!.returns += 1;
    }
  });

  // Convert to array and sort by date
  return Array.from(activityByDate.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get user growth data for the last 30 days
 */
export async function getUserGrowthData(): Promise<UserGrowthData[]> {
  const { data, error } = await supabase
    .from('users')
    .select('created_at')
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Group by date and calculate cumulative total
  const usersByDate = new Map<string, number>();

  data?.forEach((user) => {
    const date = new Date(user.created_at).toISOString().split('T')[0];
    usersByDate.set(date, (usersByDate.get(date) ?? 0) + 1);
  });

  // Calculate cumulative totals for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const growthData: UserGrowthData[] = [];
  let cumulativeTotal = 0;

  // Count users before the 30-day window
  data?.forEach((user) => {
    if (new Date(user.created_at) < thirtyDaysAgo) {
      cumulativeTotal += 1;
    }
  });

  // Generate data for each day in the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    const newUsers = usersByDate.get(dateString) ?? 0;
    cumulativeTotal += newUsers;

    growthData.push({
      date: dateString,
      totalUsers: cumulativeTotal,
      newUsers,
    });
  }

  return growthData;
}

/**
 * Check if the current user is an admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase.rpc('is_user_admin', {
    user_id: user.id,
  });

  if (error) throw error;
  return data ?? false;
}

// ==========================
// USER MANAGEMENT FUNCTIONS
// ==========================

/**
 * Update user's admin status (promote/demote)
 */
export async function updateUserAdminStatus(
  userId: string,
  isAdmin: boolean
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ is_admin: isAdmin })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Suspend a user account
 */
export async function suspendUser(userId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      suspended: true,
      suspended_at: new Date().toISOString(),
      suspended_reason: reason,
    })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Unsuspend a user account
 */
export async function unsuspendUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      suspended: false,
      suspended_at: null,
      suspended_reason: null,
    })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Update user profile information
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateUserInput
): Promise<User> {
  const { data: user, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return user;
}

/**
 * Get user activity history
 */
export async function getUserActivityHistory(
  userId: string,
  limit: number = 50
): Promise<UserActivityLog[]> {
  const { data, error } = await supabase
    .from('user_activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/**
 * Delete a user account (dangerous operation)
 */
export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) throw error;
}

// ==========================
// CONTENT MODERATION FUNCTIONS
// ==========================

/**
 * Delete a book
 */
export async function deleteBook(bookId: string): Promise<void> {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', bookId);

  if (error) throw error;
}

/**
 * Update book information
 */
export async function updateBook(
  bookId: string,
  data: UpdateBookInput
): Promise<BookWithOwner> {
  const { data: book, error } = await supabase
    .from('books')
    .update(data)
    .eq('id', bookId)
    .select(`
      *,
      owner:users!owner_id (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;
  return book;
}

/**
 * Flag a book as inappropriate
 */
export async function flagBook(bookId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('books')
    .update({
      flagged: true,
      flagged_at: new Date().toISOString(),
      flagged_reason: reason,
    })
    .eq('id', bookId);

  if (error) throw error;
}

/**
 * Unflag a book
 */
export async function unflagBook(bookId: string): Promise<void> {
  const { error } = await supabase
    .from('books')
    .update({
      flagged: false,
      flagged_at: null,
      flagged_reason: null,
    })
    .eq('id', bookId);

  if (error) throw error;
}

/**
 * Get all reviews with optional book filter
 */
export async function getAllReviews(bookId?: string): Promise<Review[]> {
  let query = supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (bookId) {
    query = query.eq('book_id', bookId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) throw error;
}

// ==========================
// REQUEST OVERRIDE FUNCTIONS
// ==========================

/**
 * Admin approve a borrow request (override owner approval)
 */
export async function adminApproveRequest(
  requestId: string,
  dueDate: string,
  message?: string
): Promise<BorrowRequestWithDetails> {
  const { data: request, error } = await supabase
    .from('borrow_requests')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      due_date: dueDate,
      response_message: message || 'Approved by admin',
    })
    .eq('id', requestId)
    .select(`
      *,
      book:books!book_id (
        id,
        title,
        author,
        cover_image_url,
        genre
      ),
      borrower:users!borrower_id (
        id,
        name,
        email,
        avatar_url
      ),
      owner:users!owner_id (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;
  return request;
}

/**
 * Admin deny a borrow request (override owner approval)
 */
export async function adminDenyRequest(
  requestId: string,
  reason: string
): Promise<BorrowRequestWithDetails> {
  const { data: request, error } = await supabase
    .from('borrow_requests')
    .update({
      status: 'denied',
      approved_at: new Date().toISOString(),
      response_message: reason,
    })
    .eq('id', requestId)
    .select(`
      *,
      book:books!book_id (
        id,
        title,
        author,
        cover_image_url,
        genre
      ),
      borrower:users!borrower_id (
        id,
        name,
        email,
        avatar_url
      ),
      owner:users!owner_id (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;
  return request;
}

/**
 * Admin cancel a borrow request (for stuck/problematic requests)
 */
export async function adminCancelRequest(
  requestId: string
): Promise<void> {
  const { error } = await supabase
    .from('borrow_requests')
    .delete()
    .eq('id', requestId);

  if (error) throw error;
}

/**
 * Admin mark a borrow request as returned (force return)
 */
export async function adminMarkAsReturned(
  requestId: string
): Promise<BorrowRequestWithDetails> {
  const { data: request, error } = await supabase
    .from('borrow_requests')
    .update({
      status: 'returned',
      returned_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select(`
      *,
      book:books!book_id (
        id,
        title,
        author,
        cover_image_url,
        genre
      ),
      borrower:users!borrower_id (
        id,
        name,
        email,
        avatar_url
      ),
      owner:users!owner_id (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;

  // Also set the book back to borrowable
  if (request.book_id) {
    await supabase
      .from('books')
      .update({ borrowable: true })
      .eq('id', request.book_id);
  }

  return request;
}

// ==========================
// SYSTEM NOTIFICATIONS FUNCTIONS
// ==========================

/**
 * Send a broadcast notification to all users
 */
export async function sendBroadcastNotification(
  input: BroadcastNotificationInput
): Promise<void> {
  // Get all user IDs
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id');

  if (usersError) throw usersError;

  if (!users || users.length === 0) return;

  // Create notifications for all users
  const notifications = users.map((user) => ({
    user_id: user.id,
    type: 'new_message',
    title: input.title,
    message: input.message,
    payload: { type: input.type ?? 'announcement' },
  }));

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) throw error;
}

/**
 * Send a notification to a specific user group
 */
export async function sendGroupNotification(
  input: GroupNotificationInput
): Promise<void> {
  let query = supabase.from('users').select('id');

  // Filter by group
  switch (input.group) {
    case 'all':
      // No filter needed
      break;
    case 'admins':
      query = query.eq('is_admin', true);
      break;
    case 'suspended':
      query = query.eq('suspended', true);
      break;
    case 'borrowers':
      // Users who have made borrow requests
      const { data: borrowerIds } = await supabase
        .from('borrow_requests')
        .select('borrower_id')
        .not('borrower_id', 'is', null);

      if (borrowerIds && borrowerIds.length > 0) {
        const uniqueBorrowerIds = [...new Set(borrowerIds.map(b => b.borrower_id))];
        query = query.in('id', uniqueBorrowerIds);
      } else {
        return; // No borrowers found
      }
      break;
    case 'lenders':
      // Users who own books
      const { data: lenderIds } = await supabase
        .from('books')
        .select('owner_id')
        .not('owner_id', 'is', null);

      if (lenderIds && lenderIds.length > 0) {
        const uniqueLenderIds = [...new Set(lenderIds.map(l => l.owner_id))];
        query = query.in('id', uniqueLenderIds);
      } else {
        return; // No lenders found
      }
      break;
  }

  const { data: users, error: usersError } = await query;

  if (usersError) throw usersError;

  if (!users || users.length === 0) return;

  // Create notifications for all users in the group
  const notifications = users.map((user) => ({
    user_id: user.id,
    type: 'new_message',
    title: input.title,
    message: input.message,
    payload: { type: input.type ?? 'announcement', group: input.group },
  }));

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) throw error;
}

/**
 * Send a notification to an individual user
 */
export async function sendUserNotification(
  input: UserNotificationInput
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: input.userId,
      type: 'new_message',
      title: input.title,
      message: input.message,
      payload: { type: input.type ?? 'announcement' },
    });

  if (error) throw error;
}

// ==========================
// ADVANCED ANALYTICS FUNCTIONS
// ==========================

/**
 * Get most active users (leaderboard)
 */
export async function getMostActiveUsers(limit: number = 10): Promise<ActiveUser[]> {
  // Get all users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, email, avatar_url');

  if (usersError) throw usersError;

  if (!users || users.length === 0) return [];

  // Get borrow counts for each user
  const userStats = await Promise.all(
    users.map(async (user) => {
      // Count total borrows (as borrower)
      const { count: totalBorrows } = await supabase
        .from('borrow_requests')
        .select('*', { count: 'exact', head: true })
        .eq('borrower_id', user.id);

      // Count total lends (as owner)
      const { count: totalLends } = await supabase
        .from('borrow_requests')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      // Count active requests
      const { count: activeRequests } = await supabase
        .from('borrow_requests')
        .select('*', { count: 'exact', head: true })
        .or(`borrower_id.eq.${user.id},owner_id.eq.${user.id}`)
        .in('status', ['pending', 'approved', 'borrowed']);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        totalBorrows: totalBorrows ?? 0,
        totalLends: totalLends ?? 0,
        activeRequests: activeRequests ?? 0,
      };
    })
  );

  // Sort by total activity (borrows + lends) and limit
  return userStats
    .sort((a, b) => (b.totalBorrows + b.totalLends) - (a.totalBorrows + a.totalLends))
    .slice(0, limit);
}

/**
 * Get most borrowed books (popular books)
 */
export async function getMostBorrowedBooks(limit: number = 10): Promise<PopularBook[]> {
  // Get all books with owner info
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select(`
      id,
      title,
      author,
      cover_image_url,
      genre,
      owner_id,
      owner:users!owner_id (
        name
      )
    `);

  if (booksError) throw booksError;

  if (!books || books.length === 0) return [];

  // Get borrow counts and ratings for each book
  const bookStats = await Promise.all(
    books.map(async (book: any) => {
      const ownerData = Array.isArray(book.owner) ? book.owner[0] : book.owner;

      // Count total borrows
      const { count: totalBorrows } = await supabase
        .from('borrow_requests')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', book.id);

      // Get average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('book_id', book.id);

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

      return {
        id: book.id,
        title: book.title,
        author: book.author,
        cover_image_url: book.cover_image_url,
        genre: book.genre,
        owner_id: book.owner_id,
        ownerName: ownerData?.name ?? 'Unknown',
        totalBorrows: totalBorrows ?? 0,
        averageRating,
      };
    })
  );

  // Sort by total borrows and limit
  return bookStats
    .sort((a, b) => b.totalBorrows - a.totalBorrows)
    .slice(0, limit);
}

/**
 * Get average borrow duration metrics
 */
export async function getAverageBorrowDuration(): Promise<BorrowDurationMetrics> {
  // Get all completed borrows with due date and return date
  const { data: completedBorrows, error } = await supabase
    .from('borrow_requests')
    .select('approved_at, returned_at')
    .eq('status', 'returned')
    .not('approved_at', 'is', null)
    .not('returned_at', 'is', null);

  if (error) throw error;

  if (!completedBorrows || completedBorrows.length === 0) {
    return {
      averageDays: 0,
      medianDays: 0,
      minDays: 0,
      maxDays: 0,
      totalCompletedBorrows: 0,
    };
  }

  // Calculate duration in days for each borrow
  const durations = completedBorrows.map((borrow) => {
    const approvedDate = new Date(borrow.approved_at!);
    const returnedDate = new Date(borrow.returned_at!);
    return Math.ceil((returnedDate.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24));
  });

  // Sort for median calculation
  const sortedDurations = [...durations].sort((a, b) => a - b);

  // Calculate statistics
  const averageDays = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const medianDays = sortedDurations.length % 2 === 0
    ? (sortedDurations[sortedDurations.length / 2 - 1] + sortedDurations[sortedDurations.length / 2]) / 2
    : sortedDurations[Math.floor(sortedDurations.length / 2)];
  const minDays = Math.min(...durations);
  const maxDays = Math.max(...durations);

  return {
    averageDays: Math.round(averageDays * 10) / 10, // Round to 1 decimal
    medianDays: Math.round(medianDays * 10) / 10,
    minDays,
    maxDays,
    totalCompletedBorrows: completedBorrows.length,
  };
}

/**
 * Get user retention metrics
 */
export async function getUserRetentionMetrics(): Promise<UserRetentionMetrics> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // Get new users in last 7 days
  const { count: newUsersLast7Days } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString());

  // Get new users in last 30 days
  const { count: newUsersLast30Days } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Get active users (who have activity in last 7 days)
  const { data: activeUsers7Days } = await supabase
    .from('user_activity_logs')
    .select('user_id')
    .gte('created_at', sevenDaysAgo.toISOString());

  const uniqueActiveUsers7Days = activeUsers7Days
    ? new Set(activeUsers7Days.map(a => a.user_id)).size
    : 0;

  // Get active users (who have activity in last 30 days)
  const { data: activeUsers30Days } = await supabase
    .from('user_activity_logs')
    .select('user_id')
    .gte('created_at', thirtyDaysAgo.toISOString());

  const uniqueActiveUsers30Days = activeUsers30Days
    ? new Set(activeUsers30Days.map(a => a.user_id)).size
    : 0;

  // Calculate retention rates
  const retentionRate7Days = totalUsers && totalUsers > 0
    ? (uniqueActiveUsers7Days / totalUsers) * 100
    : 0;

  const retentionRate30Days = totalUsers && totalUsers > 0
    ? (uniqueActiveUsers30Days / totalUsers) * 100
    : 0;

  return {
    totalUsers: totalUsers ?? 0,
    activeUsersLast7Days: uniqueActiveUsers7Days,
    activeUsersLast30Days: uniqueActiveUsers30Days,
    retentionRate7Days: Math.round(retentionRate7Days * 10) / 10,
    retentionRate30Days: Math.round(retentionRate30Days * 10) / 10,
    newUsersLast7Days: newUsersLast7Days ?? 0,
    newUsersLast30Days: newUsersLast30Days ?? 0,
  };
}

/**
 * Get platform KPIs (Key Performance Indicators)
 */
export async function getPlatformKPIs(): Promise<PlatformKPIs> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get current totals
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { count: totalBooks } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true });

  const { count: totalBorrows } = await supabase
    .from('borrow_requests')
    .select('*', { count: 'exact', head: true });

  const { count: activeBorrows } = await supabase
    .from('borrow_requests')
    .select('*', { count: 'exact', head: true })
    .in('status', ['approved', 'borrowed']);

  const { count: completedBorrows } = await supabase
    .from('borrow_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'returned');

  // Get counts from 30 days ago for growth rate calculation
  const { count: usersThirtyDaysAgo } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .lt('created_at', thirtyDaysAgo.toISOString());

  const { count: booksThirtyDaysAgo } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .lt('created_at', thirtyDaysAgo.toISOString());

  const { count: borrowsThirtyDaysAgo } = await supabase
    .from('borrow_requests')
    .select('*', { count: 'exact', head: true })
    .lt('requested_at', thirtyDaysAgo.toISOString());

  // Calculate growth rates
  const userGrowthRate30Days = usersThirtyDaysAgo && usersThirtyDaysAgo > 0
    ? (((totalUsers ?? 0) - usersThirtyDaysAgo) / usersThirtyDaysAgo) * 100
    : 0;

  const bookGrowthRate30Days = booksThirtyDaysAgo && booksThirtyDaysAgo > 0
    ? (((totalBooks ?? 0) - booksThirtyDaysAgo) / booksThirtyDaysAgo) * 100
    : 0;

  const borrowGrowthRate30Days = borrowsThirtyDaysAgo && borrowsThirtyDaysAgo > 0
    ? (((totalBorrows ?? 0) - borrowsThirtyDaysAgo) / borrowsThirtyDaysAgo) * 100
    : 0;

  // Calculate averages
  const averageBooksPerUser = totalUsers && totalUsers > 0
    ? (totalBooks ?? 0) / totalUsers
    : 0;

  const averageBorrowsPerBook = totalBooks && totalBooks > 0
    ? (totalBorrows ?? 0) / totalBooks
    : 0;

  return {
    totalUsers: totalUsers ?? 0,
    totalBooks: totalBooks ?? 0,
    totalBorrows: totalBorrows ?? 0,
    activeBorrows: activeBorrows ?? 0,
    completedBorrows: completedBorrows ?? 0,
    averageBooksPerUser: Math.round(averageBooksPerUser * 10) / 10,
    averageBorrowsPerBook: Math.round(averageBorrowsPerBook * 10) / 10,
    userGrowthRate30Days: Math.round(userGrowthRate30Days * 10) / 10,
    bookGrowthRate30Days: Math.round(bookGrowthRate30Days * 10) / 10,
    borrowGrowthRate30Days: Math.round(borrowGrowthRate30Days * 10) / 10,
  };
}
