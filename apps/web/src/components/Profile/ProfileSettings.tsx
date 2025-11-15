/**
 * ProfileSettings Component
 *
 * Account settings including sign out and delete account
 * Includes delete confirmation dialog with error handling
 */

import { useState } from 'react';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Shield, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { logError } from '../../lib/utils/errors';

interface ProfileSettingsProps {
  isDeleting: boolean;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export function ProfileSettings({ isDeleting, onSignOut, onDeleteAccount }: ProfileSettingsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await onSignOut();
    } catch (error) {
      logError(error, 'signing out');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    try {
      await onDeleteAccount();
    } catch (error) {
      logError(error, 'deleting account');
      setDeleteError('Failed to delete account. Please try again.');
    }
  };

  return (
    <>
      <div>
        <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
        <Card className="border-2">
          <div className="divide-y divide-border">
            {/* Change Password */}
            <div className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium">Password</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Change your password to keep your account secure
                </p>
              </div>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>

            {/* Sign Out */}
            <div className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium">Sign Out</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account on this device
                </p>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>

            {/* Delete Account */}
            <div className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-destructive" />
                  <h4 className="font-medium text-destructive">Delete Account</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="outline"
                size="sm"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setDeleteError(null);
        }}
      >
        <DialogContent className="border-2">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <DialogTitle className="text-xl">Delete Account</DialogTitle>
            </div>
            <DialogDescription className="text-base leading-relaxed">
              Are you sure you want to delete your account? This action cannot be undone. All your
              books, borrow requests, and messages will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          {/* Delete Error Message */}
          {deleteError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
