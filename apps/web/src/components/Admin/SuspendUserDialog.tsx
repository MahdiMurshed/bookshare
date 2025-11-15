/**
 * SuspendUserDialog Component
 *
 * Dialog for suspending users with a reason input
 * Features clean form with validation and loading states
 */

import { useState } from 'react';
import type { User } from '@repo/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Textarea } from '@repo/ui/components/textarea';
import { Label } from '@repo/ui/components/label';
import { Ban } from 'lucide-react';

export interface SuspendUserDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export function SuspendUserDialog({
  user,
  open,
  onClose,
  onConfirm,
}: SuspendUserDialogProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for suspending this user');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(reason);
      // Reset form on success
      setReason('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suspend user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] border-2">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-destructive/10 p-2 border border-destructive/20">
              <Ban className="w-5 h-5 text-destructive" strokeWidth={2} />
            </div>
            <DialogTitle className="text-xl">Suspend User</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Suspend {user?.name}'s account. They will be unable to access the platform
            until unsuspended.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="suspend-reason" className="font-medium">
              Reason for suspension
            </Label>
            <Textarea
              id="suspend-reason"
              placeholder="Enter the reason for suspending this user..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              className="min-h-[120px] resize-none border-2 focus-visible:ring-2 focus-visible:ring-primary transition-all"
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
          </div>

          {user?.bio && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground mb-1 font-medium">
                User Bio
              </p>
              <p className="text-sm text-foreground">{user.bio}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-2"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className="min-w-[120px]"
          >
            {isLoading ? 'Suspending...' : 'Suspend User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
