import { useState } from 'react';
import type { BorrowRequestWithDetails } from '@repo/api-client';
import { CardFooter } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { ChatDialog } from './ChatDialog';
import { CheckCircle, XCircle, Package, RotateCcw, Truck, MessageCircle } from '@repo/ui/components/icons';

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
      <CardFooter className="pt-6 gap-3 flex-col bg-gradient-to-t from-muted/10 via-muted/5 to-transparent border-t border-border/40 relative overflow-hidden">
        {/* Decorative gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

        {/* Primary action buttons */}
        <div className="flex gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Incoming Pending: Approve/Deny */}
          {isIncoming && isPending && onApprove && onDeny && (
            <>
              <Button
                variant="default"
                className="relative flex-1 h-11 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-700 hover:via-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 shadow-emerald-500/20 transition-all duration-300 border-0 overflow-hidden group"
                onClick={() => onApprove(request.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
                <CheckCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span>Approve</span>
              </Button>
              <Button
                variant="outline"
                className="relative flex-1 h-11 border-2 border-border/60 hover:border-red-500/50 bg-background hover:bg-red-50/50 dark:hover:bg-red-950/20 text-foreground hover:text-red-700 dark:hover:text-red-400 font-semibold transition-all duration-300 group overflow-hidden"
                onClick={() => onDeny(request.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <XCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span>Deny</span>
              </Button>
            </>
          )}

          {/* Incoming Approved: Mark Handover Complete */}
          {isIncoming && isApproved && onMarkHandoverComplete && (
            <Button
              variant="default"
              className="relative w-full h-11 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-700 hover:via-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 shadow-emerald-500/20 transition-all duration-300 border-0 overflow-hidden group"
              onClick={() => onMarkHandoverComplete(request.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
              <Package className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              <span>Mark Handover Complete</span>
            </Button>
          )}

          {/* Incoming Approved with Ship method: Add Tracking */}
          {isIncoming && isApproved && request.handover_method === 'ship' && onAddTracking && !request.handover_tracking && (
            <Button
              variant="outline"
              className="relative w-full h-11 border-2 border-amber-500/40 hover:border-amber-500/60 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/30 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/50 dark:hover:to-orange-950/50 text-amber-900 dark:text-amber-200 font-semibold transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-amber-500/20 group overflow-hidden"
              onClick={() => onAddTracking(request.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/20 to-amber-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Truck className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
              <span>Add Tracking Number</span>
            </Button>
          )}

          {/* Outgoing Borrowed: Initiate Return */}
          {!isIncoming && isBorrowed && onInitiateReturn && (
            <Button
              variant="default"
              className="relative w-full h-11 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-700 hover:via-orange-700 hover:to-amber-700 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-amber-500/30 shadow-amber-500/20 transition-all duration-300 border-0 overflow-hidden group"
              onClick={() => onInitiateReturn(request.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
              <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              <span>Initiate Return</span>
            </Button>
          )}

          {/* Incoming Return Initiated: Confirm Return Received */}
          {isIncoming && isReturnInitiated && onConfirmReturn && (
            <Button
              variant="default"
              className="relative w-full h-11 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/30 shadow-blue-500/20 transition-all duration-300 border-0 overflow-hidden group"
              onClick={() => onConfirmReturn(request.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
              <CheckCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              <span>Confirm Return Received</span>
            </Button>
          )}
        </div>

        {/* Chat button (show for all active requests) */}
        {!isDenied && !isReturned && (
          <Button
            variant="outline"
            className="relative w-full h-10 border-2 border-border/60 hover:border-primary/50 bg-background hover:bg-primary/5 text-foreground font-medium transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100"
            onClick={() => setChatDialogOpen(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <MessageCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="truncate">Chat with {otherUser?.name || otherUser?.email || 'user'}</span>
          </Button>
        )}

        {/* Decorative bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
