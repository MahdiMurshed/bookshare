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
        'flex flex-col gap-1.5 max-w-[75%] sm:max-w-[70%] group/message',
        isCurrentUser ? 'ml-auto items-end' : 'mr-auto items-start'
      )}
    >
      {/* Sender name (only show for other user) */}
      {!isCurrentUser && (
        <span className="text-xs font-medium text-muted-foreground/70 px-3 tracking-wide">
          {senderName}
        </span>
      )}

      {/* Message bubble */}
      <div className="relative">
        {/* Ambient glow for sent messages */}
        {isCurrentUser && (
          <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-xl rounded-2xl opacity-0 group-hover/message:opacity-100 transition-opacity duration-500" />
        )}

        <div
          className={cn(
            'relative rounded-2xl px-4 py-3 break-words transition-all duration-300',
            'shadow-sm group-hover/message:shadow-md',
            isCurrentUser
              ? [
                  'bg-gradient-to-br from-amber-500 to-orange-600',
                  'dark:from-amber-400 dark:to-orange-500',
                  'text-white dark:text-gray-900',
                  'rounded-br-md',
                  'shadow-amber-500/20 group-hover/message:shadow-amber-500/30',
                ]
              : [
                  'bg-gradient-to-br from-gray-100 to-gray-50',
                  'dark:from-gray-800 dark:to-gray-850',
                  'text-foreground',
                  'rounded-bl-md',
                  'border border-border/50',
                ]
          )}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-sans">
            {message.content}
          </p>
        </div>
      </div>

      {/* Timestamp - Fades in on hover */}
      <span
        className={cn(
          'text-xs text-muted-foreground/50 px-3 transition-opacity duration-300',
          'opacity-0 group-hover/message:opacity-100'
        )}
      >
        {timestamp}
      </span>
    </div>
  );
}
