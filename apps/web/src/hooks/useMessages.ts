import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  getMessagesByRequest,
  sendMessage,
  subscribeToMessages,
  type MessageWithSender,
} from '@repo/api-client';

// Query keys
export const messageKeys = {
  all: ['messages'] as const,
  byRequest: (requestId: string) => [...messageKeys.all, 'request', requestId] as const,
};

/**
 * Hook to fetch messages for a borrow request
 */
export function useMessages(requestId: string | undefined) {
  return useQuery({
    queryKey: requestId ? messageKeys.byRequest(requestId) : ['messages', 'disabled'],
    queryFn: () => {
      if (!requestId) throw new Error('Request ID is required');
      return getMessagesByRequest(requestId);
    },
    enabled: !!requestId,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: false, // Don't poll - we use subscriptions
  });
}

/**
 * Hook to send a message
 */
export function useSendMessage(requestId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!requestId) throw new Error('Request ID is required');
      return sendMessage(requestId, content);
    },
    onSuccess: (newMessage) => {
      // Optimistically add message to cache
      if (requestId) {
        queryClient.setQueryData<MessageWithSender[]>(
          messageKeys.byRequest(requestId),
          (old) => [...(old || []), newMessage as MessageWithSender]
        );
      }
    },
  });
}

/**
 * Hook to subscribe to real-time messages
 */
export function useMessageSubscription(requestId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!requestId) return;

    const unsubscribe = subscribeToMessages(requestId, (newMessage) => {
      // Add new message to cache
      queryClient.setQueryData<MessageWithSender[]>(
        messageKeys.byRequest(requestId),
        (old) => {
          // Check if message already exists (avoid duplicates)
          const exists = old?.some((msg) => msg.id === newMessage.id);
          if (exists) return old;
          return [...(old || []), newMessage];
        }
      );
    });

    return () => {
      unsubscribe();
    };
  }, [requestId, queryClient]);
}
