/**
 * Communities Page - Community Discovery & Management
 *
 * Features:
 * - Tab navigation: Discover / My Communities
 * - Search and filter communities
 * - Create new community modal
 * - Community cards grid with join functionality
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Community } from '@repo/api-client';
import { Button } from '@repo/ui/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import { Users, Plus, Search, Loader2, AlertCircle } from '@repo/ui/components/icons';
import { useAuth } from '../contexts/AuthContext';
import { useCommunities, useMyCommunities } from '../hooks/useCommunities';
import { useJoinCommunity } from '../hooks/useCommunityMembers';
import { CommunityCard } from '../components/Communities/CommunityCard';
import { CreateCommunityModal } from '../components/Communities/CreateCommunityModal';

export default function Communities() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joiningCommunityId, setJoiningCommunityId] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: allCommunities = [], isLoading: isLoadingAll, refetch: refetchAll } = useCommunities({
    search: debouncedSearch,
  });

  const { data: myCommunities = [], isLoading: isLoadingMy, refetch: refetchMy } = useMyCommunities(user?.id);

  const joinCommunityMutation = useJoinCommunity(user?.id);

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    setJoiningCommunityId(communityId);
    try {
      await joinCommunityMutation.mutateAsync(communityId);
      refetchAll();
      refetchMy();
    } catch (error) {
      console.error('Failed to join community:', error);
    } finally {
      setJoiningCommunityId(null);
    }
  };

  const handleViewCommunity = (community: Community) => {
    navigate(`/communities/${community.id}`);
  };

  const handleCreateSuccess = () => {
    refetchAll();
    refetchMy();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative border-b border-border">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px),
                               repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px)`,
            }}
          />
        </div>

        <div className="mx-auto relative z-10" style={{ maxWidth: 'var(--container-page)' }}>
          <div className="px-6 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                Communities
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join communities to share books and connect with readers who share your interests
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  size="lg"
                  onClick={() => setCreateModalOpen(true)}
                  className="h-12 px-8 text-base font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Community
                </Button>
              </div>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mt-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search communities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-background border-2 border-border rounded-lg pl-12 pr-4 py-4 text-base outline-none placeholder:text-muted-foreground/60 focus:border-primary transition-colors"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto" style={{ maxWidth: 'var(--container-page)' }}>
        <div className="px-6 py-12">
          <Tabs defaultValue="discover" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="discover" className="text-base">
                <Users className="h-4 w-4 mr-2" />
                Discover
              </TabsTrigger>
              <TabsTrigger value="my-communities" className="text-base">
                <Users className="h-4 w-4 mr-2" />
                My Communities
              </TabsTrigger>
            </TabsList>

            {/* Discover Tab */}
            <TabsContent value="discover" className="space-y-8">
              {isLoadingAll ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : allCommunities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="rounded-full bg-muted p-6 mb-6">
                    <Users className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No communities found</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    {searchQuery
                      ? 'No communities match your search. Try a different query or create a new community.'
                      : 'Be the first to create a community and start sharing books!'}
                  </p>
                  <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Community
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-muted-foreground">
                      {allCommunities.length} {allCommunities.length === 1 ? 'community' : 'communities'} found
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allCommunities.map((community) => (
                      <CommunityCard
                        key={community.id}
                        community={community}
                        onJoin={handleJoinCommunity}
                        onView={handleViewCommunity}
                        isJoining={joiningCommunityId === community.id}
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* My Communities Tab */}
            <TabsContent value="my-communities" className="space-y-8">
              {!user ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="rounded-full bg-muted p-6 mb-6">
                    <AlertCircle className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Sign in required</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    You need to be signed in to view your communities.
                  </p>
                  <Button onClick={() => navigate('/signin')}>Sign In</Button>
                </div>
              ) : isLoadingMy ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : myCommunities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="rounded-full bg-muted p-6 mb-6">
                    <Users className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No communities yet</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    You haven't joined any communities yet. Discover communities or create your own!
                  </p>
                  <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Community
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-muted-foreground">
                      You're a member of {myCommunities.length}{' '}
                      {myCommunities.length === 1 ? 'community' : 'communities'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCommunities.map((community) => (
                      <CommunityCard
                        key={community.id}
                        community={community}
                        onView={handleViewCommunity}
                        isJoining={false}
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Community Modal */}
      <CreateCommunityModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleCreateSuccess}
        userId={user?.id}
      />
    </div>
  );
}
