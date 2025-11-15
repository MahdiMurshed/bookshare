import type { BorrowRequestWithDetails } from '@repo/api-client';
import { RequestCard } from './RequestCard';

export interface RequestListProps {
  requests: BorrowRequestWithDetails[];
  view: 'incoming' | 'outgoing';
  isLoading?: boolean;
  onApprove?: (requestId: string) => void;
  onDeny?: (requestId: string) => void;
  emptyMessage?: string;
}

export function RequestList({
  requests,
  view,
  isLoading,
  onApprove,
  onDeny,
  emptyMessage,
}: RequestListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-muted-foreground">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-sm font-medium">
            {emptyMessage || 'No requests found'}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {view === 'incoming'
              ? 'When someone requests to borrow your books, they will appear here.'
              : 'Books you have requested to borrow will appear here.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          view={view}
          onApprove={onApprove}
          onDeny={onDeny}
        />
      ))}
    </div>
  );
}
