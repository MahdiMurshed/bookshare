/**
 * AdminApproveDialog Component
 *
 * Dialog for admins to override and approve a borrow request
 * Includes date picker for due date, optional message, and user details
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
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/popover';
import { Calendar } from '@repo/ui/components/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar';
import { Alert, AlertDescription } from '@repo/ui/components/alert';
import { CheckCircle, AlertTriangle, Calendar as CalendarIcon, User } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

export interface AdminApproveDialogProps {
  request: BorrowRequestWithDetails | null;
  open: boolean;
  onClose: () => void;
  onApprove: (dueDate: string, message?: string) => Promise<void>;
}

export function AdminApproveDialog({
  request,
  open,
  onClose,
  onApprove,
}: AdminApproveDialogProps) {
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!dueDate) {
      setError('Please select a due date');
      return;
    }

    // Ensure due date is in the future
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dueDate < tomorrow) {
      setError('Due date must be at least tomorrow');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onApprove(dueDate.toISOString(), message || undefined);
      // Reset form on success
      setDueDate(undefined);
      setMessage('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setDueDate(undefined);
      setMessage('');
      setError(null);
      onClose();
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] border-2 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
              <CheckCircle className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <DialogTitle className="text-xl">Admin Approve Request</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Override the owner's decision and approve this borrow request. Set a due date
            and optionally add a message.
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

          {/* Due Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="due-date" className="font-medium">
              Due Date <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="due-date"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal border-2',
                    !dueDate && 'text-muted-foreground'
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? (
                    dueDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  ) : (
                    <span>Select due date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-2" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date <= today;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Optional Message */}
          <div className="space-y-2">
            <Label htmlFor="approve-message" className="font-medium">
              Message (Optional)
            </Label>
            <Textarea
              id="approve-message"
              placeholder="Add an optional message for the borrower and owner..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] resize-none border-2 focus-visible:ring-2 focus-visible:ring-primary transition-all"
              disabled={isLoading}
            />
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
            onClick={handleApprove}
            disabled={isLoading || !dueDate}
            className="min-w-[120px] bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Approving...' : 'Approve Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
