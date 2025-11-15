/**
 * User profile management abstraction layer
 *
 * Provides backend-agnostic user profile functions.
 * Currently implemented with Supabase.
 *
 * MIGRATION NOTE: When migrating to NestJS, replace Supabase calls
 * with REST API calls to /users/* endpoints while keeping function signatures identical.
 */

import { supabase } from './supabaseClient.js';
import type { User } from './types.js';

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('User not found');

  return data;
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({
      name: input.name,
      bio: input.bio,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update profile');

  // Also update auth user metadata for name
  if (input.name) {
    const { error: authError } = await supabase.auth.updateUser({
      data: { name: input.name }
    });
    if (authError) console.error('Failed to update auth metadata:', authError);
  }

  return data;
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update user profile with new avatar URL
  const { error: updateError } = await supabase
    .from('users')
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) throw updateError;

  // Also update auth user metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl }
  });
  if (authError) console.error('Failed to update auth metadata:', authError);

  return publicUrl;
}

/**
 * Delete user account
 */
export async function deleteAccount(_userId: string): Promise<void> {
  // Note: This is a soft delete - we don't actually delete the user
  // In production, you'd want to handle this carefully with proper cleanup
  // For now, we'll just mark the account as inactive or delete via admin API

  // First, delete all user's data
  // This should be handled by database CASCADE DELETE constraints

  // Then sign out the user
  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  // In a real implementation, you'd call an admin endpoint to delete the account
  // For now, we just sign them out
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string) {
  // Get books owned count
  const { count: booksOwnedCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId);

  // Get books shared count (borrowable books)
  const { count: booksSharedCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)
    .eq('borrowable', true);

  // Get books borrowed count (approved or borrowed status)
  const { count: booksBorrowedCount } = await supabase
    .from('borrow_requests')
    .select('*', { count: 'exact', head: true })
    .eq('borrower_id', userId)
    .in('status', ['approved', 'borrowed', 'return_initiated']);

  // Get total exchanges (all completed borrow requests as owner or borrower)
  const { count: exchangesAsOwnerCount } = await supabase
    .from('borrow_requests')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)
    .eq('status', 'returned');

  const { count: exchangesAsBorrowerCount } = await supabase
    .from('borrow_requests')
    .select('*', { count: 'exact', head: true })
    .eq('borrower_id', userId)
    .eq('status', 'returned');

  return {
    booksOwned: booksOwnedCount || 0,
    booksShared: booksSharedCount || 0,
    booksBorrowed: booksBorrowedCount || 0,
    totalExchanges: (exchangesAsOwnerCount || 0) + (exchangesAsBorrowerCount || 0),
  };
}
