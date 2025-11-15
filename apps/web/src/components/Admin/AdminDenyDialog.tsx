/**
 * AdminDenyDialog Component
 *
 * Dialog for admins to override and deny a borrow request
 * Includes quick-select reason chips and custom reason textarea
 * Features clean monochrome design with warning about override action
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
import { Textarea } from '@repo/ui/components/textarea';
import { Label } from '@repo/ui/components/label';
import { Badge } from '@repo/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar';
import { Alert, AlertDescription } from '@repo/ui/components/alert';
import { XCircle, AlertTriangle, User } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

export interface AdminDenyDialogProps {
  request: BorrowRequestWithDetails | null;
  open: boolean;
  onClose: () => void;
  onDeny: (reason: string) => Promise<void>;
}

const COMMON_DENY_REASONS = [
  'Policy Violation',
  'Inappropriate Request',
  'User Suspended',
  'Book Issue',
  'Other',
] as const;

export function AdminDenyDialog({
  request,
  open,
  onClose,
  onDeny,
}: AdminDenyDialogProps) {
  const [reason, setReason] = useState('');
  const [selectedQuickReason, setSelectedQuickReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickReasonSelect = (quickReason: string) => {
    if (selectedQuickReason === quickReason) {
      // Deselect if clicking the same one
      setSelectedQuickReason(null);
      setReason('');
    } else {
      setSelectedQuickReason(quickReason);
      setReason(quickReason === 'Other' ? '' : quickReason);
    }
    setError(null);
  };

  const handleReasonChange = (value: string) => {
    setReason(value);
    // Clear quick reason selection if user types custom text
    if (selectedQuickReason && value !== selectedQuickReason) {
      setSelectedQuickReason(null);
    }
    setError(null);
  };

  const handleDeny = async () => {
    const finalReason = reason.trim();

    if (!finalReason) {
      setError('Please provide a reason for denying this request');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onDeny(finalReason);
      // Reset form on success
      setReason('');
      setSelectedQuickReason(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deny request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      setSelectedQuickReason(null);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] border-2 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-destructive/10 p-2 border border-destructive/20">
              <XCircle className="w-5 h-5 text-destructive" strokeWidth={2} />
            </div>
            <DialogTitle className="text-xl">Admin Deny Request</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Override the owner's decision and deny this borrow request. Provide a clear
            reason for the denial.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Warning Alert */}
          <Alert className="border-primary/20 bg-primary/5">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm text-muted-foreground">
              This is an admin override action that bypasses the owner's approval process.
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

              {/* Borrower and Owner Info */}
              <div className="grid grid-cols-2 gap-3">
                {/* Borrower */}
                <div className="rounded-lg border-2 bg-muted/20 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Borrower
                  </p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={request.borrower?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {request.borrower?.name?.[0]?.toUpperCase() || <User className="h-3 w-3" />}
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

                {/* Owner */}
                <div className="rounded-lg border-2 bg-muted/20 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Owner
                  </p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={request.owner?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {request.owner?.name?.[0]?.toUpperCase() || <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {request.owner?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {request.owner?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Select Reasons */}
          <div className="space-y-2">
            <Label className="font-medium">Quick Select Reason</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_DENY_REASONS.map((quickReason) => (
                <Badge
                  key={quickReason}
                  variant={selectedQuickReason === quickReason ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all border-2 px-3 py-1.5',
                    selectedQuickReason === quickReason
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'hover:bg-accent hover:border-primary/50'
                  )}
                  onClick={() => handleQuickReasonSelect(quickReason)}
                >
                  {quickReason}
                </Badge>
              ))}
            </div>
          </div>

          {/* Reason Textarea */}
          <div className="space-y-2">
            <Label htmlFor="deny-reason" className="font-medium">
              Reason for Denial <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="deny-reason"
              placeholder="Enter the reason for denying this request..."
              value={reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              className="min-h-[120px] resize-none border-2 focus-visible:ring-2 focus-visible:ring-primary transition-all"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              This reason will be shared with the borrower and owner.
            </p>
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
            variant="destructive"
            onClick={handleDeny}
            disabled={isLoading || !reason.trim()}
            className="min-w-[120px]"
          >
            {isLoading ? 'Denying...' : 'Deny Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
