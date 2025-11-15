import { useState, useRef, useEffect } from 'react';
import { Button } from '@repo/ui/components/button';
import { Textarea } from '@repo/ui/components/textarea';
import { useMessages, useSendMessage, useMessageSubscription } from '../../hooks/useMessages';
import { useMarkChatAsRead } from '../../hooks/useUnreadMessages';
import { MessageBubble } from '../Requests/MessageBubble';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Loader2, BookOpen, User as UserIcon } from '@repo/ui/components/icons';
import { ImageWithFallback } from '../ImageWithFallback';
import type { ChatSummary } from '@repo/api-client';
import { cn } from '@repo/ui/lib/utils';

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

  // Send message mutation
  const sendMessageMutation = useSendMessage(request.id);

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
      console.error('Failed to send message:', error);
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
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-amber-50/10 dark:to-amber-950/5">
      {/* Header */}
      <div className="relative border-b border-border/50 bg-gradient-to-r from-background/95 to-amber-50/30 dark:to-amber-950/10 backdrop-blur-xl">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5" />

        <div className="relative px-6 sm:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Book Cover */}
            <div className="flex-shrink-0 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-xl overflow-hidden shadow-lg ring-1 ring-border/50 group-hover:shadow-2xl group-hover:shadow-amber-500/20 transition-all duration-300">
                <ImageWithFallback
                  src={request.book?.cover_image_url || ''}
                  alt={request.book?.title || 'Book'}
                  className="w-14 h-20 sm:w-16 sm:h-24 object-cover"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Title and User Info */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
                <span className="font-medium tracking-wide uppercase opacity-70">About this book</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground leading-tight line-clamp-1 tracking-tight">
                {request.book?.title || 'Untitled Book'}
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <UserIcon className="h-4 w-4" strokeWidth={2} />
                  <span className="font-medium">{otherUserName}</span>
                </div>
                {/* Online status indicator (placeholder) */}
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                  <span className="text-xs text-muted-foreground/70">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
                  <Loader2 className="relative h-8 w-8 animate-spin text-amber-600 dark:text-amber-400" strokeWidth={2} />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center max-w-md space-y-4">
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-border/50">
                    <Send className="h-10 w-10 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-semibold text-foreground">Start the conversation</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No messages yet. Send a message to begin chatting about this book.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading &&
            messages.map((message, index) => (
              <div
                key={message.id}
                style={{ animationDelay: `${index * 30}ms` }}
                className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 fill-mode-backwards"
              >
                <MessageBubble
                  message={message}
                  isCurrentUser={message.sender_id === user?.id}
                />
              </div>
            ))}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area - Glass morphism effect */}
      <div className="relative border-t border-border/50">
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/90 to-background/80 backdrop-blur-xl" />

        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent" />

        <div className="relative px-4 sm:px-8 py-4 sm:py-5">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative group">
                {/* Input glow on focus */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/20 to-orange-500/0 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-500" />

                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                  className={cn(
                    "relative min-h-[60px] max-h-[120px] resize-none",
                    "bg-background/80 backdrop-blur-sm",
                    "border-border/50 focus:border-amber-500/50",
                    "rounded-2xl px-4 py-3",
                    "font-sans text-sm leading-relaxed",
                    "placeholder:text-muted-foreground/50",
                    "transition-all duration-300",
                    "focus:shadow-lg focus:shadow-amber-500/5"
                  )}
                  disabled={sendMessageMutation.isPending}
                />
              </div>

              {/* Send button with gradient */}
              <Button
                onClick={handleSend}
                disabled={!messageContent.trim() || sendMessageMutation.isPending}
                size="lg"
                className={cn(
                  "relative h-[60px] w-[60px] rounded-2xl p-0",
                  "bg-gradient-to-br from-amber-500 to-orange-600",
                  "hover:from-amber-600 hover:to-orange-700",
                  "dark:from-amber-400 dark:to-orange-500",
                  "dark:hover:from-amber-500 dark:hover:to-orange-600",
                  "text-white dark:text-gray-900",
                  "shadow-lg shadow-amber-500/25",
                  "hover:shadow-xl hover:shadow-amber-500/40",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-300",
                  "group/send"
                )}
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
                ) : (
                  <Send
                    className="h-5 w-5 transition-transform duration-300 group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5"
                    strokeWidth={2}
                  />
                )}
              </Button>
            </div>

            {/* Helper text */}
            <p className="text-xs text-muted-foreground/60 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
