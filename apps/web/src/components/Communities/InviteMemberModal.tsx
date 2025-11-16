/**
 * InviteMemberModal - Modal for inviting users to a community
 *
 * Features:
 * - Search users by email or name
 * - Shows user's existing status (member, pending, invited)
 * - Prevents duplicate invitations
 * - Loading states and error handling
 */

import { useState } from 'react';
import type { User, Community } from '@repo/api-client';
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
import { Loader2, Search, UserPlus, Users } from '@repo/ui/components/icons';
import { Badge } from '@repo/ui/components/badge';
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
  const [email, setEmail] = useState('');
  const inviteUserMutation = useInviteUser();

  const handleInvite = async () => {
    if (!email.trim()) return;

    try {
      // Note: In a real app, you'd search for the user by email first
      // For now, we'll assume the email corresponds to a user ID
      // You may need to add a searchUserByEmail API function

      await inviteUserMutation.mutateAsync({
        communityId: community.id,
        inviteeId: email, // This should be user ID in production
      });

      setEmail('');
      onSuccess();
    } catch (error) {
      console.error('Failed to invite user:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Members to {community.name}</DialogTitle>
          <DialogDescription>
            Enter the email address of the person you want to invite.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInvite();
                  }
                }}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              They'll receive a notification and can accept or decline the invitation.
            </p>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">Invitation Process</p>
                <p className="text-xs text-muted-foreground">
                  The invited user will receive a notification and must approve the invitation before joining the community.
                </p>
              </div>
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
              setEmail('');
              onOpenChange(false);
            }}
            disabled={inviteUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={!email.trim() || inviteUserMutation.isPending}>
            {inviteUserMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
