/**
 * User search and profile functions
 *
 * Backend abstraction layer for user-related operations.
 */

import { supabase } from './supabaseClient.js';
import type { User } from './types.js';

/**
 * Search users by name or email
 */
export async function searchUsers(query: string, limit = 10): Promise<User[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.trim();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .limit(limit)
    .order('name');

  if (error) throw error;
  return (data || []) as User[];
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as User;
}
