import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  getUnreadMessageCount,
  getTotalUnreadCount,
  markMessagesAsRead,
  subscribeToMessages,
} from '@repo/api-client';
import { messageKeys } from './useMessages';

// Query keys
export const unreadKeys = {
  all: ['unread'] as const,
  total: () => [...unreadKeys.all, 'total'] as const,
  byRequest: (requestId: string) => [...unreadKeys.all, 'request', requestId] as const,
};

/**
 * Hook to get total unread message count across all chats
 */
export function useTotalUnreadCount() {
  return useQuery({
    queryKey: unreadKeys.total(),
    queryFn: getTotalUnreadCount,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  });
}

/**
 * Hook to get unread count for a specific chat
 */
export function useUnreadCountForChat(requestId: string | undefined) {
  return useQuery({
    queryKey: requestId ? unreadKeys.byRequest(requestId) : ['unread', 'disabled'],
    queryFn: () => {
      if (!requestId) throw new Error('Request ID is required');
      return getUnreadMessageCount(requestId);
    },
    enabled: !!requestId,
    staleTime: 0, // Always fetch fresh data
  });
}

/**
 * Hook to mark chat as read
 */
export function useMarkChatAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      await markMessagesAsRead(requestId);
      return requestId;
    },
    onSuccess: (requestId) => {
      // Invalidate unread counts
      queryClient.invalidateQueries({ queryKey: unreadKeys.total() });
      queryClient.invalidateQueries({ queryKey: unreadKeys.byRequest(requestId) });
      // Invalidate messages to update read status
      queryClient.invalidateQueries({ queryKey: messageKeys.byRequest(requestId) });
    },
  });
}

/**
 * Hook to subscribe to real-time unread count updates
 * Updates when new messages arrive
 */
export function useUnreadSubscription(requestId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!requestId) return;

    const unsubscribe = subscribeToMessages(requestId, () => {
      // When new message arrives, invalidate unread counts
      queryClient.invalidateQueries({ queryKey: unreadKeys.total() });
      queryClient.invalidateQueries({ queryKey: unreadKeys.byRequest(requestId) });
    });

    return () => {
      unsubscribe();
    };
  }, [requestId, queryClient]);
}
