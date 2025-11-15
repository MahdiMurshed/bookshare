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
