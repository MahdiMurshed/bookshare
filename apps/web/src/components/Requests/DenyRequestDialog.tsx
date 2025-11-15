import { useState } from 'react';
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

export interface DenyRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeny: (message?: string) => void;
  isPending?: boolean;
  bookTitle?: string;
  borrowerName?: string;
}

export function DenyRequestDialog({
  open,
  onOpenChange,
  onDeny,
  isPending,
  bookTitle,
  borrowerName,
}: DenyRequestDialogProps) {
  const [message, setMessage] = useState('');

  const handleDeny = () => {
    onDeny(message.trim() || undefined);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setMessage('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deny Borrow Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to deny the request for{' '}
            {bookTitle && `"${bookTitle}"`}
            {borrowerName && ` from ${borrowerName}`}? You can optionally provide a
            reason.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Optional Message */}
          <div className="grid gap-2">
            <Label htmlFor="message">Reason (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Let them know why you're denying the request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeny}
            disabled={isPending}
          >
            {isPending ? 'Denying...' : 'Deny Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
