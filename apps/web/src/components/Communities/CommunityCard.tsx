/**
 * CommunityCard Component - Premium Community Display Card
 *
 * Features:
 * - Refined minimal design with professional polish
 * - Sophisticated hover effects with coordinated transitions
 * - Privacy badge indicator
 * - Member and book count display
 * - Impeccable spacing and typography hierarchy
 * - Full dark mode support
 */

import type { Community } from '@repo/api-client';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Users, BookOpen, Lock, Globe } from '@repo/ui/components/icons';
import { ImageWithFallback } from '../ImageWithFallback';

interface CommunityCardProps {
  community: Community;
  onJoin?: (communityId: string) => void;
  onView: (community: Community) => void;
  isJoining?: boolean;
}

export function CommunityCard({ community, onJoin, onView, isJoining }: CommunityCardProps) {
  const isMember = community.userStatus === 'approved';
  const isPending = community.userStatus === 'pending';

  return (
    <Card
      className="group relative overflow-hidden border border-border bg-background transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1"
    >
      {/* Header Section with Avatar */}
      <div className="relative h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent_50%)]" />

        {/* Avatar positioned at bottom center, overlapping the border */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
          <div className="relative h-20 w-20 rounded-full border-4 border-background bg-muted overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
            <ImageWithFallback
              src={community.avatar_url || ''}
              alt={community.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Privacy Badge */}
        <div className="absolute right-3 top-3 z-10">
          <Badge
            className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 ${
              community.is_private
                ? 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800/40'
                : 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-800/40'
            }`}
          >
            {community.is_private ? (
              <>
                <Lock className="h-2.5 w-2.5" />
                Private
              </>
            ) : (
              <>
                <Globe className="h-2.5 w-2.5" />
                Public
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Community Info Section */}
      <div className="p-5 pt-14 space-y-4">
        {/* Name & Description */}
        <div className="space-y-2 text-center">
          <h3 className="font-semibold text-lg leading-snug text-foreground tracking-tight">
            {community.name}
          </h3>
          {community.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {community.description}
            </p>
          )}
        </div>

        {/* Stats Section */}
        <div className="flex items-center justify-center gap-6 py-3">
          {/* Members Count */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 border border-primary/20">
              <Users className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">
                {community.memberCount || 0}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {community.memberCount === 1 ? 'Member' : 'Members'}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-border" />

          {/* Books Count */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 border border-primary/20">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">
                {community.bookCount || 0}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {community.bookCount === 1 ? 'Book' : 'Books'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 h-9 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onView(community);
            }}
          >
            View Details
          </Button>

          {!isMember && !isPending && onJoin && (
            <Button
              className="flex-1 h-9 text-sm font-medium"
              onClick={(e) => {
                e.stopPropagation();
                onJoin(community.id);
              }}
              disabled={isJoining}
            >
              {isJoining ? 'Joining...' : 'Join'}
            </Button>
          )}

          {isPending && (
            <Button
              variant="secondary"
              className="flex-1 h-9 text-sm font-medium cursor-not-allowed"
              disabled
            >
              Pending Approval
            </Button>
          )}

          {isMember && (
            <Badge className="flex-1 h-9 flex items-center justify-center bg-primary/10 text-primary border-primary/20 text-sm font-medium">
              Member
            </Badge>
          )}
        </div>
      </div>

      {/* Subtle Hover Accent - Top Border Highlight */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
