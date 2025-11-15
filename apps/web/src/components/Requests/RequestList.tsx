import type { BorrowRequestWithDetails } from '@repo/api-client';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@repo/ui/components/card';
import { Inbox, Send } from '@repo/ui/components/icons';
import { RequestCard } from './RequestCard';

export interface RequestListProps {
  requests: BorrowRequestWithDetails[];
  view: 'incoming' | 'outgoing';
  isLoading?: boolean;
  onApprove?: (requestId: string) => void;
  onDeny?: (requestId: string) => void;
  onMarkHandoverComplete?: (requestId: string) => void;
  onAddTracking?: (requestId: string) => void;
  onInitiateReturn?: (requestId: string) => void;
  onConfirmReturn?: (requestId: string) => void;
  emptyMessage?: string;
}

/**
 * Skeleton loader for request cards
 */
function RequestCardSkeleton() {
  return (
    <Card className="overflow-hidden border-2">
      <CardHeader className="pb-6">
        <div className="flex items-start gap-4">
          {/* Book cover skeleton */}
          <Skeleton className="h-40 w-28 rounded" />

          {/* Book and user info skeleton */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-6 space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>

      <CardFooter className="pt-4 gap-2 flex-col border-t">
        <div className="flex gap-2 w-full">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

/**
 * Simple empty state
 */
function EnhancedEmptyState({ view, message }: { view: 'incoming' | 'outgoing'; message: string }) {
  const isIncoming = view === 'incoming';

  return (
    <div className="p-12 text-center space-y-4 border-2 border-dashed rounded-lg">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          {isIncoming ? (
            <Inbox className="w-8 h-8 text-muted-foreground" />
          ) : (
            <Send className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg text-foreground">
          {message}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {isIncoming
            ? 'When someone requests to borrow your books, they will appear here.'
            : 'Books you request to borrow will appear here.'}
        </p>
      </div>
    </div>
  );
}

export function RequestList({
  requests,
  view,
  isLoading,
  onApprove,
  onDeny,
  onMarkHandoverComplete,
  onAddTracking,
  onInitiateReturn,
  onConfirmReturn,
  emptyMessage,
}: RequestListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <RequestCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <EnhancedEmptyState
        view={view}
        message={emptyMessage || 'No requests found'}
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          view={view}
          onApprove={onApprove}
          onDeny={onDeny}
          onMarkHandoverComplete={onMarkHandoverComplete}
          onAddTracking={onAddTracking}
          onInitiateReturn={onInitiateReturn}
          onConfirmReturn={onConfirmReturn}
        />
      ))}
    </div>
  );
}
