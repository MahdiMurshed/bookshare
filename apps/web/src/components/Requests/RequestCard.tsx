import type { BorrowRequestWithDetails } from '@repo/api-client';
import { Card, CardContent } from '@repo/ui/components/card';
import { RequestCardHeader } from './RequestCardHeader';
import { RequestCardDetails } from './RequestCardDetails';
import { RequestCardActions } from './RequestCardActions';

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

/**
 * RequestCard component - displays borrow request details and actions
 * Refactored into smaller sub-components for better maintainability
 */
export function RequestCard({
  request,
  view,
  onApprove,
  onDeny,
  onMarkHandoverComplete,
  onAddTracking,
  onInitiateReturn,
  onConfirmReturn,
}: RequestCardProps) {
  // Defensive null checks - if critical data is missing, show error state
  if (!request.book) {
    return (
      <Card className="overflow-hidden border-2 border-destructive bg-destructive/5">
        <CardContent className="p-6">
          <p className="text-sm text-destructive font-medium">Error: Book data not found for this request.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-2 hover:border-primary hover:shadow-lg transition-all h-full flex flex-col">
      <div className="flex flex-col h-full">
        <RequestCardHeader request={request} view={view} />

        <CardContent className="pt-0 flex-1 pb-6">
          <RequestCardDetails request={request} />
        </CardContent>

        <RequestCardActions
          request={request}
          view={view}
          onApprove={onApprove}
          onDeny={onDeny}
          onMarkHandoverComplete={onMarkHandoverComplete}
          onAddTracking={onAddTracking}
          onInitiateReturn={onInitiateReturn}
          onConfirmReturn={onConfirmReturn}
        />
      </div>
    </Card>
  );
}
