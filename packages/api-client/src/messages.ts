/**
 * Messages abstraction layer
 *
 * Provides backend-agnostic message/chat management for borrow requests.
 * Currently implemented with Supabase (includes real-time subscriptions).
 *
 * MIGRATION NOTE: When migrating to NestJS, replace Supabase calls
 * with REST API calls to /messages/* endpoints and WebSocket subscriptions.
 */

import { supabase } from './supabaseClient.js';
import type { Message, MessageWithSender } from './types.js';
import { getBorrowRequest } from './borrowRequests.js';
import { createNotification } from './notifications.js';

/**
 * Get all messages for a borrow request
 */
export async function getMessagesByRequest(requestId: string): Promise<MessageWithSender[]> {
  // Current: Supabase implementation
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!sender_id (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .eq('borrow_request_id', requestId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as MessageWithSender[];

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/messages?request_id=${requestId}`);
  // return response.json();
}

/**
 * Send a message for a borrow request
 */
export async function sendMessage(requestId: string, content: string): Promise<Message> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to send messages');
  }

  // Get borrow request to determine recipient
  const request = await getBorrowRequest(requestId);
  if (!request) {
    throw new Error('Borrow request not found');
  }
  const recipientId = request.owner_id === user.id ? request.borrower_id : request.owner_id;

  // Get sender and book info for notification
  const { data: senderData } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', user.id)
    .single();

  const { data: bookData } = await supabase
    .from('books')
    .select('title')
    .eq('id', request.book_id)
    .single();

  const senderName = senderData?.name || senderData?.email || 'Someone';
  const bookTitle = bookData?.title || 'a book';

  // Current: Supabase implementation
  const { data, error } = await supabase
    .from('messages')
    .insert({
      borrow_request_id: requestId,
      sender_id: user.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) throw error;

  // Create notification for recipient
  try {
    await createNotification({
      user_id: recipientId,
      type: 'new_message',
      title: 'New Message',
      message: `${senderName} sent you a message about "${bookTitle}"`,
      payload: {
        request_id: requestId,
        book_id: request.book_id,
        message_preview: content.trim().substring(0, 50),
      },
    });
  } catch (notifError) {
    // Don't fail the message send if notification fails
    console.error('Failed to create notification:', notifError);
  }

  return data as Message;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/messages`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ request_id: requestId, content }),
  // });
  // return response.json();
}

/**
 * Subscribe to real-time messages for a specific borrow request
 */
export function subscribeToMessages(
  requestId: string,
  callback: (message: MessageWithSender) => void
): () => void {
  // Current: Supabase implementation
  const subscription = supabase
    .channel(`messages:${requestId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `borrow_request_id=eq.${requestId}`,
      },
      async (payload) => {
        // Fetch the message with sender details
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users!sender_id (
              id,
              name,
              email,
              avatar_url
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          callback(data as MessageWithSender);
        }
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };

  // Future: NestJS implementation (WebSocket)
  // const ws = new WebSocket(`${WS_URL}/messages/${requestId}`);
  // ws.onmessage = (event) => {
  //   const message = JSON.parse(event.data);
  //   callback(message);
  // };
  // return () => ws.close();
}

/**
 * Mark all messages in a chat as read for the current user
 */
export async function markMessagesAsRead(requestId: string): Promise<void> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  // Get borrow request to determine if user is owner or borrower
  const request = await getBorrowRequest(requestId);
  if (!request) {
    throw new Error('Borrow request not found');
  }
  const isOwner = request.owner_id === user.id;

  // Update read status for all unread messages
  const { error } = await supabase
    .from('messages')
    .update(isOwner ? { read_by_owner: true } : { read_by_borrower: true })
    .eq('borrow_request_id', requestId)
    .neq('sender_id', user.id); // Don't mark own messages as read

  if (error) throw error;

  // Future: NestJS implementation
  // await fetch(`${API_URL}/messages/${requestId}/read`, { method: 'PUT' });
}

/**
 * Get unread message count for a specific borrow request
 */
export async function getUnreadMessageCount(requestId: string): Promise<number> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return 0;
  }

  // Get borrow request to determine if user is owner or borrower
  const request = await getBorrowRequest(requestId);
  if (!request) {
    return 0; // Return 0 if request not found
  }
  const isOwner = request.owner_id === user.id;

  // Count unread messages
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('borrow_request_id', requestId)
    .eq(isOwner ? 'read_by_owner' : 'read_by_borrower', false)
    .neq('sender_id', user.id); // Don't count own messages

  if (error) throw error;
  return count || 0;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/messages/${requestId}/unread-count`);
  // return response.json();
}

/**
 * Get total unread message count across all chats
 * Optimized to avoid N+1 query problem by batching requests by role
 */
export async function getTotalUnreadCount(): Promise<number> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return 0;
  }

  // Get all borrow requests where user is involved
  const { data: requests, error: requestsError } = await supabase
    .from('borrow_requests')
    .select('id, owner_id, borrower_id')
    .or(`owner_id.eq.${user.id},borrower_id.eq.${user.id}`);

  if (requestsError) throw requestsError;
  if (!requests || requests.length === 0) return 0;

  // Split requests into those where user is owner vs borrower
  const ownerRequestIds = requests
    .filter(r => r.owner_id === user.id)
    .map(r => r.id);

  const borrowerRequestIds = requests
    .filter(r => r.borrower_id === user.id)
    .map(r => r.id);

  let totalUnread = 0;

  // Count unread messages where user is the owner (batch query)
  if (ownerRequestIds.length > 0) {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('borrow_request_id', ownerRequestIds)
      .eq('read_by_owner', false)
      .neq('sender_id', user.id);

    if (error) throw error;
    totalUnread += count || 0;
  }

  // Count unread messages where user is the borrower (batch query)
  if (borrowerRequestIds.length > 0) {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('borrow_request_id', borrowerRequestIds)
      .eq('read_by_borrower', false)
      .neq('sender_id', user.id);

    if (error) throw error;
    totalUnread += count || 0;
  }

  return totalUnread;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/messages/unread-count`);
  // return response.json();
}
