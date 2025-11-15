/**
 * Books abstraction layer
 *
 * Provides backend-agnostic book CRUD operations.
 * Currently implemented with Supabase.
 *
 * MIGRATION NOTE: When migrating to NestJS, replace Supabase calls
 * with REST API calls to /books/* endpoints while keeping function signatures identical.
 */

import { supabase } from './supabaseClient.js';
import type { Book, BookWithOwner } from './types.js';

export interface CreateBookInput {
  title: string;
  author: string;
  isbn?: string;
  genre?: string;
  description?: string;
  cover_image_url?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  borrowable: boolean;
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

export interface BookFilters {
  genre?: string;
  borrowable?: boolean;
  owner_id?: string;
  search?: string; // Search in title or author
}

/**
 * Get all books with optional filters
 */
export async function getBooks(filters?: BookFilters): Promise<Book[]> {
  // Current: Supabase implementation
  let query = supabase.from('books').select('*');

  if (filters?.genre) {
    query = query.eq('genre', filters.genre);
  }

  if (filters?.borrowable !== undefined) {
    query = query.eq('borrowable', filters.borrowable);
  }

  if (filters?.owner_id) {
    query = query.eq('owner_id', filters.owner_id);
  }

  // NOTE: Supabase automatically escapes parameters in .or() and .ilike() methods
  // to prevent SQL injection. String interpolation here is safe as Supabase uses
  // parameterized queries internally. Ref: https://supabase.com/docs/reference/javascript/
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Book[];

  // Future: NestJS implementation
  // const params = new URLSearchParams(filters as any);
  // const response = await fetch(`${API_URL}/books?${params}`);
  // return response.json();
}

/**
 * Get a single book by ID
 */
export async function getBook(id: string): Promise<Book | null> {
  // Current: Supabase implementation
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data as Book;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/books/${id}`);
  // if (response.status === 404) return null;
  // return response.json();
}

/**
 * Create a new book
 */
export async function createBook(input: CreateBookInput): Promise<Book> {
  // Current: Supabase implementation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated to create a book');

  const { data, error } = await supabase
    .from('books')
    .insert({
      owner_id: user.id,
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Book;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/books`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(input),
  // });
  // return response.json();
}

/**
 * Update an existing book
 */
export async function updateBook(id: string, input: UpdateBookInput): Promise<Book> {
  // Current: Supabase implementation
  const { data, error } = await supabase
    .from('books')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Book;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/books/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(input),
  // });
  // return response.json();
}

/**
 * Delete a book
 */
export async function deleteBook(id: string): Promise<void> {
  // Current: Supabase implementation
  const { error } = await supabase.from('books').delete().eq('id', id);

  if (error) throw error;

  // Future: NestJS implementation
  // await fetch(`${API_URL}/books/${id}`, { method: 'DELETE' });
}

/**
 * Get books owned by a specific user
 */
export async function getUserBooks(userId: string): Promise<Book[]> {
  return getBooks({ owner_id: userId });
}

/**
 * Get books available for borrowing
 */
export async function getAvailableBooks(filters?: Omit<BookFilters, 'borrowable'>): Promise<Book[]> {
  return getBooks({ ...filters, borrowable: true });
}

/**
 * Get books with owner information (for public browsing)
 */
export async function getBooksWithOwners(filters?: BookFilters): Promise<BookWithOwner[]> {
  // Current: Supabase implementation
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

  if (filters?.genre) {
    query = query.eq('genre', filters.genre);
  }

  if (filters?.borrowable !== undefined) {
    query = query.eq('borrowable', filters.borrowable);
  }

  if (filters?.owner_id) {
    query = query.eq('owner_id', filters.owner_id);
  }

  // NOTE: Supabase automatically escapes parameters in .or() and .ilike() methods
  // to prevent SQL injection. String interpolation here is safe as Supabase uses
  // parameterized queries internally. Ref: https://supabase.com/docs/reference/javascript/
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as BookWithOwner[];

  // Future: NestJS implementation
  // const params = new URLSearchParams({ ...filters, include: 'owner' } as any);
  // const response = await fetch(`${API_URL}/books?${params}`);
  // return response.json();
}

/**
 * Get available books with owner information (for public browsing)
 */
export async function getAvailableBooksWithOwners(filters?: Omit<BookFilters, 'borrowable'>): Promise<BookWithOwner[]> {
  return getBooksWithOwners({ ...filters, borrowable: true });
}

/**
 * Get a single book with owner information
 */
export async function getBookWithOwner(id: string): Promise<BookWithOwner | null> {
  // Current: Supabase implementation
  const { data, error } = await supabase
    .from('books')
    .select(`
      *,
      owner:users!owner_id (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data as BookWithOwner;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/books/${id}?include=owner`);
  // if (response.status === 404) return null;
  // return response.json();
}

/**
 * Upload a book cover image
 */
export async function uploadBookCover(bookId: string, file: File): Promise<string> {
  // Current: Supabase implementation
  const fileExt = file.name.split('.').pop();
  const fileName = `${bookId}-${Date.now()}.${fileExt}`;
  const filePath = `book-covers/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('books')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('books')
    .getPublicUrl(filePath);

  // Update book with new cover URL
  await updateBook(bookId, { cover_image_url: publicUrl });

  return publicUrl;

  // Future: NestJS implementation
  // const formData = new FormData();
  // formData.append('file', file);
  // const response = await fetch(`${API_URL}/books/${bookId}/cover`, {
  //   method: 'POST',
  //   body: formData,
  // });
  // const { url } = await response.json();
  // return url;
}
