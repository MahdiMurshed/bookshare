/**
 * ConfirmDialog Component
 *
 * Reusable confirmation dialog for dangerous actions
 * Features clean design with support for default and destructive variants
 */

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
import { AlertTriangle, AlertCircle } from 'lucide-react';

export interface ConfirmDialogProps {
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  variant?: 'default' | 'destructive';
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  title,
  description,
  open,
  onClose,
  onConfirm,
  variant = 'default',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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

  const isDestructive = variant === 'destructive';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] border-2">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`rounded-lg p-2 border ${
                isDestructive
                  ? 'bg-destructive/10 border-destructive/20'
                  : 'bg-primary/10 border-primary/20'
              }`}
            >
              {isDestructive ? (
                <AlertTriangle className="w-5 h-5 text-destructive" strokeWidth={2} />
              ) : (
                <AlertCircle className="w-5 h-5 text-primary" strokeWidth={2} />
              )}
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <DialogFooter className="gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-2"
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
