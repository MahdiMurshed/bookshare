import { formatDistanceToNow } from 'date-fns';
import type { BorrowRequestWithDetails } from '@repo/api-client';
import { CardHeader } from '@repo/ui/components/card';
import { StatusBadge } from '@repo/ui/components/status-badge';
import type { StatusVariant } from '@repo/ui/components/status-badge';
import { ImageWithFallback } from '../ImageWithFallback';

export interface RequestCardHeaderProps {
  request: BorrowRequestWithDetails;
  view: 'incoming' | 'outgoing';
}

const STATUS_MAP: Record<string, StatusVariant> = {
  pending: 'pending',
  approved: 'approved',
  borrowed: 'borrowed',
  return_initiated: 'warning',
  denied: 'denied',
  returned: 'completed',
};

export function RequestCardHeader({ request, view }: RequestCardHeaderProps) {
  const isIncoming = view === 'incoming';
  const otherUser = isIncoming ? request.borrower : request.owner;

  if (!request.book) {
    return null;
  }

  return (
    <CardHeader className="pb-4 bg-gradient-to-b from-muted/30 to-transparent">
      <div className="flex items-start gap-5">
        {/* Book Cover */}
        <div className="flex-shrink-0 relative group/cover">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10 rounded-lg blur-sm group-hover/cover:blur-md transition-all duration-300" />
          <ImageWithFallback
            src={request.book.cover_image_url || ''}
            alt={request.book.title || 'Book cover'}
            className="relative h-28 w-20 rounded-lg object-cover shadow-md ring-1 ring-border/50 group-hover:ring-primary/30 transition-all duration-300"
          />
        </div>

        {/* Book and User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-bold text-xl tracking-tight truncate text-foreground leading-tight mb-1">
                {request.book.title || 'Unknown Book'}
              </h3>
              <p className="text-sm text-muted-foreground/80 truncate font-medium">
                by {request.book.author || 'Unknown Author'}
              </p>
              {request.book.genre && (
                <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-md">
                  {request.book.genre}
                </span>
              )}
            </div>
            <StatusBadge
              status={STATUS_MAP[request.status] || 'pending'}
              label={request.status.replace('_', ' ')}
            />
          </div>

          <div className="mt-4 space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground/70">
                {isIncoming ? 'Requested by' : 'Owner'}:
              </span>
              <span className="font-semibold text-foreground">
                {otherUser?.name || otherUser?.email || 'Unknown User'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground/60 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40" />
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
