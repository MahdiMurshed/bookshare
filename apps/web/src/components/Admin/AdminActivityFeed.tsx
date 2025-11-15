/**
 * AdminActivityFeed Component
 *
 * Clean timeline-style activity feed for the admin dashboard
 * Shows recent actions across the platform with minimal styling
 */

import { useQuery } from '@tanstack/react-query';
import { getRecentActivity } from '@repo/api-client';
import type { ActivityItem } from '@repo/api-client';
import {
  UserPlus,
  BookPlus,
  Send,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { Card } from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';
import { formatDistanceToNow } from 'date-fns';

const activityIcons = {
  user_signup: UserPlus,
  book_added: BookPlus,
  borrow_request: Send,
  request_approved: CheckCircle,
  request_denied: XCircle,
  book_returned: RotateCcw,
};

interface ActivityItemProps {
  activity: ActivityItem;
  isLast: boolean;
}

function ActivityItemComponent({ activity, isLast }: ActivityItemProps) {
  const Icon = activityIcons[activity.type];

  return (
    <div className="flex gap-4 group">
      {/* Timeline line and icon */}
      <div className="relative flex flex-col items-center">
        {/* Icon */}
        <div className="relative z-10 rounded-full bg-muted border-2 border-border p-2 group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" strokeWidth={2} />
        </div>

        {/* Connecting line */}
        {!isLast && (
          <div className="flex-1 w-px bg-border mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="bg-card border rounded-lg p-4 group-hover:bg-muted/50 transition-all duration-300">
          <p className="text-sm text-foreground font-medium mb-1">
            {activity.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="flex-1 w-0.5 bg-border mt-2" />
      </div>
      <div className="flex-1 pb-6">
        <div className="rounded-lg border p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export function AdminActivityFeed() {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: () => getRecentActivity(20),
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
          <p className="text-sm text-muted-foreground mt-1">Live feed of platform events</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">Failed to load activity feed</p>
        </div>
      ) : isLoading || !activities ? (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ActivityItemSkeleton key={i} />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No recent activity</p>
        </div>
      ) : (
        <div className="relative">
          {activities.map((activity, index) => (
            <ActivityItemComponent
              key={activity.id}
              activity={activity}
              isLast={index === activities.length - 1}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
