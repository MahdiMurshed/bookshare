/**
 * AdminReturnDialog Component
 *
 * Dialog for admins to force mark a book as returned
 * Requires confirmation checkbox to prevent accidental force returns
 * Features clean monochrome design with warning about forced action
 */

import { useState } from 'react';
import type { BorrowRequestWithDetails } from '@repo/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Checkbox } from '@repo/ui/components/checkbox';
import { Label } from '@repo/ui/components/label';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar';
import { Alert, AlertDescription } from '@repo/ui/components/alert';
import { Package, AlertTriangle, User, Calendar } from 'lucide-react';

export interface AdminReturnDialogProps {
  request: BorrowRequestWithDetails | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function AdminReturnDialog({
  request,
  open,
  onClose,
  onConfirm,
}: AdminReturnDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!confirmed) {
      setError('Please confirm that the book has been returned');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onConfirm();
      // Reset form on success
      setConfirmed(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark book as returned');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setConfirmed(false);
      setError(null);
      onClose();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = request?.due_date && new Date(request.due_date) < new Date();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] border-2 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
              <Package className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <DialogTitle className="text-xl">Mark Book as Returned</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Force mark this book as returned. This action will complete the borrow request
            and make the book available again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Warning Alert */}
          <Alert className="border-primary/20 bg-primary/5">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm text-muted-foreground">
              This is a forced return action that bypasses the normal return process. Use
              this only if you've confirmed the book has been physically returned.
            </AlertDescription>
          </Alert>

          {/* Request Details */}
          {request && (
            <div className="space-y-4">
              {/* Book Info */}
              <div className="rounded-lg border-2 bg-muted/20 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Book
                </p>
                <div className="flex items-start gap-3">
                  {request.book?.cover_image_url && (
                    <img
                      src={request.book.cover_image_url}
                      alt={request.book.title}
                      className="w-12 h-16 object-cover rounded border"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {request.book?.title}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      by {request.book?.author}
                    </p>
                  </div>
                </div>
              </div>

              {/* Borrower Info */}
              <div className="rounded-lg border-2 bg-muted/20 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Borrower
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={request.borrower?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {request.borrower?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {request.borrower?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {request.borrower?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Due Date Info */}
              <div className="rounded-lg border-2 bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Due Date
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-base font-semibold text-foreground">
                    {formatDate(request.due_date)}
                  </p>
                  {isOverdue && (
                    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive border border-destructive/20">
                      Overdue
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="rounded-lg border-2 bg-accent/50 p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="confirm-return"
                checked={confirmed}
                onCheckedChange={(checked) => {
                  setConfirmed(checked === true);
                  setError(null);
                }}
                disabled={isLoading}
                className="mt-0.5 border-2"
              />
              <div className="flex-1">
                <Label
                  htmlFor="confirm-return"
                  className="text-sm font-medium text-foreground cursor-pointer leading-relaxed"
                >
                  I confirm this book has been physically returned to the owner
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  This action cannot be easily undone and will mark the request as completed.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive font-medium">{error}</p>
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
            variant="default"
            onClick={handleConfirm}
            disabled={isLoading || !confirmed}
            className="min-w-[140px] bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Processing...' : 'Mark as Returned'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
