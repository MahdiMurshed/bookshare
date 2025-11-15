/**
 * BookGrid Component - Responsive Book Grid with Animations
 *
 * Features:
 * - Staggered fade-in animations
 * - Improved responsive layout (2→3→4→5 columns)
 * - Enhanced loading skeletons
 * - Results header with count and sort
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

function BookCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${delay * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }}
    >
      <Card className="overflow-hidden border-border/50 shadow-md">
        {/* Frame Skeleton */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-[3px] rounded-t-lg">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
        </div>

        {/* Info Skeleton */}
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        </div>
      </Card>
    </div>
  );
}

export function BookGrid({ books, onBookClick, title, isLoading = false }: BookGridProps) {
  return (
    <>
      {/* Custom Styles */}
      <style>{`
        @keyframes stagger-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .book-grid-item {
          animation: stagger-fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(251, 146, 60, 0.05) 0%,
            rgba(249, 115, 22, 0.15) 50%,
            rgba(251, 146, 60, 0.05) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div className="space-y-6">
        {/* Results Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
              <Library className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-foreground">
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
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-sm font-semibold text-amber-900">
                {books.length} Results
              </span>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {isLoading ? (
            // Loading Skeletons with Staggered Animation
            Array.from({ length: 10 }).map((_, i) => (
              <BookCardSkeleton key={i} delay={i} />
            ))
          ) : (
            // Book Cards with Staggered Animation
            books.map((book, index) => (
              <div
                key={book.id}
                className="book-grid-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <BookCard book={book} onClick={onBookClick} />
              </div>
            ))
          )}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 shadow-sm">
              <div className="h-5 w-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              <span className="text-sm font-medium text-amber-900">
                Loading books...
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
