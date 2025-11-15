import { useQuery } from '@tanstack/react-query';
import { getActiveChats, type BorrowRequestWithDetails, getUnreadMessageCount } from '@repo/api-client';
import { useAuth } from '../contexts/AuthContext';
import type { ChatSummary } from '@repo/api-client';

// Query keys
export const chatKeys = {
  all: ['chats'] as const,
  active: () => [...chatKeys.all, 'active'] as const,
};

/**
 * Hook to get all active chats with unread counts
 */
export function useActiveChats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: chatKeys.active(),
    queryFn: async (): Promise<ChatSummary[]> => {
      // Get all borrow requests with messages
      const requests = await getActiveChats();

      // For each request, get unread count and format as ChatSummary
      const chatsWithUnread = await Promise.all(
        requests.map(async (request: BorrowRequestWithDetails): Promise<ChatSummary> => {
          const unreadCount = await getUnreadMessageCount(request.id);

          return {
            request,
            unreadCount,
            lastMessage: request.last_message_at
              ? {
                  content: request.last_message_content || '',
                  timestamp: request.last_message_at,
                  senderId: '', // We don't store sender_id in last_message, but it's fine
                }
              : null,
          };
        })
      );

      return chatsWithUnread;
    },
    enabled: !!user,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
