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
