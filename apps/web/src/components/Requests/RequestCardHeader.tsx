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
    <CardHeader className="pb-4">
      <div className="flex items-start gap-4">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          <ImageWithFallback
            src={request.book.cover_image_url || ''}
            alt={request.book.title || 'Book cover'}
            className="h-24 w-16 rounded object-cover"
          />
        </div>

        {/* Book and User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {request.book.title || 'Unknown Book'}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                by {request.book.author || 'Unknown Author'}
              </p>
              {request.book.genre && (
                <p className="text-xs text-muted-foreground mt-1">{request.book.genre}</p>
              )}
            </div>
            <StatusBadge
              status={STATUS_MAP[request.status] || 'pending'}
              label={request.status.replace('_', ' ')}
            />
          </div>

          <div className="mt-3 text-sm">
            <p className="text-muted-foreground">
              {isIncoming ? 'Requested by' : 'Owner'}:{' '}
              <span className="font-medium text-foreground">
                {otherUser?.name || otherUser?.email || 'Unknown User'}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
