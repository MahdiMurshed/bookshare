/**
 * CommunityActivityFeed - Timeline of recent community activities
 *
 * Features:
 * - Beautiful timeline design with activity cards
 * - Different icons and colors for activity types
 * - Relative timestamps ("2 hours ago")
 * - User avatars and names
 * - Loading and empty states
 */

import type { CommunityActivity } from '@repo/api-client';
import { Card } from '@repo/ui/components/card';
import { Loader2, Activity, UserPlus, BookOpen, ArrowLeftRight, Star } from '@repo/ui/components/icons';
import { ImageWithFallback } from '../ImageWithFallback';
import { useCommunityActivity } from '../../hooks/useCommunityActivity';

interface CommunityActivityFeedProps {
  communityId: string;
}

export function CommunityActivityFeed({ communityId }: CommunityActivityFeedProps) {
  const { data: activities = [], isLoading } = useCommunityActivity(communityId);

  const getActivityIcon = (type: CommunityActivity['type']) => {
    switch (type) {
      case 'member_joined':
        return <UserPlus className="h-4 w-4" />;
      case 'book_added':
        return <BookOpen className="h-4 w-4" />;
      case 'borrow_created':
        return <ArrowLeftRight className="h-4 w-4" />;
      case 'borrow_returned':
        return <ArrowLeftRight className="h-4 w-4" />;
      case 'review_posted':
        return <Star className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityIconColor = (type: CommunityActivity['type']) => {
    switch (type) {
      case 'member_joined':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40';
      case 'book_added':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40';
      case 'borrow_created':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40';
      case 'borrow_returned':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40';
      case 'review_posted':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/40';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getActivityMessage = (activity: CommunityActivity) => {
    const userName = activity.user?.name || 'A user';

    switch (activity.type) {
      case 'member_joined':
        return (
          <>
            <span className="font-semibold">{userName}</span> joined the community
          </>
        );
      case 'book_added':
        return (
          <>
            <span className="font-semibold">{userName}</span> added a book to the community
          </>
        );
      case 'borrow_created':
        return (
          <>
            <span className="font-semibold">{userName}</span> borrowed a book from the community
          </>
        );
      case 'borrow_returned':
        return (
          <>
            <span className="font-semibold">{userName}</span> returned a book
          </>
        );
      case 'review_posted':
        return (
          <>
            <span className="font-semibold">{userName}</span> posted a review
          </>
        );
      default:
        return (
          <>
            <span className="font-semibold">{userName}</span> performed an action
          </>
        );
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return activityTime.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-full bg-muted p-6 mb-6">
          <Activity className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No activity yet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          When members join, add books, or interact with the community, activity will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start gap-4">
              {/* Activity Icon */}
              <div
                className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center border ${getActivityIconColor(
                  activity.type
                )}`}
              >
                {getActivityIcon(activity.type)}
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  {/* User Avatar */}
                  <div className="h-6 w-6 rounded-full bg-muted border border-border overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={activity.user?.avatar_url || ''}
                      alt={activity.user?.name || 'User'}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Activity Message */}
                  <p className="text-sm text-foreground flex-1">{getActivityMessage(activity)}</p>
                </div>

                {/* Timestamp */}
                <p className="text-xs text-muted-foreground ml-9">
                  {getRelativeTime(activity.created_at)}
                </p>
              </div>
            </div>

            {/* Timeline Connector - Not on last item */}
            {index < activities.length - 1 && (
              <div className="ml-5 mt-2 mb-0 h-4 w-px bg-border" />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
