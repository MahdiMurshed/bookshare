import { useState } from 'react';
import { Button } from '@repo/ui/components/button';
import { Textarea } from '@repo/ui/components/textarea';
import { Alert, AlertDescription } from '@repo/ui/components/alert';
import { Loader2, Send, X, AlertCircle } from '@repo/ui/components/icons';

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
    <div className="border-2 border-border rounded-lg p-6 sm:p-8 bg-card space-y-6">
      <div>
        <label className="block text-base font-semibold text-foreground mb-3">
          Message to Owner
          <span className="ml-2 text-sm font-normal text-muted-foreground italic">
            (Optional)
          </span>
        </label>
        <Textarea
          placeholder="Share why you're interested in this book or how long you'd like to borrow it..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full resize-none"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {message.length} characters
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isPending || !isAuthenticated}
          size="lg"
          className="flex-1 font-semibold"
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
          className="font-semibold"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="border-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : 'Failed to send request. Please try again.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
