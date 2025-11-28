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

interface SendMessageContext {
  previousMessages: MessageWithSender[] | undefined;
  optimisticId: string;
}

interface CurrentUser {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

/**
 * Hook to send a message with optimistic updates for instant feedback
 */
export function useSendMessage(requestId: string | undefined, currentUser?: CurrentUser | null) {
  const queryClient = useQueryClient();

  return useMutation<Awaited<ReturnType<typeof sendMessage>>, Error, string, SendMessageContext>({
    mutationFn: async (content: string) => {
      if (!requestId) throw new Error('Request ID is required');
      return sendMessage(requestId, content);
    },
    onMutate: async (content) => {
      if (!requestId || !currentUser) return { previousMessages: undefined, optimisticId: '' };

      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: messageKeys.byRequest(requestId) });

      // Snapshot current messages
      const previousMessages = queryClient.getQueryData<MessageWithSender[]>(
        messageKeys.byRequest(requestId)
      );

      // Create optimistic message with temporary ID
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMessage: MessageWithSender = {
        id: optimisticId,
        borrow_request_id: requestId,
        sender_id: currentUser.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        read_by_owner: false,
        read_by_borrower: false,
        updated_at: new Date().toISOString(),
        sender: {
          id: currentUser.id,
          name: currentUser.name || null,
          email: currentUser.email || '',
          avatar_url: currentUser.avatar_url || null,
        },
      };

      // Add optimistic message to cache
      queryClient.setQueryData<MessageWithSender[]>(
        messageKeys.byRequest(requestId),
        (old) => [...(old || []), optimisticMessage]
      );

      return { previousMessages, optimisticId };
    },
    onSuccess: (newMessage, _content, context) => {
      // Replace optimistic message with real one
      if (requestId && context?.optimisticId) {
        queryClient.setQueryData<MessageWithSender[]>(
          messageKeys.byRequest(requestId),
          (old) => {
            if (!old) return [newMessage as MessageWithSender];
            // Remove optimistic message and add real one (if not already added by subscription)
            const withoutOptimistic = old.filter((msg) => msg.id !== context.optimisticId);
            const exists = withoutOptimistic.some((msg) => msg.id === newMessage.id);
            if (exists) return withoutOptimistic;
            return [...withoutOptimistic, newMessage as MessageWithSender];
          }
        );
      }
    },
    onError: (_error, _content, context) => {
      // Roll back to previous messages on error
      if (requestId && context?.previousMessages) {
        queryClient.setQueryData(messageKeys.byRequest(requestId), context.previousMessages);
      }
    },
  });
}

/**
 * Hook to subscribe to real-time messages
 * Uses a mounted flag to prevent memory leaks if component unmounts during setup
 */
export function useMessageSubscription(requestId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!requestId) return;

    // Track if component is still mounted
    let isMounted = true;

    const unsubscribe = subscribeToMessages(requestId, (newMessage) => {
      // Only update cache if component is still mounted
      if (!isMounted) return;

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
      isMounted = false;
      unsubscribe();
    };
  }, [requestId, queryClient]);
}
