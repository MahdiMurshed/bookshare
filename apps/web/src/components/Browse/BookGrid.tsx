import type { BookWithOwner } from '@repo/api-client';
import { BookCard } from './BookCard';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Card } from '@repo/ui/components/card';

interface BookGridProps {
  books: BookWithOwner[];
  onBookClick: (book: BookWithOwner) => void;
  title: string;
  isLoading?: boolean;
}

function BookCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50">
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        <Skeleton className="h-3 w-2/5" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </Card>
  );
}

export function BookGrid({ books, onBookClick, title, isLoading = false }: BookGridProps) {
  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {!isLoading && books.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)
          : books.map((book) => <BookCard key={book.id} book={book} onClick={onBookClick} />)}
      </div>
    </div>
  );
}
