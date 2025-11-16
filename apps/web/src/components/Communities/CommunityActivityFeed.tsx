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
import {
  Loader2,
  Activity,
  UserPlus,
  UserMinus,
  UserX,
  Shield,
  UserCheck,
  UserCog,
  BookOpen,
  BookX,
  Send,
  CheckCircle,
  XCircle,
  Circle,
  Edit,
  Trash2,
  ArrowLeftRight,
  Star,
  Crown,
} from '@repo/ui/components/icons';
import { ImageWithFallback } from '../ImageWithFallback';
import { useCommunityActivity } from '../../hooks/useCommunityActivity';

interface CommunityActivityFeedProps {
  communityId: string;
}

export function CommunityActivityFeed({ communityId }: CommunityActivityFeedProps) {
  const { data: activities = [], isLoading } = useCommunityActivity(communityId);

  const getActivityIcon = (type: CommunityActivity['type']) => {
    switch (type) {
      // Member activities
      case 'member_joined':
        return <UserPlus className="h-4 w-4" />;
      case 'member_left':
        return <UserMinus className="h-4 w-4" />;
      case 'member_removed':
        return <UserX className="h-4 w-4" />;
      case 'member_role_changed':
        return <UserCog className="h-4 w-4" />;
      case 'join_request_created':
        return <Shield className="h-4 w-4" />;
      case 'join_request_approved':
        return <UserCheck className="h-4 w-4" />;
      case 'join_request_denied':
        return <UserX className="h-4 w-4" />;
      // Invitation activities
      case 'user_invited':
        return <Send className="h-4 w-4" />;
      case 'invitation_accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'invitation_rejected':
        return <XCircle className="h-4 w-4" />;
      case 'invitation_cancelled':
        return <Circle className="h-4 w-4" />;
      // Book activities
      case 'book_added':
        return <BookOpen className="h-4 w-4" />;
      case 'book_removed':
        return <BookX className="h-4 w-4" />;
      // Community lifecycle
      case 'community_created':
        return <Circle className="h-4 w-4" />;
      case 'community_updated':
        return <Edit className="h-4 w-4" />;
      case 'community_deleted':
        return <Trash2 className="h-4 w-4" />;
      case 'ownership_transferred':
        return <Crown className="h-4 w-4" />;
      // Legacy types
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
      // Member activities - Green shades
      case 'member_joined':
      case 'join_request_approved':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40';
      case 'member_left':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-800/40';
      case 'member_removed':
      case 'join_request_denied':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40';
      case 'member_role_changed':
      case 'ownership_transferred':
        return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/40';
      case 'join_request_created':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800/40';
      // Invitation activities - Blue/Cyan shades
      case 'user_invited':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800/40';
      case 'invitation_accepted':
        return 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800/40';
      case 'invitation_rejected':
      case 'invitation_cancelled':
        return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40';
      // Book activities - Blue shades
      case 'book_added':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40';
      case 'book_removed':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/40';
      // Community lifecycle - Purple/Pink shades
      case 'community_created':
        return 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/30 dark:text-fuchsia-400 dark:border-fuchsia-800/40';
      case 'community_updated':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800/40';
      case 'community_deleted':
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800/40';
      // Legacy types
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
    const metadata = activity.metadata || {};

    switch (activity.type) {
      // Member activities
      case 'member_joined':
        return (
          <>
            <span className="font-semibold">{userName}</span> joined the community
            {metadata.role && metadata.role !== 'member' && (
              <span className="text-muted-foreground"> as {metadata.role}</span>
            )}
          </>
        );
      case 'member_left':
        return (
          <>
            <span className="font-semibold">{userName}</span> left the community
          </>
        );
      case 'member_removed':
        return (
          <>
            <span className="font-semibold">{userName}</span> was removed from the community
          </>
        );
      case 'member_role_changed':
        return (
          <>
            <span className="font-semibold">{userName}</span> was promoted from{' '}
            <span className="font-medium">{metadata.old_role}</span> to{' '}
            <span className="font-medium">{metadata.new_role}</span>
          </>
        );
      case 'join_request_created':
        return (
          <>
            <span className="font-semibold">{userName}</span> requested to join
          </>
        );
      case 'join_request_approved':
        return (
          <>
            <span className="font-semibold">{userName}</span>'s request to join was approved
          </>
        );
      case 'join_request_denied':
        return (
          <>
            <span className="font-semibold">{userName}</span>'s request to join was denied
          </>
        );
      // Invitation activities
      case 'user_invited':
        return (
          <>
            <span className="font-semibold">{userName}</span> invited a user to join
          </>
        );
      case 'invitation_accepted':
        return (
          <>
            <span className="font-semibold">{userName}</span> accepted an invitation
          </>
        );
      case 'invitation_rejected':
        return (
          <>
            <span className="font-semibold">{userName}</span> rejected an invitation
          </>
        );
      case 'invitation_cancelled':
        return (
          <>
            <span className="font-semibold">{userName}</span> cancelled an invitation
          </>
        );
      // Book activities
      case 'book_added':
        return (
          <>
            <span className="font-semibold">{userName}</span> added a book to the community
          </>
        );
      case 'book_removed':
        return (
          <>
            <span className="font-semibold">{userName}</span> removed a book from the community
          </>
        );
      // Community lifecycle
      case 'community_created':
        return (
          <>
            <span className="font-semibold">{userName}</span> created this community
          </>
        );
      case 'community_updated':
        const changes = [];
        if (metadata.name_changed) changes.push('name');
        if (metadata.description_changed) changes.push('description');
        if (metadata.privacy_changed) changes.push('privacy settings');
        if (metadata.location_changed) changes.push('location');

        return (
          <>
            <span className="font-semibold">{userName}</span> updated the community
            {changes.length > 0 && (
              <span className="text-muted-foreground">
                {' '}({changes.join(', ')})
              </span>
            )}
          </>
        );
      case 'community_deleted':
        return (
          <>
            <span className="font-semibold">{userName}</span> deleted the community
          </>
        );
      case 'ownership_transferred':
        return (
          <>
            <span className="font-semibold">{userName}</span> became the new owner
          </>
        );
      // Legacy types
      case 'borrow_created':
        return (
          <>
            <span className="font-semibold">{userName}</span> borrowed a book
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
