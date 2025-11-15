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
        'flex flex-col gap-1 max-w-[75%] sm:max-w-[70%] group/message',
        isCurrentUser ? 'ml-auto items-end' : 'mr-auto items-start'
      )}
    >
      {/* Sender name (only show for other user) */}
      {!isCurrentUser && (
        <span className="text-xs font-medium text-muted-foreground px-1">
          {senderName}
        </span>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'rounded-2xl px-4 py-2.5 break-words',
          isCurrentUser
            ? [
                'bg-primary text-primary-foreground',
                'rounded-br-md',
              ]
            : [
                'bg-muted text-foreground',
                'rounded-bl-md',
              ]
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>

      {/* Timestamp - Always visible but subtle */}
      <span className="text-xs text-muted-foreground px-1">
        {timestamp}
      </span>
    </div>
  );
}
