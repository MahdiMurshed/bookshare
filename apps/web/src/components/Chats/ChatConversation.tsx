import { useState, useRef, useEffect } from 'react';
import { Button } from '@repo/ui/components/button';
import { Textarea } from '@repo/ui/components/textarea';
import { useMessages, useSendMessage, useMessageSubscription } from '../../hooks/useMessages';
import { useMarkChatAsRead } from '../../hooks/useUnreadMessages';
import { MessageBubble } from '../Requests/MessageBubble';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Loader2, User as UserIcon } from '@repo/ui/components/icons';
import { ImageWithFallback } from '../ImageWithFallback';
import type { ChatSummary } from '@repo/api-client';
import { cn } from '@repo/ui/lib/utils';
import { logError } from '../../lib/utils/errors';

export interface ChatConversationProps {
  chat: ChatSummary;
}

export function ChatConversation({ chat }: ChatConversationProps) {
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { request } = chat;

  // Determine the other user (who we're chatting with)
  const isOwner = request.owner_id === user?.id;
  const otherUser = isOwner ? request.borrower : request.owner;
  const otherUserName = otherUser?.name || otherUser?.email || 'Unknown';

  // Fetch messages
  const { data: messages = [], isLoading } = useMessages(request.id);

  // Send message mutation with optimistic updates
  const sendMessageMutation = useSendMessage(request.id, user);

  // Mark as read mutation
  const markAsReadMutation = useMarkChatAsRead();

  // Subscribe to real-time messages
  useMessageSubscription(request.id);

  // Mark messages as read when conversation loads
  useEffect(() => {
    if (request.id) {
      markAsReadMutation.mutate(request.id);
    }
  }, [request.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!messageContent.trim() || sendMessageMutation.isPending) return;

    try {
      await sendMessageMutation.mutateAsync(messageContent);
      setMessageContent('');
    } catch (error) {
      logError(error, 'sending message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b-2 border-border bg-background">
        <div className="px-6 sm:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-4">
            {/* Book Cover */}
            <div className="flex-shrink-0">
              <div className="rounded-lg overflow-hidden border border-border shadow-sm">
                <ImageWithFallback
                  src={request.book?.cover_image_url || ''}
                  alt={request.book?.title || 'Book'}
                  className="w-12 h-16 sm:w-14 sm:h-20 object-cover"
                />
              </div>
            </div>

            {/* Title and User Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight line-clamp-1">
                {request.book?.title || 'Untitled Book'}
              </h2>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4" strokeWidth={2} />
                <span>{otherUserName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 bg-background">
        <div className="max-w-4xl mx-auto space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" strokeWidth={2} />
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center max-w-md space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted border-2 border-border mx-auto">
                  <Send className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Start the conversation</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No messages yet. Send a message to begin chatting about this book.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading &&
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={message.sender_id === user?.id}
              />
            ))}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t-2 border-border bg-background">
        <div className="px-4 sm:px-8 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 items-end">
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className={cn(
                  "flex-1 min-h-[56px] max-h-[120px] resize-none",
                  "bg-background border-2 border-border",
                  "focus:border-primary",
                  "rounded-lg px-4 py-3",
                  "text-sm leading-relaxed",
                  "placeholder:text-muted-foreground",
                  "transition-colors"
                )}
                disabled={sendMessageMutation.isPending}
              />

              <Button
                onClick={handleSend}
                disabled={!messageContent.trim() || sendMessageMutation.isPending}
                size="lg"
                className="h-[56px] w-[56px] rounded-lg p-0 shrink-0"
              >
                  <Send className="h-5 w-5" strokeWidth={2} />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
