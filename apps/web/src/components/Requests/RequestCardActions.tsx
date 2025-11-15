import { useState } from 'react';
import type { BorrowRequestWithDetails } from '@repo/api-client';
import { CardFooter } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { ChatDialog } from './ChatDialog';

export interface RequestCardActionsProps {
  request: BorrowRequestWithDetails;
  view: 'incoming' | 'outgoing';
  onApprove?: (requestId: string) => void;
  onDeny?: (requestId: string) => void;
  onMarkHandoverComplete?: (requestId: string) => void;
  onAddTracking?: (requestId: string) => void;
  onInitiateReturn?: (requestId: string) => void;
  onConfirmReturn?: (requestId: string) => void;
}

export function RequestCardActions({
  request,
  view,
  onApprove,
  onDeny,
  onMarkHandoverComplete,
  onAddTracking,
  onInitiateReturn,
  onConfirmReturn,
}: RequestCardActionsProps) {
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  const isPending = request.status === 'pending';
  const isApproved = request.status === 'approved';
  const isBorrowed = request.status === 'borrowed';
  const isReturnInitiated = request.status === 'return_initiated';
  const isDenied = request.status === 'denied';
  const isReturned = request.status === 'returned';
  const isIncoming = view === 'incoming';

  const otherUser = isIncoming ? request.borrower : request.owner;

  return (
    <>
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
      {request.book && (
        <ChatDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          requestId={request.id}
          bookTitle={request.book.title}
          otherUserName={otherUser?.name || otherUser?.email || 'Unknown User'}
        />
      )}
    </>
  );
}
