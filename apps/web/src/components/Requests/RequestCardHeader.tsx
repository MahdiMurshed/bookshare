import { formatDistanceToNow } from 'date-fns';
import type { BorrowRequestWithDetails } from '@repo/api-client';
import { CardHeader } from '@repo/ui/components/card';
import { StatusBadge } from '@repo/ui/components/status-badge';
import type { StatusVariant } from '@repo/ui/components/status-badge';
import { Badge } from '@repo/ui/components/badge';
import { ImageWithFallback } from '../ImageWithFallback';
import { User, Calendar } from '@repo/ui/components/icons';

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
    <CardHeader className="pb-6">
      <div className="flex items-start gap-4">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          <ImageWithFallback
            src={request.book.cover_image_url || ''}
            alt={request.book.title || 'Book cover'}
            className="h-40 w-28 rounded object-cover shadow-sm"
          />
        </div>

        {/* Book and User Info */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Title and Status Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl tracking-tight text-foreground leading-tight mb-1">
                {request.book.title || 'Unknown Book'}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                by {request.book.author || 'Unknown Author'}
              </p>
              {request.book.genre && (
                <Badge variant="secondary" className="text-xs">
                  {request.book.genre}
                </Badge>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0">
              <StatusBadge
                status={STATUS_MAP[request.status] || 'pending'}
                label={request.status.replace('_', ' ')}
              />
            </div>
          </div>

          {/* User and Date Info */}
          <div className="space-y-2">
            {/* User info */}
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <User className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {isIncoming ? 'Requested by' : 'Owner'}
                </p>
                <p className="text-sm font-medium text-foreground truncate">
                  {otherUser?.name || otherUser?.email || 'Unknown User'}
                </p>
              </div>
            </div>

            {/* Date info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>
                Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
