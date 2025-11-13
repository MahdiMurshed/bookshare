import { Button } from '@repo/ui/components/button';
import { BookOpen, X } from '@repo/ui/components/icons';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-600 mb-2">
        {hasFilters ? 'No books found' : 'No available books yet'}
      </h3>
      <p className="text-gray-500 mb-6">
        {hasFilters
          ? 'Try adjusting your filters to find more books'
          : 'Check back later for new books to borrow'}
      </p>
      {hasFilters && (
        <Button onClick={onClearFilters} variant="outline">
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
