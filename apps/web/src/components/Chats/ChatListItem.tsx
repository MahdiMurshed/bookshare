import { formatDistanceToNow } from 'date-fns';
import type { ChatSummary } from '@repo/api-client';
import { Card, CardContent } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { ImageWithFallback } from '../ImageWithFallback';
import { cn } from '@repo/ui/lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export interface ChatListItemProps {
  chat: ChatSummary;
  onClick: () => void;
}

export function ChatListItem({ chat, onClick }: ChatListItemProps) {
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
        'cursor-pointer transition-colors hover:bg-accent',
        hasUnread && 'border-l-4 border-l-primary bg-accent/50'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            <ImageWithFallback
              src={request.book?.cover_image_url || ''}
              alt={request.book?.title || 'Book'}
              className="w-16 h-20 object-cover rounded"
            />
          </div>

          {/* Chat Info */}
          <div className="flex-1 min-w-0">
            {/* Book Title */}
            <h3 className={cn('font-semibold text-sm truncate', hasUnread && 'font-bold')}>
              {request.book?.title || 'Untitled Book'}
            </h3>

            {/* Other User */}
            <p className="text-xs text-muted-foreground mb-1">with {otherUserName}</p>

            {/* Last Message Preview */}
            {lastMessage && (
              <p
                className={cn(
                  'text-sm text-muted-foreground line-clamp-2',
                  hasUnread && 'font-medium text-foreground'
                )}
              >
                {lastMessage.content}
              </p>
            )}

            {/* Timestamp */}
            {timestamp && (
              <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
            )}
          </div>

          {/* Unread Badge */}
          {hasUnread && (
            <div className="flex-shrink-0 self-start">
              <Badge variant="default" className="rounded-full h-6 w-6 flex items-center justify-center p-0">
                {unreadCount}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
