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
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';

export interface AddTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTracking: (trackingNumber: string) => void;
  isPending?: boolean;
  bookTitle?: string;
  currentTracking?: string;
}

export function AddTrackingDialog({
  open,
  onOpenChange,
  onAddTracking,
  isPending,
  bookTitle,
  currentTracking,
}: AddTrackingDialogProps) {
  const [trackingNumber, setTrackingNumber] = useState(currentTracking || '');

  const handleAddTracking = () => {
    if (!trackingNumber.trim()) return;
    onAddTracking(trackingNumber.trim());
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setTrackingNumber(currentTracking || '');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentTracking ? 'Update Tracking Number' : 'Add Tracking Number'}
          </DialogTitle>
          <DialogDescription>
            {bookTitle && `For "${bookTitle}"`}
            <br />
            Enter the parcel tracking number for shipment.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tracking">Tracking Number</Label>
            <Input
              id="tracking"
              placeholder="e.g., 1Z999AA10123456784"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              autoFocus
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
            onClick={handleAddTracking}
            disabled={!trackingNumber.trim() || isPending}
          >
            {isPending ? 'Saving...' : currentTracking ? 'Update' : 'Add Tracking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
