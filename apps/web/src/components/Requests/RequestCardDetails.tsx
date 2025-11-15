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
    <>
      {/* Request Message */}
      {request.request_message && (
        <div className="bg-muted rounded-md p-3">
          <p className="text-sm font-medium mb-1">Request Message:</p>
          <p className="text-sm text-muted-foreground">{request.request_message}</p>
        </div>
      )}

      {/* Response Message */}
      {request.response_message && (
        <div className="bg-muted rounded-md p-3 mt-2">
          <p className="text-sm font-medium mb-1">Response:</p>
          <p className="text-sm text-muted-foreground">{request.response_message}</p>
        </div>
      )}

      {/* Handover Details */}
      {showHandoverDetails && (
        <div className="bg-status-approved-bg border border-status-approved rounded-md p-3 mt-2">
          <p className="text-sm font-medium mb-2">Handover Details:</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span>
                {request.handover_method === 'ship' && '📦 Ship'}
                {request.handover_method === 'meetup' && '🤝 Meet Up'}
                {request.handover_method === 'pickup' && '📍 Pickup'}
              </span>
            </div>
            {request.handover_address && (
              <div>
                <span className="font-medium">
                  {request.handover_method === 'ship' ? 'Shipping Address:' :
                   request.handover_method === 'meetup' ? 'Meeting Location:' :
                   'Pickup Location:'}
                </span>
                <p className="text-muted-foreground">{request.handover_address}</p>
              </div>
            )}
            {request.handover_datetime && (
              <div>
                <span className="font-medium">Time:</span>
                <span className="text-muted-foreground ml-1">
                  {new Date(request.handover_datetime).toLocaleString()}
                </span>
              </div>
            )}
            {request.handover_instructions && (
              <div>
                <span className="font-medium">Instructions:</span>
                <p className="text-muted-foreground">{request.handover_instructions}</p>
              </div>
            )}
            {request.handover_tracking && (
              <div>
                <span className="font-medium">Tracking:</span>
                <span className="text-muted-foreground ml-1">{request.handover_tracking}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Return Details */}
      {showReturnDetails && (
        <div className="bg-status-pending-bg border border-status-pending rounded-md p-3 mt-2">
          <p className="text-sm font-medium mb-2">Return Details:</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span>
                {request.return_method === 'ship' && '📦 Ship'}
                {request.return_method === 'meetup' && '🤝 Meet Up'}
                {request.return_method === 'dropoff' && '📍 Drop Off'}
              </span>
            </div>
            {request.return_address && (
              <div>
                <span className="font-medium">
                  {request.return_method === 'ship' ? 'Return Address:' :
                   request.return_method === 'meetup' ? 'Meeting Location:' :
                   'Drop Off Location:'}
                </span>
                <p className="text-muted-foreground">{request.return_address}</p>
              </div>
            )}
            {request.return_datetime && (
              <div>
                <span className="font-medium">Time:</span>
                <span className="text-muted-foreground ml-1">
                  {new Date(request.return_datetime).toLocaleString()}
                </span>
              </div>
            )}
            {request.return_instructions && (
              <div>
                <span className="font-medium">Instructions:</span>
                <p className="text-muted-foreground">{request.return_instructions}</p>
              </div>
            )}
            {request.return_tracking && (
              <div>
                <span className="font-medium">Tracking:</span>
                <span className="text-muted-foreground ml-1">{request.return_tracking}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Due Date for Approved Requests */}
      {showDueDate && request.due_date && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-medium">Due Date:</span>
          <span className="text-muted-foreground">
            {new Date(request.due_date).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Approved/Returned Dates */}
      {request.approved_at && (
        <div className="mt-2 text-xs text-muted-foreground">
          Approved {formatDistanceToNow(new Date(request.approved_at), { addSuffix: true })}
        </div>
      )}
      {request.returned_at && (
        <div className="mt-2 text-xs text-muted-foreground">
          Returned {formatDistanceToNow(new Date(request.returned_at), { addSuffix: true })}
        </div>
      )}
    </>
  );
}
