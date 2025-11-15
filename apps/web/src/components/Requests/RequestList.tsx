import type { BorrowRequestWithDetails } from '@repo/api-client';
import { EmptyState } from '@repo/ui/components/empty-state';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@repo/ui/components/card';
import { Inbox, Send, BookOpen, Sparkles } from '@repo/ui/components/icons';
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
 * Skeleton loader for request cards with enhanced styling
 */
function RequestCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <Card
      className="overflow-hidden border-border/60 bg-card/60 backdrop-blur-sm shadow-md animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="pb-6 bg-gradient-to-b from-muted/20 via-muted/10 to-transparent relative">
        {/* Decorative shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/20 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />

        <div className="relative flex items-start gap-6">
          {/* Book cover skeleton with decorative frame */}
          <div className="flex-shrink-0 relative">
            <div className="absolute -inset-2 rounded-xl bg-gradient-to-br from-border/40 via-border/20 to-transparent opacity-60" />
            <Skeleton className="relative h-40 w-28 rounded-lg shadow-xl" />
          </div>

          {/* Book and user info skeleton */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-7 w-3/4 rounded-lg" />
                <Skeleton className="h-5 w-1/2 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
              </div>
              <Skeleton className="h-3 w-40 rounded" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-6 space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </CardContent>

      <CardFooter className="pt-6 gap-3 flex-col border-t border-border/40">
        <div className="flex gap-3 w-full">
          <Skeleton className="h-11 flex-1 rounded-lg" />
          <Skeleton className="h-11 flex-1 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardFooter>
    </Card>
  );
}

/**
 * Enhanced empty state with animations and better visuals
 */
function EnhancedEmptyState({ view, message }: { view: 'incoming' | 'outgoing'; message: string }) {
  const isIncoming = view === 'incoming';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-muted/30 via-muted/20 to-muted/30 backdrop-blur-sm p-12 border border-border/50 shadow-lg animate-in fade-in zoom-in duration-700">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-green-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border-2 border-border/50 shadow-xl">
              {isIncoming ? (
                <Inbox className="w-10 h-10 text-muted-foreground" />
              ) : (
                <Send className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h3 className="font-serif font-bold text-2xl text-foreground tracking-tight">
            {message}
          </h3>
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-serif-body)' }}>
            {isIncoming
              ? 'When someone requests to borrow your books, they will appear here. Share your library to start receiving requests!'
              : 'Books you request to borrow will appear here. Browse available books to get started.'}
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-border" />
          <Sparkles className="w-5 h-5 text-amber-500/50" />
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-border" />
        </div>
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
          <RequestCardSkeleton key={i} delay={i * 100} />
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
      {requests.map((request, index) => (
        <div
          key={request.id}
          className="animate-in fade-in slide-in-from-bottom-6 duration-700"
          style={{ animationDelay: `${index * 75}ms` }}
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
