import { useState } from 'react';
import { Button } from '@repo/ui/components/button';
import { Textarea } from '@repo/ui/components/textarea';
import { Loader2, Send, X } from '@repo/ui/components/icons';

interface BorrowRequestFormProps {
  isAuthenticated: boolean;
  isPending: boolean;
  error: Error | null;
  onSubmit: (message: string) => void;
  onCancel: () => void;
}

export function BorrowRequestForm({
  isAuthenticated,
  isPending,
  error,
  onSubmit,
  onCancel,
}: BorrowRequestFormProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    onSubmit(message);
  };

  return (
    <div className="relative group">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10 rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Form Content */}
      <div className="relative p-6 sm:p-8 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 backdrop-blur-sm space-y-6">
        <div>
          <label
            className="block text-base font-semibold text-foreground mb-3"
            style={{ fontFamily: '"Crimson Pro", serif' }}
          >
            Message to Owner
            <span
              className="ml-2 text-sm font-normal text-muted-foreground italic"
              style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 300 }}
            >
              (Optional)
            </span>
          </label>
          <Textarea
            placeholder="Share why you're interested in this book or how long you'd like to borrow it..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full resize-none bg-background/80 border-border/50 focus:border-amber-500 dark:focus:border-amber-600 focus:ring-amber-500/20 dark:focus:ring-amber-600/20 rounded-xl transition-all duration-200"
            style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 300 }}
          />
          <p
            className="mt-2 text-xs text-muted-foreground"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          >
            {message.length} characters
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isPending || !isAuthenticated}
            size="lg"
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-500/25 dark:shadow-amber-900/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/40 dark:hover:shadow-amber-900/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 500 }}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Request...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            size="lg"
            className="border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200"
            style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 500 }}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p
              className="text-sm text-red-600 dark:text-red-400"
              style={{ fontFamily: '"Outfit", sans-serif' }}
            >
              {error instanceof Error
                ? error.message
                : 'Failed to send request. Please try again.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
