/**
 * FlagBookDialog Component
 *
 * Dialog for flagging inappropriate book content
 * Features quick-select reason chips and custom reason input
 */

import { useState } from 'react';
import type { BookWithOwner } from '@repo/api-client';
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
import { Flag, BookOpen } from 'lucide-react';

// Common flag reasons
const FLAG_REASONS = [
  'Inappropriate Content',
  'Spam',
  'Duplicate',
  'Incorrect Information',
  'Other',
];

export interface FlagBookDialogProps {
  book: BookWithOwner | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export function FlagBookDialog({
  book,
  open,
  onClose,
  onConfirm,
}: FlagBookDialogProps) {
  const [reason, setReason] = useState('');
  const [selectedQuickReason, setSelectedQuickReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const handleQuickReasonClick = (quickReason: string) => {
    if (selectedQuickReason === quickReason) {
      // Deselect
      setSelectedQuickReason(null);
      setReason('');
    } else {
      // Select
      setSelectedQuickReason(quickReason);
      setReason(quickReason);
    }
    setError(null);
  };

  const handleReasonChange = (value: string) => {
    setReason(value);
    // Clear selected quick reason if user types custom reason
    if (selectedQuickReason && value !== selectedQuickReason) {
      setSelectedQuickReason(null);
    }
    setError(null);
  };

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for flagging this book');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(reason);
      // Reset form on success
      setReason('');
      setSelectedQuickReason(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to flag book');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      setSelectedQuickReason(null);
      setError(null);
      setImageError(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] border-2">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-destructive/10 p-2 border border-destructive/20">
              <Flag className="w-5 h-5 text-destructive" strokeWidth={2} />
            </div>
            <DialogTitle className="text-xl">Flag Book</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Flag "{book?.title}" for inappropriate or incorrect content. This will be
            reviewed by the admin team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Book Preview */}
          <div className="rounded-lg border-2 border-border bg-muted/30 p-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-24 rounded-md border-2 border-border bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                {book?.cover_image_url && !imageError ? (
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <BookOpen className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{book?.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  by {book?.author}
                </p>
                {book?.genre && (
                  <Badge
                    variant="outline"
                    className="mt-2 text-xs border-primary/20 bg-primary/5 text-primary"
                  >
                    {book.genre}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Quick Reason Selection */}
          <div className="space-y-2">
            <Label className="font-medium text-sm">Quick Select Reason</Label>
            <div className="flex flex-wrap gap-2">
              {FLAG_REASONS.map((quickReason) => (
                <Badge
                  key={quickReason}
                  variant={selectedQuickReason === quickReason ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedQuickReason === quickReason
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-2 hover:border-primary/50'
                  }`}
                  onClick={() => handleQuickReasonClick(quickReason)}
                >
                  {quickReason}
                </Badge>
              ))}
            </div>
          </div>

          {/* Reason Textarea */}
          <div className="space-y-2">
            <Label htmlFor="flag-reason" className="font-medium">
              Reason for flagging <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="flag-reason"
              placeholder="Enter the reason for flagging this book or select a quick reason above..."
              value={reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              className="min-h-[120px] resize-none border-2 focus-visible:ring-2 focus-visible:ring-primary transition-all"
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
          </div>
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
            {isLoading ? 'Flagging...' : 'Flag Book'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
