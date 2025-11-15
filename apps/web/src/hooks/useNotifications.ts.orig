import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
} from '@repo/api-client';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filter?: string) => [...notificationKeys.lists(), filter || 'all'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

/**
 * Hook to fetch all notifications for the current user
 */
export function useNotifications(filter?: 'all' | 'unread' | 'read') {
  return useQuery({
    queryKey: notificationKeys.list(filter),
    queryFn: async () => {
      if (filter === 'unread') {
        return await getMyNotifications({ read: false });
      }
      if (filter === 'read') {
        return await getMyNotifications({ read: true });
      }
      return await getMyNotifications();
    },
  });
}

/**
 * Hook to fetch unread notification count
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
  });
}

/**
 * Hook to mark a notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook to subscribe to real-time notifications
 */
export function useNotificationSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(() => {
      // Invalidate queries to refetch notifications
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);
}
