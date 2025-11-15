import { formatDistanceToNow } from 'date-fns';
import type { BorrowRequestWithDetails } from '@repo/api-client';
import { Package, MapPin, Calendar, Truck, MessageSquare, CheckCircle2, Clock } from '@repo/ui/components/icons';

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
        <div className="rounded-lg bg-muted/50 p-4 border border-border">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded bg-muted flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Request Message
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                &ldquo;{request.request_message}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Response Message */}
      {request.response_message && (
        <div className="rounded-lg bg-muted/50 p-4 border border-border">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded bg-muted flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Response
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                &ldquo;{request.response_message}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Handover Details */}
      {showHandoverDetails && (
        <div className="rounded-lg border-2 border-border p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <Package className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Handover Details
              </p>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                {request.handover_method === 'ship' && (
                  <>
                    <Truck className="w-3 h-3" />
                    <span>Ship</span>
                  </>
                )}
                {request.handover_method === 'meetup' && (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>Meet Up</span>
                  </>
                )}
                {request.handover_method === 'pickup' && (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>Pickup</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            {request.handover_address && (
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase">
                  <MapPin className="w-3 h-3" />
                  {request.handover_method === 'ship' ? 'Shipping Address' :
                   request.handover_method === 'meetup' ? 'Meeting Location' :
                   'Pickup Location'}
                </span>
                <p className="text-foreground mt-1 pl-4">
                  {request.handover_address}
                </p>
              </div>
            )}

            {request.handover_datetime && (
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase">
                  <Calendar className="w-3 h-3" />
                  Time
                </span>
                <p className="text-foreground mt-1 pl-4">
                  {new Date(request.handover_datetime).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}

            {request.handover_instructions && (
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase">
                  <MessageSquare className="w-3 h-3" />
                  Instructions
                </span>
                <p className="text-foreground mt-1 pl-4">
                  {request.handover_instructions}
                </p>
              </div>
            )}

            {request.handover_tracking && (
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase">
                  <Truck className="w-3 h-3" />
                  Tracking Number
                </span>
                <p className="text-foreground font-mono mt-1 pl-4 font-semibold">
                  {request.handover_tracking}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Return Details */}
      {showReturnDetails && (
        <div className="rounded-lg border-2 border-border p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <Package className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Return Details
              </p>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                {request.return_method === 'ship' && (
                  <>
                    <Truck className="w-3 h-3" />
                    <span>Ship</span>
                  </>
                )}
                {request.return_method === 'meetup' && (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>Meet Up</span>
                  </>
                )}
                {request.return_method === 'dropoff' && (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>Drop Off</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            {request.return_address && (
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase">
                  <MapPin className="w-3 h-3" />
                  {request.return_method === 'ship' ? 'Return Address' :
                   request.return_method === 'meetup' ? 'Meeting Location' :
                   'Drop Off Location'}
                </span>
                <p className="text-foreground mt-1 pl-4">
                  {request.return_address}
                </p>
              </div>
            )}

            {request.return_datetime && (
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase">
                  <Calendar className="w-3 h-3" />
                  Time
                </span>
                <p className="text-foreground mt-1 pl-4">
                  {new Date(request.return_datetime).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}

            {request.return_instructions && (
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase">
                  <MessageSquare className="w-3 h-3" />
                  Instructions
                </span>
                <p className="text-foreground mt-1 pl-4">
                  {request.return_instructions}
                </p>
              </div>
            )}

            {request.return_tracking && (
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase">
                  <Truck className="w-3 h-3" />
                  Tracking Number
                </span>
                <p className="text-foreground font-mono mt-1 pl-4 font-semibold">
                  {request.return_tracking}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Due Date for Approved Requests */}
      {showDueDate && request.due_date && (
        <div className="flex items-center gap-3 text-sm bg-muted/50 rounded-lg px-4 py-3 border border-border">
          <div className="flex-shrink-0 w-8 h-8 rounded bg-muted flex items-center justify-center">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-medium text-muted-foreground uppercase block">Due Date</span>
            <span className="font-semibold text-foreground">
              {new Date(request.due_date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      )}

      {/* Approved/Returned Dates */}
      <div className="flex flex-wrap gap-3 text-xs">
        {request.approved_at && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-muted border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <span className="font-medium text-muted-foreground">
              Approved {formatDistanceToNow(new Date(request.approved_at), { addSuffix: true })}
            </span>
          </div>
        )}
        {request.returned_at && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-muted border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <span className="font-medium text-muted-foreground">
              Returned {formatDistanceToNow(new Date(request.returned_at), { addSuffix: true })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
