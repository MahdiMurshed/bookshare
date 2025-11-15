import { formatDistanceToNow } from 'date-fns';
import type { MessageWithSender } from '@repo/api-client';
import { cn } from '@repo/ui/lib/utils';

export interface MessageBubbleProps {
  message: MessageWithSender;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const senderName = message.sender?.name || message.sender?.email || 'Unknown';
  const timestamp = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  return (
    <div
      className={cn(
        'flex flex-col gap-1 max-w-[70%]',
        isCurrentUser ? 'ml-auto items-end' : 'mr-auto items-start'
      )}
    >
      {/* Sender name (only show for other user) */}
      {!isCurrentUser && (
        <span className="text-xs text-muted-foreground px-3">{senderName}</span>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'rounded-2xl px-4 py-2 break-words',
          isCurrentUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted rounded-bl-sm'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>

      {/* Timestamp */}
      <span className="text-xs text-muted-foreground px-3">{timestamp}</span>
    </div>
  );
}
