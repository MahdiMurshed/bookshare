import { formatDistanceToNow } from 'date-fns';
import type { BorrowRequestWithDetails } from '@repo/api-client';
import { Card, CardContent, CardFooter, CardHeader } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ImageWithFallback } from '../ImageWithFallback';

export interface RequestCardProps {
  request: BorrowRequestWithDetails;
  view: 'incoming' | 'outgoing';
  onApprove?: (requestId: string) => void;
  onDeny?: (requestId: string) => void;
}

export function RequestCard({ request, view, onApprove, onDeny }: RequestCardProps) {
  const isPending = request.status === 'pending';
  const isIncoming = view === 'incoming';

  // For incoming requests, show borrower; for outgoing, show owner
  const otherUser = isIncoming ? request.borrower : request.owner;

  const statusVariant = {
    pending: 'default' as const,
    approved: 'default' as const,
    denied: 'destructive' as const,
    returned: 'secondary' as const,
  }[request.status];

  const statusColor = {
    pending: 'bg-yellow-500',
    approved: 'bg-green-500',
    denied: 'bg-red-500',
    returned: 'bg-gray-500',
  }[request.status];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            <ImageWithFallback
              src={request.book?.cover_image_url || ''}
              alt={request.book?.title || 'Book cover'}
              className="h-24 w-16 rounded object-cover"
            />
          </div>

          {/* Book and User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {request.book?.title || 'Unknown Book'}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  by {request.book?.author || 'Unknown Author'}
                </p>
                {request.book?.genre && (
                  <p className="text-xs text-muted-foreground mt-1">{request.book.genre}</p>
                )}
              </div>
              <Badge variant={statusVariant} className={statusColor}>
                {request.status}
              </Badge>
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

      <CardContent className="pt-0">
        {/* Request Message */}
        {request.request_message && (
          <div className="bg-muted rounded-md p-3">
            <p className="text-sm font-medium mb-1">Request Message:</p>
            <p className="text-sm text-muted-foreground">{request.request_message}</p>
          </div>
        )}

        {/* Response Message */}
        {request.response_message && (
          <div className="bg-muted rounded-md p-3 mt-2">
            <p className="text-sm font-medium mb-1">Response:</p>
            <p className="text-sm text-muted-foreground">{request.response_message}</p>
          </div>
        )}

        {/* Due Date for Approved Requests */}
        {request.status === 'approved' && request.due_date && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="font-medium">Due Date:</span>
            <span className="text-muted-foreground">
              {new Date(request.due_date).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Approved/Returned Dates */}
        {request.approved_at && (
          <div className="mt-2 text-xs text-muted-foreground">
            Approved {formatDistanceToNow(new Date(request.approved_at), { addSuffix: true })}
          </div>
        )}
        {request.returned_at && (
          <div className="mt-2 text-xs text-muted-foreground">
            Returned {formatDistanceToNow(new Date(request.returned_at), { addSuffix: true })}
          </div>
        )}
      </CardContent>

      {/* Action Buttons (only for incoming pending requests) */}
      {isIncoming && isPending && onApprove && onDeny && (
        <CardFooter className="pt-0 gap-2">
          <Button
            variant="default"
            className="flex-1"
            onClick={() => onApprove(request.id)}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onDeny(request.id)}
          >
            Deny
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
