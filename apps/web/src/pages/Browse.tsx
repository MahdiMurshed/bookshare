import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BookWithOwner } from '@repo/api-client';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { BookOpen, AlertCircle } from '@repo/ui/components/icons';
import { useAvailableBooks } from '../hooks/useAvailableBooks';
import { BookFilters } from '../components/Browse/BookFilters';
import { BookGrid } from '../components/Browse/BookGrid';
import { EmptyState } from '../components/Browse/EmptyState';

export default function Browse() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');

  const { data: books = [], isLoading, error, refetch } = useAvailableBooks({
    genre: genreFilter,
    search: searchQuery,
  });

  const handleBookClick = (book: BookWithOwner) => {
    navigate(`/books/${book.id}`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setGenreFilter('all');
  };

  const hasFilters = !!searchQuery || genreFilter !== 'all';

  const resultsTitle = hasFilters
    ? `Search Results`
    : 'Available Books';

  return (
    <div className="min-h-screen bg-background">
      {/* Page Container with max width */}
      <div className="mx-auto" style={{ maxWidth: 'var(--container-page)' }}>
        {/* Header Section */}
        <header className="px-6 py-8 md:py-12 border-b border-border/40">
          <div className="space-y-4">
            {/* Icon & Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                  Discover Books
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Explore our community library and find your next great read
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
          {/* Filters Section */}
          <div className="mb-8">
            <BookFilters
              searchQuery={searchQuery}
              genreFilter={genreFilter}
              onSearchChange={setSearchQuery}
              onGenreChange={setGenreFilter}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Error State */}
          {error && !isLoading && (
            <Card className="border-destructive/50 bg-destructive/5">
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Failed to load books
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {error instanceof Error
                    ? error.message
                    : 'Something went wrong while fetching the books. Please try again.'}
                </p>
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </Card>
          )}

          {/* Books Grid with Loading State */}
          {!error && (
            <BookGrid
              books={books}
              onBookClick={handleBookClick}
              title={resultsTitle}
              isLoading={isLoading}
            />
          )}

          {/* Empty State */}
          {!isLoading && !error && books.length === 0 && (
            <EmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
          )}
        </main>
      </div>
    </div>
  );
}
