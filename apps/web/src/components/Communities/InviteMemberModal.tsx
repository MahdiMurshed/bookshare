/**
 * InviteMemberModal - Modal for inviting users to a community
 *
 * Features:
 * - Search users by name or email
 * - Shows search results with user info
 * - Shows user's existing status (member, pending, invited)
 * - Prevents duplicate invitations
 * - Loading states and error handling
 */

import { useState, useEffect } from 'react';
import type { User, Community } from '@repo/api-client';
import { searchUsers } from '@repo/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Loader2, Search, UserPlus, Users, Check } from '@repo/ui/components/icons';
import { Badge } from '@repo/ui/components/badge';
import { ImageWithFallback } from '../ImageWithFallback';
import { useInviteUser } from '../../hooks/useCommunityInvitations';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: Community;
  existingMemberIds: string[];
  pendingInvitationIds: string[];
  onSuccess: () => void;
}

export function InviteMemberModal({
  open,
  onOpenChange,
  community,
  existingMemberIds,
  pendingInvitationIds,
  onSuccess,
}: InviteMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const inviteUserMutation = useInviteUser();

  // Search users with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Failed to search users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleInvite = async (user: User) => {
    try {
      await inviteUserMutation.mutateAsync({
        communityId: community.id,
        inviteeId: user.id,
      });

      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      onSuccess();
    } catch (error) {
      console.error('Failed to invite user:', error);
    }
  };

  const isAlreadyMember = (userId: string) => existingMemberIds.includes(userId);
  const hasInvitation = (userId: string) => pendingInvitationIds.includes(userId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Invite Members to {community.name}</DialogTitle>
          <DialogDescription>
            Search for users by name or email to invite them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px]">
            {searchQuery.length < 2 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Type at least 2 characters to search for users
                </p>
              </div>
            ) : searchResults.length === 0 && !isSearching ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            ) : (
              searchResults.map((user) => {
                const isMember = isAlreadyMember(user.id);
                const invited = hasInvitation(user.id);

                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted border border-border overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={user.avatar_url || ''}
                        alt={user.name || user.email}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {user.name || 'No name'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>

                    {isMember ? (
                      <Badge variant="secondary" className="flex-shrink-0">
                        <Check className="h-3 w-3 mr-1" />
                        Member
                      </Badge>
                    ) : invited ? (
                      <Badge variant="outline" className="flex-shrink-0">
                        Invited
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleInvite(user)}
                        disabled={inviteUserMutation.isPending}
                      >
                        {inviteUserMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Invite
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Info Box */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Invited users will receive a notification and must approve before joining.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {inviteUserMutation.isError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-md">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {inviteUserMutation.error instanceof Error
                ? inviteUserMutation.error.message
                : 'Failed to send invitation. Please try again.'}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              onOpenChange(false);
            }}
            disabled={inviteUserMutation.isPending}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
