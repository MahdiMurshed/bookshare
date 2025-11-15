import { useState } from 'react';
import type { ReturnMethod } from '@repo/api-client';
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
import { Input } from '@repo/ui/components/input';

export interface ReturnInitiateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInitiateReturn: (returnMethod: ReturnMethod, returnDetails: {
    address?: string;
    datetime?: string;
    instructions?: string;
    tracking?: string;
  }) => void;
  isPending?: boolean;
  bookTitle?: string;
  ownerName?: string;
}

export function ReturnInitiateDialog({
  open,
  onOpenChange,
  onInitiateReturn,
  isPending,
  bookTitle,
  ownerName,
}: ReturnInitiateDialogProps) {
  const [returnMethod, setReturnMethod] = useState<ReturnMethod>('dropoff');
  const [returnAddress, setReturnAddress] = useState('');
  const [returnDatetime, setReturnDatetime] = useState('');
  const [returnInstructions, setReturnInstructions] = useState('');
  const [returnTracking, setReturnTracking] = useState('');

  const handleInitiateReturn = () => {
    onInitiateReturn(
      returnMethod,
      {
        address: returnAddress.trim() || undefined,
        datetime: returnDatetime.trim() || undefined,
        instructions: returnInstructions.trim() || undefined,
        tracking: returnTracking.trim() || undefined,
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setReturnMethod('dropoff');
      setReturnAddress('');
      setReturnDatetime('');
      setReturnInstructions('');
      setReturnTracking('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Initiate Return</DialogTitle>
          <DialogDescription>
            Set up return details for {bookTitle && `"${bookTitle}"`}
            {ownerName && ` to ${ownerName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Return Method Selection */}
          <div className="grid gap-2">
            <Label>Return Method *</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={returnMethod === 'ship' ? 'default' : 'outline'}
                onClick={() => setReturnMethod('ship')}
                className="flex flex-col h-auto py-3"
              >
                <span className="text-2xl mb-1">📦</span>
                <span className="text-sm">Ship</span>
              </Button>
              <Button
                type="button"
                variant={returnMethod === 'meetup' ? 'default' : 'outline'}
                onClick={() => setReturnMethod('meetup')}
                className="flex flex-col h-auto py-3"
              >
                <span className="text-2xl mb-1">🤝</span>
                <span className="text-sm">Meet Up</span>
              </Button>
              <Button
                type="button"
                variant={returnMethod === 'dropoff' ? 'default' : 'outline'}
                onClick={() => setReturnMethod('dropoff')}
                className="flex flex-col h-auto py-3"
              >
                <span className="text-2xl mb-1">📍</span>
                <span className="text-sm">Drop Off</span>
              </Button>
            </div>
          </div>

          {/* Conditional Return Details */}
          {returnMethod === 'ship' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="return-address">Return Address</Label>
                <Textarea
                  id="return-address"
                  placeholder="Enter owner's address or return address..."
                  value={returnAddress}
                  onChange={(e) => setReturnAddress(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="return-tracking">Tracking Number (Optional)</Label>
                <Input
                  id="return-tracking"
                  placeholder="e.g., 1Z999AA10123456784"
                  value={returnTracking}
                  onChange={(e) => setReturnTracking(e.target.value)}
                />
              </div>
            </>
          )}

          {returnMethod === 'meetup' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="meetup-location">Meeting Location</Label>
                <Input
                  id="meetup-location"
                  placeholder="e.g., Starbucks on Main St"
                  value={returnAddress}
                  onChange={(e) => setReturnAddress(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="meetup-datetime">Meeting Date & Time</Label>
                <Input
                  id="meetup-datetime"
                  type="datetime-local"
                  value={returnDatetime}
                  onChange={(e) => setReturnDatetime(e.target.value)}
                />
              </div>
            </>
          )}

          {returnMethod === 'dropoff' && (
            <div className="grid gap-2">
              <Label htmlFor="dropoff-address">Drop Off Location</Label>
              <Textarea
                id="dropoff-address"
                placeholder="Owner's address or drop off location..."
                value={returnAddress}
                onChange={(e) => setReturnAddress(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Return Instructions */}
          <div className="grid gap-2">
            <Label htmlFor="return-instructions">Return Instructions (Optional)</Label>
            <Textarea
              id="return-instructions"
              placeholder={
                returnMethod === 'ship'
                  ? 'e.g., "Shipped via USPS, expected delivery Friday"'
                  : returnMethod === 'meetup'
                  ? 'e.g., "I\'ll bring the book to our meeting"'
                  : 'e.g., "Will drop off in mailbox, Apt 3B"'
              }
              value={returnInstructions}
              onChange={(e) => setReturnInstructions(e.target.value)}
              rows={2}
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
            onClick={handleInitiateReturn}
            disabled={isPending}
          >
            {isPending ? 'Initiating...' : 'Initiate Return'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
