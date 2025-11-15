import type { BorrowRequestWithDetails } from '@repo/api-client';
import { EmptyState } from '@repo/ui/components/empty-state';
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
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-24 w-16 rounded flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <Skeleton className="h-20 w-full rounded-md" />
      </CardContent>
      <CardFooter className="pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
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
          <div
            key={i}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <RequestCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={view === 'incoming' ? Inbox : Send}
        title={emptyMessage || 'No requests found'}
        description={
          view === 'incoming'
            ? 'When someone requests to borrow your books, they will appear here. Share your library to start receiving requests!'
            : 'Books you request to borrow will appear here. Browse available books to get started.'
        }
        className="my-8"
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {requests.map((request, index) => (
        <div
          key={request.id}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <RequestCard
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
      ))}
    </div>
  );
}
