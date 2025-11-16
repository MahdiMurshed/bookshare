/**
 * CommunityMembersTab - Display and manage community members
 *
 * Features:
 * - List of members with avatars, names, and roles
 * - Role management (promote/demote) for owners/admins
 * - Remove member functionality for owners/admins
 * - Pending join requests with approve/deny buttons
 * - Beautiful member cards with role badges
 */

import type { CommunityMember } from '@repo/api-client';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Loader2, Users, UserCheck, UserX, ShieldCheck, Shield, User as UserIcon } from '@repo/ui/components/icons';
import { ImageWithFallback } from '../ImageWithFallback';
import {
  useCommunityMembers,
  usePendingJoinRequests,
  useApproveMember,
  useUpdateMemberRole,
  useRemoveMember,
} from '../../hooks/useCommunityMembers';

interface CommunityMembersTabProps {
  communityId: string;
  userRole?: 'owner' | 'admin' | 'member';
  currentUserId?: string;
}

export function CommunityMembersTab({ communityId, userRole, currentUserId }: CommunityMembersTabProps) {
  const { data: members = [], isLoading: isLoadingMembers, refetch: refetchMembers } = useCommunityMembers(communityId);
  const { data: pendingRequests = [], isLoading: isLoadingPending, refetch: refetchPending } = usePendingJoinRequests(communityId);

  const approveMemberMutation = useApproveMember();
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();

  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';

  const handleApproveMember = async (userId: string) => {
    try {
      await approveMemberMutation.mutateAsync({ communityId, userId });
      refetchMembers();
      refetchPending();
    } catch (error) {
      console.error('Failed to approve member:', error);
    }
  };

  const handleDenyMember = async (userId: string) => {
    try {
      await removeMemberMutation.mutateAsync({ communityId, userId });
      refetchPending();
    } catch (error) {
      console.error('Failed to deny member:', error);
    }
  };

  const handlePromoteMember = async (userId: string) => {
    try {
      await updateRoleMutation.mutateAsync({ communityId, userId, role: 'admin' });
      refetchMembers();
    } catch (error) {
      console.error('Failed to promote member:', error);
    }
  };

  const handleDemoteMember = async (userId: string) => {
    try {
      await updateRoleMutation.mutateAsync({ communityId, userId, role: 'member' });
      refetchMembers();
    } catch (error) {
      console.error('Failed to demote member:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the community?')) {
      return;
    }

    try {
      await removeMemberMutation.mutateAsync({ communityId, userId });
      refetchMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <ShieldCheck className="h-3.5 w-3.5" />;
      case 'admin':
        return <Shield className="h-3.5 w-3.5" />;
      default:
        return <UserIcon className="h-3.5 w-3.5" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/30 dark:text-purple-200 dark:border-purple-800/40';
      case 'admin':
        return 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-800/40';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (isLoadingMembers && isLoadingPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Join Requests - Only visible to owners/admins */}
      {isOwnerOrAdmin && pendingRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Pending Requests</h3>
            <Badge variant="secondary" className="ml-2">
              {pendingRequests.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-muted border border-border overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={request.user?.avatar_url || ''}
                      alt={request.user?.name || 'User'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{request.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{request.user?.email}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleApproveMember(request.user_id)}
                    disabled={approveMemberMutation.isPending}
                  >
                    <UserCheck className="h-3.5 w-3.5 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDenyMember(request.user_id)}
                    disabled={removeMemberMutation.isPending}
                  >
                    <UserX className="h-3.5 w-3.5 mr-1" />
                    Deny
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Members</h3>
          <Badge variant="secondary" className="ml-2">
            {members.length}
          </Badge>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-full bg-muted p-6 mb-6">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No members yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              This community doesn't have any members yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => {
              const isCurrentUser = member.user_id === currentUserId;
              const canManage = isOwnerOrAdmin && !isCurrentUser && member.role !== 'owner';

              return (
                <Card key={member.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted border border-border overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={member.user?.avatar_url || ''}
                        alt={member.user?.name || 'User'}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{member.user?.name}</p>
                        {isCurrentUser && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {member.user?.email}
                      </p>

                      <Badge className={`text-[10px] px-2 py-0.5 ${getRoleBadgeClass(member.role)}`}>
                        <span className="mr-1">{getRoleIcon(member.role)}</span>
                        {member.role}
                      </Badge>

                      {/* Management Actions */}
                      {canManage && (
                        <div className="flex gap-1 mt-3">
                          {member.role === 'member' && userRole === 'owner' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs flex-1"
                              onClick={() => handlePromoteMember(member.user_id)}
                              disabled={updateRoleMutation.isPending}
                            >
                              Promote
                            </Button>
                          )}
                          {member.role === 'admin' && userRole === 'owner' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs flex-1"
                              onClick={() => handleDemoteMember(member.user_id)}
                              disabled={updateRoleMutation.isPending}
                            >
                              Demote
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => handleRemoveMember(member.user_id)}
                            disabled={removeMemberMutation.isPending}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
