import { formatDistanceToNow } from 'date-fns';
import type { ChatSummary } from '@repo/api-client';
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
    <div
      className={cn(
        'group relative cursor-pointer rounded-lg transition-colors duration-150',
        // Active state
        isActive && 'bg-primary/5 border-l-2 border-l-primary',
        // Unread state (only if not active)
        !isActive && hasUnread && 'bg-muted/50',
        // Default state
        !isActive && !hasUnread && 'hover:bg-muted',
      )}
      onClick={onClick}
    >
      <div className="p-3">
        <div className="flex gap-3">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            <div className="rounded-md overflow-hidden border border-border">
              <ImageWithFallback
                src={request.book?.cover_image_url || ''}
                alt={request.book?.title || 'Book'}
                className="w-14 h-20 object-cover"
              />
            </div>
          </div>

          {/* Chat Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="space-y-1">
              {/* Book Title */}
              <h3 className={cn(
                'text-sm leading-tight line-clamp-1 transition-colors',
                hasUnread
                  ? 'font-semibold text-foreground'
                  : 'font-medium text-foreground'
              )}>
                {request.book?.title || 'Untitled Book'}
              </h3>

              {/* Other User */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" strokeWidth={2} />
                <span>{otherUserName}</span>
              </div>
            </div>

            {/* Last Message Preview */}
            {lastMessage && (
              <div className="space-y-1">
                <p className={cn(
                  'text-xs leading-snug line-clamp-1',
                  hasUnread
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                )}>
                  {lastMessage.content}
                </p>

                {/* Timestamp */}
                {timestamp && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" strokeWidth={2} />
                    <span>{timestamp}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Unread Badge */}
          {hasUnread && (
            <div className="flex-shrink-0 self-start">
              <Badge
                variant="default"
                className="min-w-[1.5rem] h-6 rounded-full px-2 bg-primary text-primary-foreground font-semibold text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
