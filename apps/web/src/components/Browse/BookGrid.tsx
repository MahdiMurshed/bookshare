/**
 * BookGrid Component - Clean Responsive Book Grid
 *
 * Features:
 * - Simple fade-in animations
 * - Responsive layout (2→3→4→5 columns)
 * - Clean loading skeletons
 * - Results header
 */

import type { BookWithOwner } from '@repo/api-client';
import { BookCard } from './BookCard';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Card } from '@repo/ui/components/card';
import { Library } from '@repo/ui/components/icons';

interface BookGridProps {
  books: BookWithOwner[];
  onBookClick: (book: BookWithOwner) => void;
  title: string;
  isLoading?: boolean;
}

function BookCardSkeleton() {
  return (
    <Card className="overflow-hidden border-2">
      {/* Cover Skeleton */}
      <Skeleton className="aspect-[2/3] w-full" />

      {/* Info Skeleton */}
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>
    </Card>
  );
}

export function BookGrid({ books, onBookClick, title, isLoading = false }: BookGridProps) {
  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Library className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {title}
            </h2>
            {!isLoading && books.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {books.length} {books.length === 1 ? 'book' : 'books'} found
              </p>
            )}
          </div>
        </div>

        {/* Results Count Badge */}
        {!isLoading && books.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-sm font-semibold text-primary">
              {books.length} Results
            </span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {isLoading ? (
          // Loading Skeletons
          Array.from({ length: 10 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))
        ) : (
          // Book Cards
          books.map((book) => (
            <BookCard key={book.id} book={book} onClick={onBookClick} />
          ))
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-muted border border-border">
            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm font-medium text-foreground">
              Loading books...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
