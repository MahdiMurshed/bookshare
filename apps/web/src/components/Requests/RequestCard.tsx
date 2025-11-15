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

const STATUS_GLOW: Record<string, string> = {
  pending: 'group-hover:shadow-amber-500/10',
  approved: 'group-hover:shadow-emerald-500/10',
  borrowed: 'group-hover:shadow-blue-500/10',
  return_initiated: 'group-hover:shadow-amber-500/10',
  denied: 'group-hover:shadow-red-500/10',
  returned: 'group-hover:shadow-gray-500/10',
};

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
      <Card className="overflow-hidden border-destructive/30 bg-destructive/5 backdrop-blur-sm">
        <CardContent className="p-6">
          <p className="text-sm text-destructive font-medium">Error: Book data not found for this request.</p>
        </CardContent>
      </Card>
    );
  }

  const statusGlow = STATUS_GLOW[request.status] || STATUS_GLOW.pending;

  return (
    <Card className={`group relative overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-500 h-full flex flex-col shadow-md hover:shadow-2xl ${statusGlow} hover:border-border hover:-translate-y-1 hover:scale-[1.01]`}>
      {/* Subtle animated gradient background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.02]" />
      </div>

      {/* Glow effect on edges */}
      <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-br from-border/0 via-border/20 to-border/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />

      {/* Corner decorative accents */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 delay-100">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-green-600 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
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
