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
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10 rounded-2xl opacity-50" />
        <div className="relative p-6 sm:p-8 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 backdrop-blur-sm text-center">
          <p
            className="text-base text-muted-foreground italic"
            style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 300 }}
          >
            This is your book
          </p>
        </div>
      </div>
    );
  }

  if (!isAvailable) {
    return null;
  }

  return (
    <div className="relative">
      {!showForm ? (
        <div className="relative group">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-500/10 dark:from-amber-600/10 dark:to-orange-700/10 rounded-2xl group-hover:from-amber-400/20 group-hover:to-orange-500/20 dark:group-hover:from-amber-600/20 dark:group-hover:to-orange-700/20 transition-all duration-300" />

          {/* CTA Card */}
          <div className="relative p-6 sm:p-8 rounded-2xl border border-amber-200 dark:border-amber-800/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Icon */}
              <div className="shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
                    <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Text & Button */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div>
                  <h3
                    className="text-xl sm:text-2xl font-semibold text-foreground mb-1"
                    style={{ fontFamily: '"Crimson Pro", serif' }}
                  >
                    Interested in this book?
                  </h3>
                  <p
                    className="text-sm sm:text-base text-muted-foreground"
                    style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 300 }}
                  >
                    Send a borrow request to the owner
                  </p>
                </div>
                <Button
                  onClick={onShowForm}
                  size="lg"
                  disabled={!isAuthenticated}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-500/25 dark:shadow-amber-900/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/40 dark:hover:shadow-amber-900/40 hover:-translate-y-0.5"
                  style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 500 }}
                >
                  {isAuthenticated ? 'Request to Borrow' : 'Sign In to Borrow'}
                </Button>
              </div>
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
