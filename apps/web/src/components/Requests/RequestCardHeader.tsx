import { formatDistanceToNow } from 'date-fns';
import type { BorrowRequestWithDetails } from '@repo/api-client';
import { CardHeader } from '@repo/ui/components/card';
import { StatusBadge } from '@repo/ui/components/status-badge';
import type { StatusVariant } from '@repo/ui/components/status-badge';
import { ImageWithFallback } from '../ImageWithFallback';
import { User, Calendar } from '@repo/ui/components/icons';

export interface RequestCardHeaderProps {
  request: BorrowRequestWithDetails;
  view: 'incoming' | 'outgoing';
}

const STATUS_MAP: Record<string, StatusVariant> = {
  pending: 'pending',
  approved: 'approved',
  borrowed: 'borrowed',
  return_initiated: 'warning',
  denied: 'denied',
  returned: 'completed',
};

const STATUS_COLORS: Record<string, { gradient: string; glow: string }> = {
  pending: {
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/30',
  },
  approved: {
    gradient: 'from-emerald-500 to-green-600',
    glow: 'shadow-emerald-500/30',
  },
  borrowed: {
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/30',
  },
  return_initiated: {
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/30',
  },
  denied: {
    gradient: 'from-red-500 to-rose-600',
    glow: 'shadow-red-500/30',
  },
  returned: {
    gradient: 'from-gray-400 to-gray-600',
    glow: 'shadow-gray-500/30',
  },
};

export function RequestCardHeader({ request, view }: RequestCardHeaderProps) {
  const isIncoming = view === 'incoming';
  const otherUser = isIncoming ? request.borrower : request.owner;
  const statusColor = STATUS_COLORS[request.status] || STATUS_COLORS.pending;

  if (!request.book) {
    return null;
  }

  return (
    <CardHeader className="pb-6 bg-gradient-to-b from-muted/20 via-muted/10 to-transparent relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Subtle gradient overlay based on status */}
      <div className={`absolute inset-0 bg-gradient-to-br ${statusColor.gradient} opacity-[0.02] transition-opacity duration-500 group-hover:opacity-[0.04]`} />

      <div className="relative flex items-start gap-6">
        {/* Book Cover with Decorative Frame */}
        <div className="flex-shrink-0 relative group/cover">
          {/* Outer decorative frame */}
          <div className="absolute -inset-2 rounded-xl bg-gradient-to-br from-border/40 via-border/20 to-transparent opacity-60" />

          {/* Glow effect on hover */}
          <div className={`absolute -inset-3 bg-gradient-to-br ${statusColor.gradient} rounded-xl opacity-0 blur-xl transition-all duration-500 group-hover/cover:opacity-20`} />

          {/* Inner golden frame */}
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-amber-400/20 via-orange-300/10 to-amber-500/20 opacity-80" />

          {/* Corner decorations */}
          <div className="absolute -top-1 -left-1 w-4 h-4">
            <div className="absolute inset-0 border-l-2 border-t-2 border-amber-500/40 rounded-tl" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4">
            <div className="absolute inset-0 border-r-2 border-t-2 border-amber-500/40 rounded-tr" />
          </div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4">
            <div className="absolute inset-0 border-l-2 border-b-2 border-amber-500/40 rounded-bl" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4">
            <div className="absolute inset-0 border-r-2 border-b-2 border-amber-500/40 rounded-br" />
          </div>

          {/* Book cover image */}
          <ImageWithFallback
            src={request.book.cover_image_url || ''}
            alt={request.book.title || 'Book cover'}
            className="relative h-40 w-28 rounded-lg object-cover shadow-2xl ring-1 ring-white/20 dark:ring-white/10 group-hover/cover:ring-amber-500/40 transition-all duration-500 group-hover/cover:scale-[1.02] group-hover/cover:shadow-amber-500/20"
          />

          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover/cover:via-white/20 dark:group-hover/cover:via-white/10 transition-all duration-700 -translate-x-full group-hover/cover:translate-x-full" />
        </div>

        {/* Book and User Info */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Title and Status Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-bold text-2xl tracking-tight text-foreground leading-tight mb-2 group-hover:text-amber-900 dark:group-hover:text-amber-100 transition-colors duration-300">
                {request.book.title || 'Unknown Book'}
              </h3>
              <p className="text-base text-muted-foreground/90 font-medium mb-3" style={{ fontFamily: 'var(--font-serif-body)' }}>
                by {request.book.author || 'Unknown Author'}
              </p>
              {request.book.genre && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 text-amber-900 dark:text-amber-100 rounded-lg border border-amber-200/50 dark:border-amber-800/50 shadow-sm">
                  {request.book.genre}
                </span>
              )}
            </div>

            {/* Enhanced Status Badge */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${statusColor.gradient} opacity-20 blur-lg rounded-xl ${statusColor.glow}`} />
                <StatusBadge
                  status={STATUS_MAP[request.status] || 'pending'}
                  label={request.status.replace('_', ' ')}
                  className="relative shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* User and Date Info */}
          <div className="space-y-3">
            {/* User info */}
            <div className="flex items-center gap-3 group/user">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center ring-2 ring-border/50 group-hover/user:ring-amber-500/30 transition-all duration-300">
                <User className="w-4 h-4 text-muted-foreground group-hover/user:text-amber-600 dark:group-hover/user:text-amber-400 transition-colors duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground/70 mb-0.5 uppercase tracking-wider">
                  {isIncoming ? 'Requested by' : 'Owner'}
                </p>
                <p className="text-sm font-semibold text-foreground truncate" style={{ fontFamily: 'var(--font-serif-body)' }}>
                  {otherUser?.name || otherUser?.email || 'Unknown User'}
                </p>
              </div>
            </div>

            {/* Date info */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium">
                Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px">
        <div className={`h-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-${statusColor.gradient.split(' ')[0].replace('from-', '')} to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm`} />
      </div>
    </CardHeader>
  );
}
