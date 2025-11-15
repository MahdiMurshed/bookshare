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
      <CardFooter className="pt-4 gap-3 flex-col bg-gradient-to-t from-muted/20 to-transparent border-t border-border/30">
        {/* Primary action buttons */}
        <div className="flex gap-2 w-full">
          {/* Incoming Pending: Approve/Deny */}
          {isIncoming && isPending && onApprove && onDeny && (
            <>
              <Button
                variant="default"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => onApprove(request.id)}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-border/60 hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive transition-all duration-200"
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
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => onMarkHandoverComplete(request.id)}
            >
              Mark Handover Complete
            </Button>
          )}

          {/* Incoming Approved with Ship method: Add Tracking */}
          {isIncoming && isApproved && request.handover_method === 'ship' && onAddTracking && !request.handover_tracking && (
            <Button
              variant="outline"
              className="w-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              onClick={() => onAddTracking(request.id)}
            >
              Add Tracking Number
            </Button>
          )}

          {/* Outgoing Borrowed: Initiate Return */}
          {!isIncoming && isBorrowed && onInitiateReturn && (
            <Button
              variant="default"
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => onInitiateReturn(request.id)}
            >
              Initiate Return
            </Button>
          )}

          {/* Incoming Return Initiated: Confirm Return Received */}
          {isIncoming && isReturnInitiated && onConfirmReturn && (
            <Button
              variant="default"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
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
            className="w-full border-border/60 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group"
            onClick={() => setChatDialogOpen(true)}
          >
            <span className="group-hover:scale-110 transition-transform duration-200">💬</span>
            <span className="ml-2">Chat with {otherUser?.name || otherUser?.email || 'user'}</span>
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
