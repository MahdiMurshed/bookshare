/**
 * UserActivityDialog Component
 *
 * Dialog showing user activity history in a timeline format
 * Features loading skeleton, empty state, and beautiful timeline design
 */

import type { User, UserActivityLog } from '@repo/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Skeleton } from '@repo/ui/components/skeleton';
import {
  Activity,
  BookOpen,
  MessageSquare,
  UserPlus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

export interface UserActivityDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  activities: UserActivityLog[];
  isLoading: boolean;
}

// Map action types to icons and colors
const getActivityIcon = (actionType: string) => {
  switch (actionType) {
    case 'book_added':
      return { icon: BookOpen, color: 'text-primary' };
    case 'borrow_request':
      return { icon: MessageSquare, color: 'text-blue-500' };
    case 'user_signup':
      return { icon: UserPlus, color: 'text-green-500' };
    case 'profile_updated':
      return { icon: Edit3, color: 'text-amber-500' };
    case 'book_deleted':
      return { icon: Trash2, color: 'text-destructive' };
    case 'request_approved':
      return { icon: CheckCircle2, color: 'text-green-500' };
    case 'request_denied':
      return { icon: XCircle, color: 'text-destructive' };
    default:
      return { icon: Activity, color: 'text-muted-foreground' };
  }
};

function ActivitySkeleton() {
  return (
    <div className="flex gap-4 pb-6 last:pb-0">
      <div className="relative">
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
        <Clock className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground font-medium">No activity history</p>
      <p className="text-sm text-muted-foreground mt-1">
        This user hasn't performed any actions yet
      </p>
    </div>
  );
}

export function UserActivityDialog({
  user,
  open,
  onClose,
  activities,
  isLoading,
}: UserActivityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] border-2">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
              <Activity className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <DialogTitle className="text-xl">User Activity History</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Recent activity for {user?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 max-h-[calc(80vh-200px)] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <ActivitySkeleton key={i} />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-border" />

              {/* Activity items */}
              <div className="space-y-6">
                {activities.map((activity, index) => {
                  const { icon: Icon, color } = getActivityIcon(activity.action_type);
                  const isLast = index === activities.length - 1;

                  return (
                    <div key={activity.id} className="flex gap-4 relative">
                      {/* Icon */}
                      <div
                        className={`relative z-10 rounded-lg bg-background border-2 border-border p-2 flex items-center justify-center ${!isLast ? '' : 'border-primary/20 bg-primary/5'}`}
                      >
                        <Icon className={`w-5 h-5 ${color}`} strokeWidth={2} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <p className="text-sm font-medium text-foreground leading-relaxed">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(activity.created_at), 'MMM d, yyyy - h:mm a')}
                        </p>

                        {/* Metadata */}
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3">
                            <dl className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <div key={key}>
                                  <dt className="text-muted-foreground font-medium capitalize">
                                    {key.replace(/_/g, ' ')}
                                  </dt>
                                  <dd className="text-foreground font-medium mt-0.5">
                                    {String(value)}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {!isLoading && activities.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Showing {activities.length} recent activit{activities.length === 1 ? 'y' : 'ies'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
