import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { BookOpen, X, SearchX } from '@repo/ui/components/icons';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
          <div className="relative bg-muted/50 rounded-full p-6">
            {hasFilters ? (
              <SearchX className="h-12 w-12 text-muted-foreground/60" />
            ) : (
              <BookOpen className="h-12 w-12 text-muted-foreground/60" />
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3 mb-6 max-w-md">
          <h3 className="text-xl font-semibold text-foreground">
            {hasFilters ? 'No books found' : 'No available books yet'}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {hasFilters
              ? 'We couldn\'t find any books matching your criteria. Try adjusting your search terms or filters to discover more books.'
              : 'There are no books available for borrowing at the moment. Check back soon as our community adds new books to share!'}
          </p>
        </div>

        {/* Action Button */}
        {hasFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            size="sm"
            className="shadow-sm hover:shadow transition-shadow"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </Card>
  );
}
