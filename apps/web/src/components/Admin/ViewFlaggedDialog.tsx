/**
 * ViewFlaggedDialog Component
 *
 * Dialog for viewing flagged book content details
 * Features comprehensive flagged information display with unflag action
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
import { Badge } from '@repo/ui/components/badge';
import { Separator } from '@repo/ui/components/separator';
import { Flag, BookOpen, Calendar, User, Mail, AlertTriangle } from 'lucide-react';

export interface ViewFlaggedDialogProps {
  book: BookWithOwner | null;
  open: boolean;
  onClose: () => void;
  onUnflag: () => Promise<void>;
}

export function ViewFlaggedDialog({
  book,
  open,
  onClose,
  onUnflag,
}: ViewFlaggedDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnflag = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onUnflag();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unflag book');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  // Format the flagged date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-2">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-destructive/10 p-2 border border-destructive/20">
              <Flag className="w-5 h-5 text-destructive" strokeWidth={2} />
            </div>
            <DialogTitle className="text-xl">Flagged Content Details</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Review the details of this flagged book and take appropriate action.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Alert Banner */}
          <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-destructive mb-1">Flagged for Review</p>
                <p className="text-sm text-destructive/90">
                  This book has been flagged and may contain inappropriate or incorrect
                  content. Please review carefully before taking action.
                </p>
              </div>
            </div>
          </div>

          {/* Book Information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Book Information
            </h3>
            <div className="rounded-lg border-2 border-border bg-muted/30 p-4">
              <div className="flex items-start gap-4">
                {book?.cover_image_url ? (
                  <div className="w-20 h-28 rounded-md border-2 border-border bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML =
                            '<div class="w-full h-full flex items-center justify-center bg-muted"><svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg></div>';
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-28 rounded-md border-2 border-border bg-muted flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <p className="font-semibold text-foreground text-lg">{book?.title}</p>
                    <p className="text-sm text-muted-foreground">by {book?.author}</p>
                  </div>
                  {book?.genre && (
                    <Badge
                      variant="outline"
                      className="text-xs border-primary/20 bg-primary/5 text-primary"
                    >
                      {book.genre}
                    </Badge>
                  )}
                  {book?.isbn && (
                    <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
                  )}
                </div>
              </div>

              {book?.description && (
                <>
                  <Separator className="my-3" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="text-sm text-foreground line-clamp-3">
                      {book.description}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Owner Information */}
          {book?.owner && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Book Owner
              </h3>
              <div className="rounded-lg border-2 border-border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  {book.owner.avatar_url ? (
                    <img
                      src={book.owner.avatar_url}
                      alt={book.owner.name}
                      className="w-10 h-10 rounded-full border-2 border-border object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-border bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{book.owner.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {book.owner.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Flag Details */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Flag Details
            </h3>
            <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4 space-y-3">
              {/* Flagged Date */}
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Flagged On
                  </p>
                  <p className="text-sm text-foreground">
                    {formatDate(book?.flagged_at || null)}
                  </p>
                </div>
              </div>

              <Separator className="bg-destructive/20" />

              {/* Flag Reason */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Reason for Flagging
                </p>
                <div className="rounded-md bg-background border border-destructive/20 p-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {book?.flagged_reason || 'No reason provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-3">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-2"
          >
            Close
          </Button>
          <Button
            variant="default"
            onClick={handleUnflag}
            disabled={isLoading}
            className="min-w-[120px] bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Unflagging...' : 'Unflag Book'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
