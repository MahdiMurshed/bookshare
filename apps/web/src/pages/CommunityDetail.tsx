/**
 * CommunityDetail Page - Comprehensive community view
 *
 * Features:
 * - Community header with avatar, name, description, stats
 * - Join/Leave functionality
 * - Tab navigation: Books / Members / Activity / Settings
 * - Conditional settings tab (owner/admin only)
 * - Beautiful gradient header design
 * - Full dark mode support
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import {
  Users,
  BookOpen,
  Activity,
  Settings,
  Lock,
  Globe,
  LogOut,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from '@repo/ui/components/icons';
import { useAuth } from '../contexts/AuthContext';
import { useCommunity } from '../hooks/useCommunities';
import { useJoinCommunity, useLeaveCommunity } from '../hooks/useCommunityMembers';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { CommunityBooksTab } from '../components/Communities/CommunityBooksTab';
import { CommunityMembersTab } from '../components/Communities/CommunityMembersTab';
import { CommunityActivityFeed } from '../components/Communities/CommunityActivityFeed';
import { CommunitySettings } from '../components/Communities/CommunitySettings';

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('books');

  const { data: community, isLoading, error, refetch } = useCommunity(id || '', user?.id);
  const joinCommunityMutation = useJoinCommunity(user?.id);
  const leaveCommunityMutation = useLeaveCommunity(user?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="rounded-full bg-muted p-6 mx-auto w-fit">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold">Community not found</h2>
          <p className="text-muted-foreground">
            The community you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/communities')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Communities
          </Button>
        </div>
      </div>
    );
  }

  const isMember = community.userStatus === 'approved';
  const isPending = community.userStatus === 'pending';
  const isOwnerOrAdmin = community.userRole === 'owner' || community.userRole === 'admin';

  const handleJoinCommunity = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }

    try {
      await joinCommunityMutation.mutateAsync(community.id);
      refetch();
    } catch (error) {
      console.error('Failed to join community:', error);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!user) return;

    if (!confirm('Are you sure you want to leave this community?')) {
      return;
    }

    try {
      await leaveCommunityMutation.mutateAsync(community.id);
      navigate('/communities');
    } catch (error) {
      console.error('Failed to leave community:', error);
      // Show the error message if it's the owner trying to leave
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Community Header */}
      <div className="relative border-b border-border">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),transparent_50%)]" />
        </div>

        <div className="mx-auto relative z-10" style={{ maxWidth: 'var(--container-page)' }}>
          <div className="px-6 py-12">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/communities')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communities
            </Button>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Community Avatar */}
              <div className="relative h-32 w-32 rounded-full border-4 border-background bg-muted overflow-hidden shadow-xl flex-shrink-0">
                <ImageWithFallback
                  src={community.avatar_url || ''}
                  alt={community.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Community Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        {community.name}
                      </h1>
                      <Badge
                        className={`flex items-center gap-1.5 text-xs ${
                          community.is_private
                            ? 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800/40'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-800/40'
                        }`}
                      >
                        {community.is_private ? (
                          <>
                            <Lock className="h-3 w-3" />
                            Private
                          </>
                        ) : (
                          <>
                            <Globe className="h-3 w-3" />
                            Public
                          </>
                        )}
                      </Badge>
                    </div>

                    {community.description && (
                      <p className="text-lg text-muted-foreground max-w-2xl">
                        {community.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-6 pt-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {community.memberCount || 0}{' '}
                          {community.memberCount === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {community.bookCount || 0} {community.bookCount === 1 ? 'book' : 'books'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!isMember && !isPending && (
                      <Button
                        onClick={handleJoinCommunity}
                        disabled={joinCommunityMutation.isPending}
                        size="lg"
                      >
                        {joinCommunityMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          'Join Community'
                        )}
                      </Button>
                    )}

                    {isPending && (
                      <Button variant="secondary" disabled size="lg">
                        Pending Approval
                      </Button>
                    )}

                    {isMember && community.userRole !== 'owner' && (
                      <Button
                        variant="outline"
                        onClick={handleLeaveCommunity}
                        disabled={leaveCommunityMutation.isPending}
                        size="lg"
                      >
                        {leaveCommunityMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Leaving...
                          </>
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-2" />
                            Leave
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Tabs */}
      {isMember ? (
        <div className="mx-auto" style={{ maxWidth: 'var(--container-page)' }}>
          <div className="px-6 py-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
                <TabsTrigger value="books">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Books
                </TabsTrigger>
                <TabsTrigger value="members">
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity
                </TabsTrigger>
                {isOwnerOrAdmin && (
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="books">
                <CommunityBooksTab communityId={community.id} />
              </TabsContent>

              <TabsContent value="members">
                <CommunityMembersTab
                  communityId={community.id}
                  userRole={community.userRole}
                  currentUserId={user?.id}
                />
              </TabsContent>

              <TabsContent value="activity">
                <CommunityActivityFeed communityId={community.id} />
              </TabsContent>

              {isOwnerOrAdmin && (
                <TabsContent value="settings">
                  <CommunitySettings community={community} userId={user?.id} />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="mx-auto" style={{ maxWidth: 'var(--container-page)' }}>
          <div className="px-6 py-12">
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="rounded-full bg-muted p-6 mx-auto w-fit">
                  <Lock className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold">
                  {isPending ? 'Membership Pending' : 'Join to Access'}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {isPending
                    ? 'Your request to join this community is pending approval from the community owner.'
                    : 'You need to be a member of this community to view its content.'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
