/**
 * Test Helpers for API Client Integration Tests
 *
 * Provides utilities for creating test data, users, and cleanup.
 * Uses Faker.js for realistic test data generation.
 */

import { faker } from '@faker-js/faker';
import type { SupabaseClient } from '@supabase/supabase-js';
import { adminClient, registerUserForCleanup } from './setup';

// ============================================================================
// Types
// ============================================================================

export interface TestUser {
  user: {
    id: string;
    email: string;
  };
  email: string;
  password: string;
}

export interface TestBook {
  id: string;
  owner_id: string;
  title: string;
  author: string;
  genre: string | null;
  condition: string;
  borrowable: boolean;
  [key: string]: unknown;
}

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a unique test ID to avoid conflicts between test runs
 */
export const createTestId = (): string => faker.string.uuid();

/**
 * Generate a unique email for testing
 */
export const createTestEmail = (): string => {
  // Use a unique prefix to easily identify test users
  return `test_${faker.string.alphanumeric(8)}@test.local`;
};

// ============================================================================
// User Helpers
// ============================================================================

/**
 * Create a test user using the admin client (bypasses normal auth flow)
 * User is automatically registered for cleanup after tests
 */
export async function createTestUser(
  overrides: Partial<{
    email: string;
    password: string;
    name: string;
  }> = {}
): Promise<TestUser> {
  const email = overrides.email || createTestEmail();
  const password = overrides.password || 'TestPassword123!';
  const name = overrides.name || faker.person.fullName();

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm for testing
    user_metadata: {
      name,
    },
  });

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  if (!data.user) {
    throw new Error('Failed to create test user: No user returned');
  }

  // Register for cleanup
  registerUserForCleanup(data.user.id);

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
    },
    email,
    password,
  };
}

/**
 * Sign in as a test user using the provided client
 */
export async function signInTestUser(
  client: SupabaseClient,
  email: string,
  password: string
): Promise<{ user: { id: string; email: string } }> {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to sign in test user: ${error.message}`);
  }

  if (!data.user) {
    throw new Error('Failed to sign in: No user returned');
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
    },
  };
}

/**
 * Sign out a test user
 */
export async function signOutTestUser(client: SupabaseClient): Promise<void> {
  await client.auth.signOut();
}

/**
 * Delete a test user (via admin client)
 */
export async function deleteTestUser(userId: string): Promise<void> {
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) {
    console.warn(`Failed to delete test user ${userId}:`, error.message);
  }
}

// ============================================================================
// Book Helpers
// ============================================================================

const BOOK_GENRES = ['fiction', 'nonfiction', 'scifi', 'mystery', 'romance', 'biography', 'history'];
const BOOK_CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor'];

/**
 * Create a test book using the admin client (bypasses RLS)
 */
export async function createTestBook(
  ownerId: string,
  overrides: Partial<{
    title: string;
    author: string;
    isbn: string;
    genre: string;
    description: string;
    cover_image_url: string;
    condition: string;
    borrowable: boolean;
  }> = {}
): Promise<TestBook> {
  const bookData = {
    owner_id: ownerId,
    title: overrides.title || faker.lorem.words(3),
    author: overrides.author || faker.person.fullName(),
    isbn: overrides.isbn || faker.string.numeric(13),
    genre: overrides.genre ?? faker.helpers.arrayElement(BOOK_GENRES),
    description: overrides.description || faker.lorem.paragraph(),
    cover_image_url: overrides.cover_image_url || null,
    condition: overrides.condition || faker.helpers.arrayElement(BOOK_CONDITIONS),
    borrowable: overrides.borrowable ?? true,
  };

  const { data, error } = await adminClient.from('books').insert(bookData).select().single();

  if (error) {
    throw new Error(`Failed to create test book: ${error.message}`);
  }

  return data as TestBook;
}

/**
 * Delete a test book
 */
export async function deleteTestBook(bookId: string): Promise<void> {
  const { error } = await adminClient.from('books').delete().eq('id', bookId);
  if (error) {
    console.warn(`Failed to delete test book ${bookId}:`, error.message);
  }
}

/**
 * Delete all books for a user
 */
export async function cleanupTestBooks(ownerId: string): Promise<void> {
  const { error } = await adminClient.from('books').delete().eq('owner_id', ownerId);
  if (error) {
    console.warn(`Failed to cleanup books for user ${ownerId}:`, error.message);
  }
}

// ============================================================================
// Borrow Request Helpers
// ============================================================================

/**
 * Create a test borrow request using the admin client
 */
export async function createTestBorrowRequest(
  bookId: string,
  borrowerId: string,
  ownerId: string,
  overrides: Partial<{
    status: string;
    request_message: string;
  }> = {}
): Promise<{
  id: string;
  book_id: string;
  borrower_id: string;
  owner_id: string;
  status: string;
}> {
  const requestData = {
    book_id: bookId,
    borrower_id: borrowerId,
    owner_id: ownerId,
    status: overrides.status || 'pending',
    request_message: overrides.request_message || faker.lorem.sentence(),
  };

  const { data, error } = await adminClient.from('borrow_requests').insert(requestData).select().single();

  if (error) {
    throw new Error(`Failed to create test borrow request: ${error.message}`);
  }

  return data;
}

/**
 * Delete a test borrow request
 */
export async function deleteTestBorrowRequest(requestId: string): Promise<void> {
  const { error } = await adminClient.from('borrow_requests').delete().eq('id', requestId);
  if (error) {
    console.warn(`Failed to delete test borrow request ${requestId}:`, error.message);
  }
}

/**
 * Delete all borrow requests for a book
 */
export async function cleanupTestBorrowRequests(bookId: string): Promise<void> {
  const { error } = await adminClient.from('borrow_requests').delete().eq('book_id', bookId);
  if (error) {
    console.warn(`Failed to cleanup borrow requests for book ${bookId}:`, error.message);
  }
}

// ============================================================================
// Review Helpers
// ============================================================================

/**
 * Create a test review using the admin client
 */
export async function createTestReview(
  bookId: string,
  userId: string,
  overrides: Partial<{
    rating: number;
    comment: string;
  }> = {}
): Promise<{
  id: string;
  book_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
}> {
  const reviewData = {
    book_id: bookId,
    user_id: userId,
    rating: overrides.rating ?? faker.number.int({ min: 1, max: 5 }),
    comment: overrides.comment ?? faker.lorem.sentence(),
  };

  const { data, error } = await adminClient.from('reviews').insert(reviewData).select().single();

  if (error) {
    throw new Error(`Failed to create test review: ${error.message}`);
  }

  return data;
}

/**
 * Delete all reviews for a book
 */
export async function cleanupTestReviews(bookId: string): Promise<void> {
  const { error } = await adminClient.from('reviews').delete().eq('book_id', bookId);
  if (error) {
    console.warn(`Failed to cleanup reviews for book ${bookId}:`, error.message);
  }
}

// ============================================================================
// Notification Helpers
// ============================================================================

/**
 * Delete all notifications for a user
 */
export async function cleanupTestNotifications(userId: string): Promise<void> {
  const { error } = await adminClient.from('notifications').delete().eq('user_id', userId);
  if (error) {
    console.warn(`Failed to cleanup notifications for user ${userId}:`, error.message);
  }
}

// ============================================================================
// Message Helpers
// ============================================================================

/**
 * Delete all messages for a borrow request
 */
export async function cleanupTestMessages(borrowRequestId: string): Promise<void> {
  const { error } = await adminClient.from('messages').delete().eq('borrow_request_id', borrowRequestId);
  if (error) {
    console.warn(`Failed to cleanup messages for request ${borrowRequestId}:`, error.message);
  }
}

// ============================================================================
// Comprehensive Cleanup
// ============================================================================

/**
 * Clean up all test data for a user
 * Call this in afterAll() to ensure clean state
 */
export async function cleanupTestDataForUser(userId: string): Promise<void> {
  // Get user's books first
  const { data: books } = await adminClient.from('books').select('id').eq('owner_id', userId);

  // Clean up related data for each book
  if (books) {
    for (const book of books) {
      await cleanupTestReviews(book.id);
      await cleanupTestBorrowRequests(book.id);
    }
  }

  // Clean up user's direct data
  await cleanupTestBooks(userId);
  await cleanupTestNotifications(userId);

  // Finally, delete the user
  await deleteTestUser(userId);
}
