/**
 * Borrow Requests abstraction layer
 *
 * Provides backend-agnostic borrow request management.
 * Currently implemented with Supabase.
 *
 * MIGRATION NOTE: When migrating to NestJS, replace Supabase calls
 * with REST API calls to /borrow-requests/* endpoints while keeping function signatures identical.
 */

import { supabase } from './supabaseClient.js';
import type { BorrowRequest, BorrowRequestWithDetails, BorrowRequestStatus } from './types.js';

export interface CreateBorrowRequestInput {
  book_id: string;
  request_message?: string;
}

export interface UpdateBorrowRequestInput {
  status?: BorrowRequestStatus;
  response_message?: string;
  due_date?: string;
}

export interface BorrowRequestFilters {
  borrower_id?: string;
  owner_id?: string;
  book_id?: string;
  status?: BorrowRequestStatus;
}

/**
 * Get all borrow requests with optional filters
 */
export async function getBorrowRequests(filters?: BorrowRequestFilters): Promise<BorrowRequest[]> {
  // Current: Supabase implementation
  let query = supabase.from('borrow_requests').select('*');

  if (filters?.borrower_id) {
    query = query.eq('borrower_id', filters.borrower_id);
  }

  if (filters?.owner_id) {
    query = query.eq('owner_id', filters.owner_id);
  }

  if (filters?.book_id) {
    query = query.eq('book_id', filters.book_id);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as BorrowRequest[];

  // Future: NestJS implementation
  // const params = new URLSearchParams(filters as any);
  // const response = await fetch(`${API_URL}/borrow-requests?${params}`);
  // return response.json();
}

/**
 * Get a single borrow request by ID
 */
export async function getBorrowRequest(id: string): Promise<BorrowRequest | null> {
  // Current: Supabase implementation
  const { data, error } = await supabase
    .from('borrow_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data as BorrowRequest;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/borrow-requests/${id}`);
  // if (response.status === 404) return null;
  // return response.json();
}

/**
 * Create a new borrow request
 */
export async function createBorrowRequest(input: CreateBorrowRequestInput): Promise<BorrowRequest> {
  // Current: Supabase implementation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated to create a borrow request');

  // Check for existing pending or approved request for this book
  const { data: existingRequest } = await supabase
    .from('borrow_requests')
    .select('id, status')
    .eq('book_id', input.book_id)
    .eq('borrower_id', user.id)
    .in('status', ['pending', 'approved'])
    .maybeSingle();

  if (existingRequest) {
    if (existingRequest.status === 'pending') {
      throw new Error('You already have a pending request for this book');
    } else if (existingRequest.status === 'approved') {
      throw new Error('You already have an approved request for this book');
    }
  }

  // Get the book to find the owner
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('owner_id')
    .eq('id', input.book_id)
    .single();

  if (bookError) throw bookError;
  if (!book) throw new Error('Book not found');

  const { data, error } = await supabase
    .from('borrow_requests')
    .insert({
      book_id: input.book_id,
      borrower_id: user.id,
      owner_id: book.owner_id,
      status: 'pending',
      request_message: input.request_message || null,
      requested_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as BorrowRequest;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/borrow-requests`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(input),
  // });
  // return response.json();
}

/**
 * Update a borrow request (approve, deny, mark returned)
 */
export async function updateBorrowRequest(
  id: string,
  input: UpdateBorrowRequestInput
): Promise<BorrowRequest> {
  // Current: Supabase implementation
  const updateData: UpdateBorrowRequestInput & { approved_at?: string; returned_at?: string } = { ...input };

  // Set timestamps based on status changes
  if (input.status === 'approved') {
    updateData.approved_at = new Date().toISOString();
  } else if (input.status === 'returned') {
    updateData.returned_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('borrow_requests')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as BorrowRequest;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/borrow-requests/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(input),
  // });
  // return response.json();
}

/**
 * Approve a borrow request
 */
export async function approveBorrowRequest(
  id: string,
  dueDate: string,
  responseMessage?: string
): Promise<BorrowRequest> {
  // First, get the borrow request to find the book_id
  const { data: borrowRequest, error: requestError } = await supabase
    .from('borrow_requests')
    .select('book_id')
    .eq('id', id)
    .single();

  if (requestError) throw requestError;
  if (!borrowRequest) throw new Error('Borrow request not found');

  // Update the book to mark it as not borrowable
  const { error: bookError } = await supabase
    .from('books')
    .update({ borrowable: false })
    .eq('id', borrowRequest.book_id);

  if (bookError) throw bookError;

  // Update the borrow request status
  return updateBorrowRequest(id, {
    status: 'approved',
    due_date: dueDate,
    response_message: responseMessage,
  });
}

/**
 * Deny a borrow request
 */
export async function denyBorrowRequest(id: string, responseMessage?: string): Promise<BorrowRequest> {
  return updateBorrowRequest(id, {
    status: 'denied',
    response_message: responseMessage,
  });
}

/**
 * Mark a borrow request as returned
 */
export async function markBookReturned(id: string): Promise<BorrowRequest> {
  // First, get the borrow request to find the book_id
  const { data: borrowRequest, error: requestError } = await supabase
    .from('borrow_requests')
    .select('book_id')
    .eq('id', id)
    .single();

  if (requestError) throw requestError;
  if (!borrowRequest) throw new Error('Borrow request not found');

  // Update the book to mark it as borrowable again
  const { error: bookError } = await supabase
    .from('books')
    .update({ borrowable: true })
    .eq('id', borrowRequest.book_id);

  if (bookError) throw bookError;

  // Update the borrow request status
  return updateBorrowRequest(id, {
    status: 'returned',
  });
}

/**
 * Get borrow requests made by the current user
 */
export async function getMyBorrowRequests(status?: BorrowRequestStatus): Promise<BorrowRequest[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated');

  return getBorrowRequests({
    borrower_id: user.id,
    status,
  });
}

/**
 * Get borrow requests for books owned by the current user
 */
export async function getIncomingBorrowRequests(status?: BorrowRequestStatus): Promise<BorrowRequest[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated');

  return getBorrowRequests({
    owner_id: user.id,
    status,
  });
}

/**
 * Delete a borrow request
 */
export async function deleteBorrowRequest(id: string): Promise<void> {
  // Current: Supabase implementation
  const { error } = await supabase.from('borrow_requests').delete().eq('id', id);

  if (error) throw error;

  // Future: NestJS implementation
  // await fetch(`${API_URL}/borrow-requests/${id}`, { method: 'DELETE' });
}

/**
 * Get borrow requests made by the current user with book and owner details
 */
export async function getMyBorrowRequestsWithDetails(
  status?: BorrowRequestStatus
): Promise<BorrowRequestWithDetails[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated');

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
      owner:users!owner_id (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .eq('borrower_id', user.id);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as BorrowRequestWithDetails[];
}

/**
 * Get borrow requests for books owned by the current user with book and borrower details
 */
export async function getIncomingBorrowRequestsWithDetails(
  status?: BorrowRequestStatus
): Promise<BorrowRequestWithDetails[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated');

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
      )
    `)
    .eq('owner_id', user.id);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as BorrowRequestWithDetails[];
}
