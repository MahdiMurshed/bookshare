import { useState } from 'react';
import { format, addWeeks } from 'date-fns';
import type { HandoverMethod } from '@repo/api-client';
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
import { Calendar } from '@repo/ui/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/popover';
import { cn } from '@repo/ui/lib/utils';

export interface ApproveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (dueDate: string, handoverMethod: HandoverMethod, handoverDetails: {
    address?: string;
    datetime?: string;
    instructions?: string;
  }, message?: string) => void;
  isPending?: boolean;
  bookTitle?: string;
  borrowerName?: string;
}

export function ApproveRequestDialog({
  open,
  onOpenChange,
  onApprove,
  isPending,
  bookTitle,
  borrowerName,
}: ApproveRequestDialogProps) {
  const [dueDate, setDueDate] = useState<Date | undefined>(addWeeks(new Date(), 2));
  const [handoverMethod, setHandoverMethod] = useState<HandoverMethod>('pickup');
  const [handoverAddress, setHandoverAddress] = useState('');
  const [handoverDatetime, setHandoverDatetime] = useState('');
  const [handoverInstructions, setHandoverInstructions] = useState('');
  const [message, setMessage] = useState('');

  const handleApprove = () => {
    if (!dueDate) return;

    const dueDateISO = dueDate.toISOString();
    onApprove(
      dueDateISO,
      handoverMethod,
      {
        address: handoverAddress.trim() || undefined,
        datetime: handoverDatetime.trim() || undefined,
        instructions: handoverInstructions.trim() || undefined,
      },
      message.trim() || undefined
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setDueDate(addWeeks(new Date(), 2));
      setHandoverMethod('pickup');
      setHandoverAddress('');
      setHandoverDatetime('');
      setHandoverInstructions('');
      setMessage('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Approve Borrow Request</DialogTitle>
          <DialogDescription>
            Set up handover details for {bookTitle && `"${bookTitle}"`}
            {borrowerName && ` with ${borrowerName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Due Date Picker */}
          <div className="grid gap-2">
            <Label htmlFor="due-date">Due Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="due-date"
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Handover Method Selection */}
          <div className="grid gap-2">
            <Label>Handover Method *</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={handoverMethod === 'ship' ? 'default' : 'outline'}
                onClick={() => setHandoverMethod('ship')}
                className="flex flex-col h-auto py-3"
              >
                <span className="text-2xl mb-1">📦</span>
                <span className="text-sm">Ship</span>
              </Button>
              <Button
                type="button"
                variant={handoverMethod === 'meetup' ? 'default' : 'outline'}
                onClick={() => setHandoverMethod('meetup')}
                className="flex flex-col h-auto py-3"
              >
                <span className="text-2xl mb-1">🤝</span>
                <span className="text-sm">Meet Up</span>
              </Button>
              <Button
                type="button"
                variant={handoverMethod === 'pickup' ? 'default' : 'outline'}
                onClick={() => setHandoverMethod('pickup')}
                className="flex flex-col h-auto py-3"
              >
                <span className="text-2xl mb-1">📍</span>
                <span className="text-sm">Pickup</span>
              </Button>
            </div>
          </div>

          {/* Conditional Handover Details */}
          {handoverMethod === 'ship' && (
            <div className="grid gap-2">
              <Label htmlFor="ship-address">Shipping Address</Label>
              <Textarea
                id="ship-address"
                placeholder="Enter borrower's shipping address..."
                value={handoverAddress}
                onChange={(e) => setHandoverAddress(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {handoverMethod === 'meetup' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="meetup-location">Meeting Location</Label>
                <Input
                  id="meetup-location"
                  placeholder="e.g., Starbucks on Main St"
                  value={handoverAddress}
                  onChange={(e) => setHandoverAddress(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="meetup-datetime">Meeting Date & Time</Label>
                <Input
                  id="meetup-datetime"
                  type="datetime-local"
                  value={handoverDatetime}
                  onChange={(e) => setHandoverDatetime(e.target.value)}
                />
              </div>
            </>
          )}

          {handoverMethod === 'pickup' && (
            <div className="grid gap-2">
              <Label htmlFor="pickup-address">Pickup Address</Label>
              <Textarea
                id="pickup-address"
                placeholder="Your address or pickup location..."
                value={handoverAddress}
                onChange={(e) => setHandoverAddress(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Handover Instructions */}
          <div className="grid gap-2">
            <Label htmlFor="handover-instructions">Handover Instructions (Optional)</Label>
            <Textarea
              id="handover-instructions"
              placeholder={
                handoverMethod === 'ship'
                  ? 'e.g., "Please confirm address before I ship"'
                  : handoverMethod === 'meetup'
                  ? 'e.g., "I\'ll be wearing a red jacket"'
                  : 'e.g., "Ring doorbell, Apt 3B, available 6-8 PM"'
              }
              value={handoverInstructions}
              onChange={(e) => setHandoverInstructions(e.target.value)}
              rows={2}
            />
          </div>

          {/* Optional Message */}
          <div className="grid gap-2">
            <Label htmlFor="message">Message to Borrower (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a message for the borrower..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
            onClick={handleApprove}
            disabled={!dueDate || isPending}
          >
            {isPending ? 'Approving...' : 'Approve Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
