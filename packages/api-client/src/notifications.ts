/**
 * Notifications abstraction layer
 *
 * Provides backend-agnostic notification management.
 * Currently implemented with Supabase (includes real-time subscriptions).
 *
 * MIGRATION NOTE: When migrating to NestJS, replace Supabase calls
 * with REST API calls to /notifications/* endpoints and WebSocket subscriptions.
 */

import { supabase } from './supabaseClient.js';
import type { Notification, NotificationType } from './types.js';

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  payload?: Record<string, unknown>;
}

export interface NotificationFilters {
  user_id?: string;
  type?: NotificationType;
  read?: boolean;
}

/**
 * Get all notifications with optional filters
 */
export async function getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
  // Current: Supabase implementation
  let query = supabase.from('notifications').select('*');

  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id);
  }

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.read !== undefined) {
    query = query.eq('read', filters.read);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Notification[];

  // Future: NestJS implementation
  // const params = new URLSearchParams(filters as any);
  // const response = await fetch(`${API_URL}/notifications?${params}`);
  // return response.json();
}

/**
 * Get notifications for the current user
 */
export async function getMyNotifications(filters?: Omit<NotificationFilters, 'user_id'>): Promise<Notification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated');

  return getNotifications({ ...filters, user_id: user.id });
}

/**
 * Get unread notifications for the current user
 */
export async function getUnreadNotifications(): Promise<Notification[]> {
  return getMyNotifications({ read: false });
}

/**
 * Get unread notification count for the current user
 */
export async function getUnreadCount(): Promise<number> {
  // Current: Supabase implementation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) throw error;
  return count || 0;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/notifications/unread/count`);
  // const { count } = await response.json();
  // return count;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(id: string): Promise<Notification> {
  // Current: Supabase implementation
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Notification;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/notifications/${id}/read`, {
  //   method: 'PUT',
  // });
  // return response.json();
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllAsRead(): Promise<void> {
  // Current: Supabase implementation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated');

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) throw error;

  // Future: NestJS implementation
  // await fetch(`${API_URL}/notifications/read-all`, { method: 'PUT' });
}

/**
 * Create a notification (typically called by backend triggers)
 */
export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  // Current: Supabase implementation
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      ...input,
      read: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Notification;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/notifications`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(input),
  // });
  // return response.json();
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<void> {
  // Current: Supabase implementation
  const { error } = await supabase.from('notifications').delete().eq('id', id);

  if (error) throw error;

  // Future: NestJS implementation
  // await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
}

/**
 * Subscribe to real-time notifications for the current user
 */
export function subscribeToNotifications(callback: (notification: Notification) => void) {
  // Current: Supabase implementation
  const subscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      },
      (payload: { new: Notification }) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };

  // Future: NestJS implementation (WebSocket)
  // const ws = new WebSocket(`${WS_URL}/notifications`);
  // ws.onmessage = (event) => {
  //   const notification = JSON.parse(event.data);
  //   callback(notification);
  // };
  // return () => ws.close();
}

/**
 * Helper: Create a notification for a borrow request
 */
export async function notifyBorrowRequest(
  ownerId: string,
  bookId: string,
  borrowerName: string
): Promise<Notification> {
  return createNotification({
    user_id: ownerId,
    type: 'borrow_request',
    title: 'New Borrow Request',
    message: `${borrowerName} wants to borrow your book`,
    payload: { book_id: bookId },
  });
}

/**
 * Helper: Create a notification for request approval
 */
export async function notifyRequestApproved(
  borrowerId: string,
  bookId: string,
  bookTitle: string
): Promise<Notification> {
  return createNotification({
    user_id: borrowerId,
    type: 'request_approved',
    title: 'Request Approved',
    message: `Your request to borrow "${bookTitle}" was approved`,
    payload: { book_id: bookId },
  });
}

/**
 * Helper: Create a notification for request denial
 */
export async function notifyRequestDenied(
  borrowerId: string,
  bookId: string,
  bookTitle: string
): Promise<Notification> {
  return createNotification({
    user_id: borrowerId,
    type: 'request_denied',
    title: 'Request Denied',
    message: `Your request to borrow "${bookTitle}" was denied`,
    payload: { book_id: bookId },
  });
}
