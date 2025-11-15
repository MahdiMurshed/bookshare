import { Button } from '@repo/ui/components/button';
import { BorrowRequestForm } from './BorrowRequestForm';
import { BookOpen } from '@repo/ui/components/icons';

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
      <div className="border-2 border-border rounded-lg p-6 sm:p-8 bg-card text-center">
        <p className="text-base text-muted-foreground italic">
          This is your book
        </p>
      </div>
    );
  }

  if (!isAvailable) {
    return null;
  }

  return (
    <div>
      {!showForm ? (
        <div className="border-2 border-border rounded-lg p-6 sm:p-8 bg-card">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Icon */}
            <div className="shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
            </div>

            {/* Text & Button */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                  Interested in this book?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Send a borrow request to the owner
                </p>
              </div>
              <Button
                onClick={onShowForm}
                size="lg"
                disabled={!isAuthenticated}
                className="font-semibold"
              >
                {isAuthenticated ? 'Request to Borrow' : 'Sign In to Borrow'}
              </Button>
            </div>
          </div>
        </div>
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
