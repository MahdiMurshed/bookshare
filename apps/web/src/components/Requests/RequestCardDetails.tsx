import { formatDistanceToNow } from 'date-fns';
import type { BorrowRequestWithDetails } from '@repo/api-client';

export interface RequestCardDetailsProps {
  request: BorrowRequestWithDetails;
}

export function RequestCardDetails({ request }: RequestCardDetailsProps) {
  const isApproved = request.status === 'approved';
  const isBorrowed = request.status === 'borrowed';
  const isReturnInitiated = request.status === 'return_initiated';
  const isReturned = request.status === 'returned';

  const showHandoverDetails = request.handover_method && (isApproved || isBorrowed || isReturnInitiated || isReturned);
  const showReturnDetails = request.return_method && (isReturnInitiated || isReturned);
  const showDueDate = request.due_date && (isApproved || isBorrowed || isReturnInitiated);

  return (
    <div className="space-y-3">
      {/* Request Message */}
      {request.request_message && (
        <div className="bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm rounded-lg p-4 border border-border/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Request Message
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed italic">
            &ldquo;{request.request_message}&rdquo;
          </p>
        </div>
      )}

      {/* Response Message */}
      {request.response_message && (
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
            Response
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed italic">
            &ldquo;{request.response_message}&rdquo;
          </p>
        </div>
      )}

      {/* Handover Details */}
      {showHandoverDetails && (
        <div className="bg-gradient-to-br from-emerald-50/50 to-green-50/30 dark:from-emerald-950/30 dark:to-green-950/20 backdrop-blur-sm rounded-lg p-4 border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
              Handover Details
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-base font-medium text-emerald-900 dark:text-emerald-100">
              <span>
                {request.handover_method === 'ship' && '📦 Ship'}
                {request.handover_method === 'meetup' && '🤝 Meet Up'}
                {request.handover_method === 'pickup' && '📍 Pickup'}
              </span>
            </div>
            {request.handover_address && (
              <div className="space-y-1">
                <span className="font-semibold text-emerald-800 dark:text-emerald-200 text-xs uppercase tracking-wide">
                  {request.handover_method === 'ship' ? 'Shipping Address' :
                   request.handover_method === 'meetup' ? 'Meeting Location' :
                   'Pickup Location'}
                </span>
                <p className="text-foreground/80 pl-3 border-l-2 border-emerald-300 dark:border-emerald-700">
                  {request.handover_address}
                </p>
              </div>
            )}
            {request.handover_datetime && (
              <div className="space-y-1">
                <span className="font-semibold text-emerald-800 dark:text-emerald-200 text-xs uppercase tracking-wide">
                  Time
                </span>
                <p className="text-foreground/80 pl-3 border-l-2 border-emerald-300 dark:border-emerald-700">
                  {new Date(request.handover_datetime).toLocaleString()}
                </p>
              </div>
            )}
            {request.handover_instructions && (
              <div className="space-y-1">
                <span className="font-semibold text-emerald-800 dark:text-emerald-200 text-xs uppercase tracking-wide">
                  Instructions
                </span>
                <p className="text-foreground/80 pl-3 border-l-2 border-emerald-300 dark:border-emerald-700">
                  {request.handover_instructions}
                </p>
              </div>
            )}
            {request.handover_tracking && (
              <div className="space-y-1">
                <span className="font-semibold text-emerald-800 dark:text-emerald-200 text-xs uppercase tracking-wide">
                  Tracking Number
                </span>
                <p className="text-foreground/80 font-mono text-xs pl-3 border-l-2 border-emerald-300 dark:border-emerald-700">
                  {request.handover_tracking}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Return Details */}
      {showReturnDetails && (
        <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/30 dark:to-orange-950/20 backdrop-blur-sm rounded-lg p-4 border border-amber-200/50 dark:border-amber-800/30 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
              Return Details
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-base font-medium text-amber-900 dark:text-amber-100">
              <span>
                {request.return_method === 'ship' && '📦 Ship'}
                {request.return_method === 'meetup' && '🤝 Meet Up'}
                {request.return_method === 'dropoff' && '📍 Drop Off'}
              </span>
            </div>
            {request.return_address && (
              <div className="space-y-1">
                <span className="font-semibold text-amber-800 dark:text-amber-200 text-xs uppercase tracking-wide">
                  {request.return_method === 'ship' ? 'Return Address' :
                   request.return_method === 'meetup' ? 'Meeting Location' :
                   'Drop Off Location'}
                </span>
                <p className="text-foreground/80 pl-3 border-l-2 border-amber-300 dark:border-amber-700">
                  {request.return_address}
                </p>
              </div>
            )}
            {request.return_datetime && (
              <div className="space-y-1">
                <span className="font-semibold text-amber-800 dark:text-amber-200 text-xs uppercase tracking-wide">
                  Time
                </span>
                <p className="text-foreground/80 pl-3 border-l-2 border-amber-300 dark:border-amber-700">
                  {new Date(request.return_datetime).toLocaleString()}
                </p>
              </div>
            )}
            {request.return_instructions && (
              <div className="space-y-1">
                <span className="font-semibold text-amber-800 dark:text-amber-200 text-xs uppercase tracking-wide">
                  Instructions
                </span>
                <p className="text-foreground/80 pl-3 border-l-2 border-amber-300 dark:border-amber-700">
                  {request.return_instructions}
                </p>
              </div>
            )}
            {request.return_tracking && (
              <div className="space-y-1">
                <span className="font-semibold text-amber-800 dark:text-amber-200 text-xs uppercase tracking-wide">
                  Tracking Number
                </span>
                <p className="text-foreground/80 font-mono text-xs pl-3 border-l-2 border-amber-300 dark:border-amber-700">
                  {request.return_tracking}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Due Date for Approved Requests */}
      {showDueDate && request.due_date && (
        <div className="flex items-center gap-3 text-sm bg-muted/30 rounded-lg px-4 py-2.5 border border-border/30">
          <span className="font-semibold text-foreground/70">Due Date:</span>
          <span className="font-medium text-foreground">
            {new Date(request.due_date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      )}

      {/* Approved/Returned Dates */}
      <div className="flex flex-wrap gap-3 text-xs">
        {request.approved_at && (
          <div className="inline-flex items-center gap-1.5 text-muted-foreground/70">
            <span className="inline-block w-1 h-1 rounded-full bg-emerald-500" />
            Approved {formatDistanceToNow(new Date(request.approved_at), { addSuffix: true })}
          </div>
        )}
        {request.returned_at && (
          <div className="inline-flex items-center gap-1.5 text-muted-foreground/70">
            <span className="inline-block w-1 h-1 rounded-full bg-blue-500" />
            Returned {formatDistanceToNow(new Date(request.returned_at), { addSuffix: true })}
          </div>
        )}
      </div>
    </div>
  );
}
