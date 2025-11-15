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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Request Message */}
      {request.request_message && (
        <div className="group/message relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/60 via-muted/40 to-muted/50 backdrop-blur-sm p-5 border border-border/40 hover:border-border/60 transition-all duration-300 shadow-sm hover:shadow-md">
          {/* Decorative corner accent */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 via-orange-500 to-amber-600 opacity-60" />

          <div className="relative flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/50">
              <MessageSquare className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-2">
                Request Message
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed italic" style={{ fontFamily: 'var(--font-serif-body)' }}>
                &ldquo;{request.request_message}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Response Message */}
      {request.response_message && (
        <div className="group/message relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-emerald-50/80 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-emerald-950/40 backdrop-blur-sm p-5 border border-emerald-200/50 dark:border-emerald-800/40 hover:border-emerald-300/60 dark:hover:border-emerald-700/50 transition-all duration-300 shadow-sm hover:shadow-md">
          {/* Decorative corner accent */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 via-green-500 to-emerald-600 opacity-60" />

          <div className="relative flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider mb-2">
                Response
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed italic" style={{ fontFamily: 'var(--font-serif-body)' }}>
                &ldquo;{request.response_message}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Handover Details */}
      {showHandoverDetails && (
        <div className="group/handover relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50/90 via-green-50/70 to-emerald-100/80 dark:from-emerald-950/50 dark:via-green-950/40 dark:to-emerald-900/50 backdrop-blur-sm p-6 border border-emerald-200/60 dark:border-emerald-800/40 shadow-md hover:shadow-xl transition-all duration-300">
          {/* Decorative glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-green-500/10 opacity-0 group-hover/handover:opacity-100 transition-opacity duration-500" />

          {/* Decorative corner accents */}
          <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full blur-2xl" />
          </div>

          <div className="relative">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-emerald-200/50 dark:border-emerald-800/30">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Handover Details
                </p>
                <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2 mt-0.5">
                  {request.handover_method === 'ship' && (
                    <>
                      <Truck className="w-4 h-4" />
                      <span>Ship</span>
                    </>
                  )}
                  {request.handover_method === 'meetup' && (
                    <>
                      <MapPin className="w-4 h-4" />
                      <span>Meet Up</span>
                    </>
                  )}
                  {request.handover_method === 'pickup' && (
                    <>
                      <MapPin className="w-4 h-4" />
                      <span>Pickup</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Details grid */}
            <div className="space-y-4">
              {request.handover_address && (
                <div className="group/detail space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    {request.handover_method === 'ship' ? 'Shipping Address' :
                     request.handover_method === 'meetup' ? 'Meeting Location' :
                     'Pickup Location'}
                  </span>
                  <p className="text-sm text-foreground/90 pl-4 py-2 border-l-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-r px-3" style={{ fontFamily: 'var(--font-serif-body)' }}>
                    {request.handover_address}
                  </p>
                </div>
              )}

              {request.handover_datetime && (
                <div className="group/detail space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    Time
                  </span>
                  <p className="text-sm text-foreground/90 pl-4 py-2 border-l-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-r px-3">
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
                <div className="group/detail space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wider">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Instructions
                  </span>
                  <p className="text-sm text-foreground/90 pl-4 py-2 border-l-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-r px-3 italic" style={{ fontFamily: 'var(--font-serif-body)' }}>
                    {request.handover_instructions}
                  </p>
                </div>
              )}

              {request.handover_tracking && (
                <div className="group/detail space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wider">
                    <Truck className="w-3.5 h-3.5" />
                    Tracking Number
                  </span>
                  <p className="text-sm text-foreground/90 font-mono pl-4 py-2 border-l-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-r px-3 font-semibold tracking-wide">
                    {request.handover_tracking}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Return Details */}
      {showReturnDetails && (
        <div className="group/return relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-amber-100/80 dark:from-amber-950/50 dark:via-orange-950/40 dark:to-amber-900/50 backdrop-blur-sm p-6 border border-amber-200/60 dark:border-amber-800/40 shadow-md hover:shadow-xl transition-all duration-300">
          {/* Decorative glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-500/10 opacity-0 group-hover/return:opacity-100 transition-opacity duration-500" />

          {/* Decorative corner accents */}
          <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full blur-2xl" />
          </div>

          <div className="relative">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-amber-200/50 dark:border-amber-800/30">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Return Details
                </p>
                <p className="text-lg font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2 mt-0.5">
                  {request.return_method === 'ship' && (
                    <>
                      <Truck className="w-4 h-4" />
                      <span>Ship</span>
                    </>
                  )}
                  {request.return_method === 'meetup' && (
                    <>
                      <MapPin className="w-4 h-4" />
                      <span>Meet Up</span>
                    </>
                  )}
                  {request.return_method === 'dropoff' && (
                    <>
                      <MapPin className="w-4 h-4" />
                      <span>Drop Off</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Details grid */}
            <div className="space-y-4">
              {request.return_address && (
                <div className="group/detail space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    {request.return_method === 'ship' ? 'Return Address' :
                     request.return_method === 'meetup' ? 'Meeting Location' :
                     'Drop Off Location'}
                  </span>
                  <p className="text-sm text-foreground/90 pl-4 py-2 border-l-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 rounded-r px-3" style={{ fontFamily: 'var(--font-serif-body)' }}>
                    {request.return_address}
                  </p>
                </div>
              )}

              {request.return_datetime && (
                <div className="group/detail space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    Time
                  </span>
                  <p className="text-sm text-foreground/90 pl-4 py-2 border-l-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 rounded-r px-3">
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
                <div className="group/detail space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Instructions
                  </span>
                  <p className="text-sm text-foreground/90 pl-4 py-2 border-l-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 rounded-r px-3 italic" style={{ fontFamily: 'var(--font-serif-body)' }}>
                    {request.return_instructions}
                  </p>
                </div>
              )}

              {request.return_tracking && (
                <div className="group/detail space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                    <Truck className="w-3.5 h-3.5" />
                    Tracking Number
                  </span>
                  <p className="text-sm text-foreground/90 font-mono pl-4 py-2 border-l-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 rounded-r px-3 font-semibold tracking-wide">
                    {request.return_tracking}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Due Date for Approved Requests */}
      {showDueDate && request.due_date && (
        <div className="flex items-center gap-4 text-sm bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl px-5 py-3.5 border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group/due">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center border border-blue-200/50 dark:border-blue-800/50 group-hover/due:scale-110 transition-transform duration-300">
            <Clock className="w-4 h-4 text-blue-700 dark:text-blue-300" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Due Date</span>
            <span className="font-semibold text-foreground" style={{ fontFamily: 'var(--font-serif-body)' }}>
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
      <div className="flex flex-wrap gap-4 text-xs">
        {request.approved_at && (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/30 dark:border-emerald-800/30">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
            <span className="font-medium text-emerald-700 dark:text-emerald-300">
              Approved {formatDistanceToNow(new Date(request.approved_at), { addSuffix: true })}
            </span>
          </div>
        )}
        {request.returned_at && (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/30 dark:border-blue-800/30">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
            <span className="font-medium text-blue-700 dark:text-blue-300">
              Returned {formatDistanceToNow(new Date(request.returned_at), { addSuffix: true })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
