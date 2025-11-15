/**
 * EmptyState Component - Clean Empty States
 *
 * Features:
 * - Simple illustration
 * - Contextual messages
 * - Clear call-to-action
 */

import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { BookOpen, SearchX } from '@repo/ui/components/icons';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <Card className="border-2">
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="bg-muted rounded-3xl p-8">
            {hasFilters ? (
              <SearchX className="h-20 w-20 text-muted-foreground" />
            ) : (
              <BookOpen className="h-20 w-20 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4 mb-8 max-w-lg">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {hasFilters ? 'No Books Found' : 'No Books Available Yet'}
          </h3>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {hasFilters ? (
              <>
                We couldn't find any books matching your search criteria.
                <br className="hidden sm:block" />
                Try adjusting your filters or search terms to discover more books.
              </>
            ) : (
              <>
                There are no books available for borrowing at the moment.
                <br className="hidden sm:block" />
                Check back soon as our community adds new books to share!
              </>
            )}
          </p>
        </div>

        {/* Action Button */}
        {hasFilters && (
          <Button
            onClick={onClearFilters}
            size="lg"
            className="font-semibold"
          >
            <SearchX className="h-5 w-5 mr-2" />
            Clear All Filters
          </Button>
        )}

        {/* Helper Text */}
        <p className="text-xs text-muted-foreground mt-8">
          Tip: New books are added daily by our community members
        </p>
      </div>
    </Card>
  );
}
