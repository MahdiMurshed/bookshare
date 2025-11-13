import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BookWithOwner } from '@repo/api-client';
import { Button } from '@repo/ui/components/button';
import { BookOpen, Loader2, AlertCircle } from '@repo/ui/components/icons';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-indigo-900">Browse Books</h1>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <BookFilters
            searchQuery={searchQuery}
            genreFilter={genreFilter}
            onSearchChange={setSearchQuery}
            onGenreChange={setGenreFilter}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading books...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 mb-4">
              {error instanceof Error ? error.message : 'Failed to load books. Please try again.'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Books Grid */}
        {!isLoading && !error && books.length > 0 && (
          <BookGrid
            books={books}
            onBookClick={handleBookClick}
            title={
              hasFilters
                ? `Found ${books.length} book${books.length !== 1 ? 's' : ''}`
                : `All Available Books (${books.length})`
            }
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && books.length === 0 && (
          <EmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
        )}
      </div>
    </div>
  );
}
