/**
 * Reviews abstraction layer
 *
 * Provides backend-agnostic review management.
 * Currently implemented with Supabase.
 *
 * MIGRATION NOTE: When migrating to NestJS, replace Supabase calls
 * with REST API calls to /reviews/* endpoints while keeping function signatures identical.
 */

import { supabase } from './supabaseClient.js';
import type { Review } from './types.js';

export interface CreateReviewInput {
  book_id: string;
  rating: number; // 1-5
  comment?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

export interface ReviewFilters {
  book_id?: string;
  user_id?: string;
  min_rating?: number;
}

/**
 * Get all reviews with optional filters
 */
export async function getReviews(filters?: ReviewFilters): Promise<Review[]> {
  // Current: Supabase implementation
  let query = supabase.from('reviews').select('*');

  if (filters?.book_id) {
    query = query.eq('book_id', filters.book_id);
  }

  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id);
  }

  if (filters?.min_rating) {
    query = query.gte('rating', filters.min_rating);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Review[];

  // Future: NestJS implementation
  // const params = new URLSearchParams(filters as any);
  // const response = await fetch(`${API_URL}/reviews?${params}`);
  // return response.json();
}

/**
 * Get a single review by ID
 */
export async function getReview(id: string): Promise<Review | null> {
  // Current: Supabase implementation
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data as Review;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/reviews/${id}`);
  // if (response.status === 404) return null;
  // return response.json();
}

/**
 * Create a new review
 */
export async function createReview(input: CreateReviewInput): Promise<Review> {
  // Current: Supabase implementation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated to create a review');

  // Validate rating
  if (input.rating < 1 || input.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      book_id: input.book_id,
      user_id: user.id,
      rating: input.rating,
      comment: input.comment || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Review;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/reviews`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(input),
  // });
  // return response.json();
}

/**
 * Update an existing review
 */
export async function updateReview(id: string, input: UpdateReviewInput): Promise<Review> {
  // Current: Supabase implementation
  // Validate rating if provided
  if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) {
    throw new Error('Rating must be between 1 and 5');
  }

  const { data, error } = await supabase
    .from('reviews')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Review;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/reviews/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(input),
  // });
  // return response.json();
}

/**
 * Delete a review
 */
export async function deleteReview(id: string): Promise<void> {
  // Current: Supabase implementation
  const { error } = await supabase.from('reviews').delete().eq('id', id);

  if (error) throw error;

  // Future: NestJS implementation
  // await fetch(`${API_URL}/reviews/${id}`, { method: 'DELETE' });
}

/**
 * Get reviews for a specific book
 */
export async function getBookReviews(bookId: string): Promise<Review[]> {
  return getReviews({ book_id: bookId });
}

/**
 * Get reviews by a specific user
 */
export async function getUserReviews(userId: string): Promise<Review[]> {
  return getReviews({ user_id: userId });
}

/**
 * Get average rating for a book
 */
export async function getBookAverageRating(bookId: string): Promise<number | null> {
  // Current: Supabase implementation
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('book_id', bookId);

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const sum = data.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0);
  return sum / data.length;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/books/${bookId}/average-rating`);
  // const { averageRating } = await response.json();
  // return averageRating;
}

/**
 * Check if the current user has reviewed a book
 */
export async function hasUserReviewedBook(bookId: string): Promise<boolean> {
  // Current: Supabase implementation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('book_id', bookId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return false; // Not found
    throw error;
  }

  return !!data;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/books/${bookId}/my-review`);
  // return response.status === 200;
}
