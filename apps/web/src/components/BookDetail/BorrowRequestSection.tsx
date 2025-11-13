import { Button } from '@repo/ui/components/button';
import { BorrowRequestForm } from './BorrowRequestForm';

interface BorrowRequestSectionProps {
  isAuthenticated: boolean;
  isOwnBook: boolean;
  isAvailable: boolean;
  showForm: boolean;
  isPending: boolean;
  error: Error | null;
  onShowForm: () => void;
  onSubmit: (message: string) => void;
  onCancel: () => void;
}

export function BorrowRequestSection({
  isAuthenticated,
  isOwnBook,
  isAvailable,
  showForm,
  isPending,
  error,
  onShowForm,
  onSubmit,
  onCancel,
}: BorrowRequestSectionProps) {
  if (isOwnBook) {
    return (
      <div className="border-t pt-6">
        <p className="text-gray-600 italic">This is your book</p>
      </div>
    );
  }

  if (!isAvailable) {
    return null;
  }

  return (
    <div className="border-t pt-6">
      {!showForm ? (
        <Button
          onClick={onShowForm}
          size="lg"
          className="w-full md:w-auto"
          disabled={!isAuthenticated}
        >
          {isAuthenticated ? 'Request to Borrow' : 'Sign In to Borrow'}
        </Button>
      ) : (
        <BorrowRequestForm
          isAuthenticated={isAuthenticated}
          isPending={isPending}
          error={error}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
