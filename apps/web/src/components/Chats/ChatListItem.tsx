import { formatDistanceToNow } from 'date-fns';
import type { ChatSummary } from '@repo/api-client';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { ImageWithFallback } from '../ImageWithFallback';
import { cn } from '@repo/ui/lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, User } from '@repo/ui/components/icons';

export interface ChatListItemProps {
  chat: ChatSummary;
  onClick: () => void;
  isActive?: boolean;
}

export function ChatListItem({ chat, onClick, isActive = false }: ChatListItemProps) {
  const { user } = useAuth();
  const { request, unreadCount, lastMessage } = chat;

  // Determine the other user (who we're chatting with)
  const isOwner = request.owner_id === user?.id;
  const otherUser = isOwner ? request.borrower : request.owner;
  const otherUserName = otherUser?.name || otherUser?.email || 'Unknown';

  const hasUnread = unreadCount > 0;
  const timestamp = lastMessage
    ? formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })
    : '';

  return (
    <Card
      className={cn(
        'group relative cursor-pointer overflow-hidden border transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-0.5',
        // Active state
        isActive && [
          'bg-gradient-to-br from-amber-50 via-orange-50/50 to-background',
          'dark:from-amber-950/30 dark:via-orange-950/20 dark:to-background',
          'border-amber-500/50 dark:border-amber-400/50',
          'shadow-lg shadow-amber-500/10',
          'ring-1 ring-amber-500/20 dark:ring-amber-400/20',
        ],
        // Unread state (only if not active)
        !isActive && hasUnread && [
          'border-l-4 border-l-amber-500 dark:border-l-amber-400',
          'bg-gradient-to-br from-amber-50/80 to-background dark:from-amber-950/20 dark:to-background',
          'shadow-md',
        ],
        // Default state
        !isActive && !hasUnread && 'border-border/50 bg-card/50 hover:bg-card hover:border-border'
      )}
      onClick={onClick}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-orange-500/0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300" />

      <div className="relative p-5">
        <div className="flex gap-5">
          {/* Book Cover - Larger and more prominent */}
          <div className="flex-shrink-0 relative">
            {/* Ambient glow */}
            <div className={cn(
              'absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-xl rounded-lg transition-opacity duration-500',
              isActive || hasUnread ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
            )} />

            <div className={cn(
              'relative rounded-lg overflow-hidden shadow-md transition-all duration-300',
              'group-hover:shadow-2xl group-hover:scale-[1.03] group-hover:shadow-amber-500/20',
              (hasUnread || isActive) && 'ring-2 ring-amber-500/30 dark:ring-amber-400/30 shadow-xl shadow-amber-500/10'
            )}>
              <ImageWithFallback
                src={request.book?.cover_image_url || ''}
                alt={request.book?.title || 'Book'}
                className="w-20 h-28 sm:w-24 sm:h-32 object-cover"
              />
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          {/* Chat Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div className="space-y-1.5">
              {/* Book Title - Elegant serif font */}
              <h3 className={cn(
                'font-serif text-base sm:text-lg leading-tight line-clamp-2 transition-colors duration-200',
                hasUnread
                  ? 'font-bold text-foreground'
                  : 'font-semibold text-foreground/90 group-hover:text-foreground'
              )}>
                {request.book?.title || 'Untitled Book'}
              </h3>

              {/* Other User */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" strokeWidth={2} />
                <span className="font-medium">{otherUserName}</span>
              </div>
            </div>

            {/* Last Message Preview */}
            {lastMessage && (
              <div className="mt-2.5 space-y-1.5">
                <p
                  className={cn(
                    'text-sm leading-relaxed line-clamp-2 transition-colors duration-200',
                    hasUnread
                      ? 'font-medium text-foreground/90'
                      : 'text-muted-foreground group-hover:text-foreground/80'
                  )}
                >
                  {lastMessage.content}
                </p>

                {/* Timestamp */}
                {timestamp && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                    <Clock className="h-3 w-3" strokeWidth={2} />
                    <span>{timestamp}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Unread Badge - More prominent and elegant */}
          {hasUnread && (
            <div className="flex-shrink-0 self-start">
              <div className="relative">
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-amber-500/30 dark:bg-amber-400/30 blur-md rounded-full" />
                <Badge
                  variant="default"
                  className={cn(
                    'relative min-w-[1.75rem] h-7 rounded-full px-2',
                    'bg-gradient-to-br from-amber-500 to-orange-600',
                    'dark:from-amber-400 dark:to-orange-500',
                    'text-white dark:text-gray-900 font-bold text-xs',
                    'shadow-lg shadow-amber-500/25 dark:shadow-amber-400/25',
                    'border-2 border-amber-200/50 dark:border-amber-300/30'
                  )}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom border accent on hover */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
      )} />
    </Card>
  );
}
