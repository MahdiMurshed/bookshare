import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { BorrowRequestWithDetails } from '@repo/api-client';
import { Card, CardContent, CardFooter, CardHeader } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ImageWithFallback } from '../ImageWithFallback';
import { ChatDialog } from './ChatDialog';

export interface RequestCardProps {
  request: BorrowRequestWithDetails;
  view: 'incoming' | 'outgoing';
  onApprove?: (requestId: string) => void;
  onDeny?: (requestId: string) => void;
  onMarkHandoverComplete?: (requestId: string) => void;
  onAddTracking?: (requestId: string) => void;
  onInitiateReturn?: (requestId: string) => void;
  onConfirmReturn?: (requestId: string) => void;
}

export function RequestCard({
  request,
  view,
  onApprove,
  onDeny,
  onMarkHandoverComplete,
  onAddTracking,
  onInitiateReturn,
  onConfirmReturn
}: RequestCardProps) {
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  // Defensive null checks - if critical data is missing, show error state
  if (!request.book) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <p className="text-sm text-destructive">Error: Book data not found for this request.</p>
        </CardContent>
      </Card>
    );
  }

  const isPending = request.status === 'pending';
  const isApproved = request.status === 'approved';
  const isBorrowed = request.status === 'borrowed';
  const isReturnInitiated = request.status === 'return_initiated';
  const isDenied = request.status === 'denied';
  const isReturned = request.status === 'returned';
  const isIncoming = view === 'incoming';

  // For incoming requests, show borrower; for outgoing, show owner
  // Fallback to empty object to prevent crashes if user data is missing
  const otherUser = isIncoming ? request.borrower : request.owner;

  const statusVariant = {
    pending: 'default' as const,
    approved: 'default' as const,
    borrowed: 'default' as const,
    return_initiated: 'default' as const,
    denied: 'destructive' as const,
    returned: 'secondary' as const,
  }[request.status];

  const statusColor = {
    pending: 'bg-yellow-500',
    approved: 'bg-blue-500',
    borrowed: 'bg-green-500',
    return_initiated: 'bg-orange-500',
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

        {/* Handover Details */}
        {request.handover_method && (isApproved || isBorrowed || request.status === 'return_initiated' || request.status === 'returned') && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-3 mt-2">
            <p className="text-sm font-medium mb-2">Handover Details:</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>
                  {request.handover_method === 'ship' && '📦 Ship'}
                  {request.handover_method === 'meetup' && '🤝 Meet Up'}
                  {request.handover_method === 'pickup' && '📍 Pickup'}
                </span>
              </div>
              {request.handover_address && (
                <div>
                  <span className="font-medium">
                    {request.handover_method === 'ship' ? 'Shipping Address:' :
                     request.handover_method === 'meetup' ? 'Meeting Location:' :
                     'Pickup Location:'}
                  </span>
                  <p className="text-muted-foreground">{request.handover_address}</p>
                </div>
              )}
              {request.handover_datetime && (
                <div>
                  <span className="font-medium">Time:</span>
                  <span className="text-muted-foreground ml-1">
                    {new Date(request.handover_datetime).toLocaleString()}
                  </span>
                </div>
              )}
              {request.handover_instructions && (
                <div>
                  <span className="font-medium">Instructions:</span>
                  <p className="text-muted-foreground">{request.handover_instructions}</p>
                </div>
              )}
              {request.handover_tracking && (
                <div>
                  <span className="font-medium">Tracking:</span>
                  <span className="text-muted-foreground ml-1">{request.handover_tracking}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Return Details */}
        {request.return_method && (request.status === 'return_initiated' || request.status === 'returned') && (
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-md p-3 mt-2">
            <p className="text-sm font-medium mb-2">Return Details:</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>
                  {request.return_method === 'ship' && '📦 Ship'}
                  {request.return_method === 'meetup' && '🤝 Meet Up'}
                  {request.return_method === 'dropoff' && '📍 Drop Off'}
                </span>
              </div>
              {request.return_address && (
                <div>
                  <span className="font-medium">
                    {request.return_method === 'ship' ? 'Return Address:' :
                     request.return_method === 'meetup' ? 'Meeting Location:' :
                     'Drop Off Location:'}
                  </span>
                  <p className="text-muted-foreground">{request.return_address}</p>
                </div>
              )}
              {request.return_datetime && (
                <div>
                  <span className="font-medium">Time:</span>
                  <span className="text-muted-foreground ml-1">
                    {new Date(request.return_datetime).toLocaleString()}
                  </span>
                </div>
              )}
              {request.return_instructions && (
                <div>
                  <span className="font-medium">Instructions:</span>
                  <p className="text-muted-foreground">{request.return_instructions}</p>
                </div>
              )}
              {request.return_tracking && (
                <div>
                  <span className="font-medium">Tracking:</span>
                  <span className="text-muted-foreground ml-1">{request.return_tracking}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Due Date for Approved Requests */}
        {request.due_date && (isApproved || isBorrowed || request.status === 'return_initiated') && (
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

      {/* Action Buttons */}
      <CardFooter className="pt-0 gap-2 flex-col">
        {/* Primary action buttons */}
        <div className="flex gap-2 w-full">
          {/* Incoming Pending: Approve/Deny */}
          {isIncoming && isPending && onApprove && onDeny && (
            <>
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
            </>
          )}

          {/* Incoming Approved: Mark Handover Complete */}
          {isIncoming && isApproved && onMarkHandoverComplete && (
            <Button
              variant="default"
              className="w-full"
              onClick={() => onMarkHandoverComplete(request.id)}
            >
              Mark Handover Complete
            </Button>
          )}

          {/* Incoming Approved with Ship method: Add Tracking */}
          {isIncoming && isApproved && request.handover_method === 'ship' && onAddTracking && !request.handover_tracking && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onAddTracking(request.id)}
            >
              Add Tracking Number
            </Button>
          )}

          {/* Outgoing Borrowed: Initiate Return */}
          {!isIncoming && isBorrowed && onInitiateReturn && (
            <Button
              variant="default"
              className="w-full"
              onClick={() => onInitiateReturn(request.id)}
            >
              Initiate Return
            </Button>
          )}

          {/* Incoming Return Initiated: Confirm Return Received */}
          {isIncoming && isReturnInitiated && onConfirmReturn && (
            <Button
              variant="default"
              className="w-full"
              onClick={() => onConfirmReturn(request.id)}
            >
              Confirm Return Received
            </Button>
          )}
        </div>

        {/* Chat button (show for all active requests) */}
        {!isDenied && !isReturned && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setChatDialogOpen(true)}
          >
            💬 Chat with {otherUser?.name || otherUser?.email || 'user'}
          </Button>
        )}
      </CardFooter>

      {/* Chat Dialog */}
      <ChatDialog
        open={chatDialogOpen}
        onOpenChange={setChatDialogOpen}
        requestId={request.id}
        bookTitle={request.book.title}
        otherUserName={otherUser?.name || otherUser?.email || 'Unknown User'}
      />
    </Card>
  );
}
