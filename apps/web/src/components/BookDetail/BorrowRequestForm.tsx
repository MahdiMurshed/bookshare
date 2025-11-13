import { useState } from 'react';
import { Button } from '@repo/ui/components/button';
import { Textarea } from '@repo/ui/components/textarea';
import { Loader2 } from '@repo/ui/components/icons';

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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Message to Owner (Optional)
        </label>
        <Textarea
          placeholder="Let the owner know why you'd like to borrow this book..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full"
        />
      </div>
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isPending || !isAuthenticated}
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending Request...
            </>
          ) : (
            'Send Request'
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : 'Failed to send request. Please try again.'}
        </p>
      )}
    </div>
  );
}
