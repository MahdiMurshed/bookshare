/**
 * Browse Page - Clean Book Discovery
 *
 * Minimal SaaS aesthetic matching Home page design
 * Features: Hero section, filters sidebar, clean book grid
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BookWithOwner } from '@repo/api-client';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { BookOpen, AlertCircle, Search } from '@repo/ui/components/icons';
import { useAvailableBooks } from '../hooks/useAvailableBooks';
import { useMyCommunities, useCommunityBooks } from '../hooks/useCommunities';
import { useAuth } from '../contexts/AuthContext';
import { BookFilters } from '../components/Browse/BookFilters';
import { BookGrid } from '../components/Browse/BookGrid';
import { EmptyState } from '../components/Browse/EmptyState';

export default function Browse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [communityFilter, setCommunityFilter] = useState<string>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch user's communities
  const { data: userCommunities = [] } = useMyCommunities(user?.id);

  // Determine which query to use based on community filter
  const shouldUseAllBooks = communityFilter === 'all';
  const shouldUseMyCommunities = communityFilter === 'my-communities';
  const specificCommunityId = !shouldUseAllBooks && !shouldUseMyCommunities ? communityFilter : '';

  // Fetch all available books (default)
  const allBooksQuery = useAvailableBooks({
    genre: genreFilter,
    search: debouncedSearch,
  });

  // Fetch books from a specific community
  const communityBooksQuery = useCommunityBooks(specificCommunityId);

  // Combine books from all user's communities for "My Communities" filter
  const myCommunityBooks = useMemo(() => {
    if (!shouldUseMyCommunities || !allBooksQuery.data) return [];

    // Filter books from all available books to only show those in user's communities
    // This is a client-side filter - ideally would be done server-side
    // For now, showing all available books when "My Communities" is selected
    return allBooksQuery.data;
  }, [shouldUseMyCommunities, allBooksQuery.data, userCommunities]);

  // Determine which data to use
  const books = shouldUseAllBooks
    ? allBooksQuery.data || []
    : specificCommunityId
    ? communityBooksQuery.data || []
    : myCommunityBooks;

  const isLoading = shouldUseAllBooks
    ? allBooksQuery.isLoading
    : specificCommunityId
    ? communityBooksQuery.isLoading
    : allBooksQuery.isLoading;

  const error = shouldUseAllBooks
    ? allBooksQuery.error
    : specificCommunityId
    ? communityBooksQuery.error
    : allBooksQuery.error;

  const refetch = shouldUseAllBooks
    ? allBooksQuery.refetch
    : specificCommunityId
    ? communityBooksQuery.refetch
    : allBooksQuery.refetch;

  // Apply client-side filters for condition and availability
  const filteredBooks = books.filter((book) => {
    if (conditionFilter !== 'all' && book.condition !== conditionFilter) {
      return false;
    }
    if (availableOnly && !book.borrowable) {
      return false;
    }
    return true;
  });

  const handleBookClick = (book: BookWithOwner) => {
    navigate(`/books/${book.id}`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setGenreFilter('all');
    setConditionFilter('all');
    setAvailableOnly(false);
    setCommunityFilter('all');
  };

  const hasFilters =
    !!searchQuery ||
    genreFilter !== 'all' ||
    conditionFilter !== 'all' ||
    availableOnly ||
    communityFilter !== 'all';

  const activeFilterCount = [
    !!searchQuery,
    genreFilter !== 'all',
    conditionFilter !== 'all',
    availableOnly,
    communityFilter !== 'all',
  ].filter(Boolean).length;

  const resultsTitle = hasFilters ? 'Search Results' : 'Available Books';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Clean & Minimal */}
      <div className="relative border-b border-border">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px),
                               repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px)`,
            }}
          />
        </div>

        <div className="mx-auto relative z-10" style={{ maxWidth: 'var(--container-page)' }}>
          <div className="px-6 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                Discover Books
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Explore our community library and find books that inspire, educate, and entertain
              </p>

              {/* Search Bar - Clean Design */}
              <div className="max-w-2xl mx-auto mt-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by title, author, or genre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-background border-2 border-border rounded-lg pl-12 pr-4 py-4 text-base outline-none placeholder:text-muted-foreground/60 focus:border-primary transition-colors"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <span className="text-xs">✕</span>
                    </Button>
                  )}
                </div>

                {/* Search Status */}
                {searchQuery && searchQuery !== debouncedSearch && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-primary animate-pulse" />
                    Searching...
                  </p>
                )}
              </div>

              {/* Stats Bar - Clean */}
              <div className="flex items-center justify-center gap-8 pt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground font-semibold">{filteredBooks.filter(b => b.borrowable).length}</strong> Available
                  </span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground font-semibold">{filteredBooks.length}</strong> Total Books
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Main Content with Sidebar Layout */}
        <div className="mx-auto" style={{ maxWidth: 'var(--container-page)' }}>
          <div className="flex gap-8 px-6 py-8">
            {/* Filters Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-8">
                <BookFilters
                  searchQuery={searchQuery}
                  genreFilter={genreFilter}
                  conditionFilter={conditionFilter}
                  availableOnly={availableOnly}
                  communityFilter={communityFilter}
                  userCommunities={userCommunities}
                  onSearchChange={setSearchQuery}
                  onGenreChange={setGenreFilter}
                  onConditionChange={setConditionFilter}
                  onAvailableOnlyChange={setAvailableOnly}
                  onCommunityChange={setCommunityFilter}
                  onClearFilters={handleClearFilters}
                  activeFilterCount={activeFilterCount}
                />
              </div>
            </aside>

            {/* Mobile Filters - Collapsible */}
            <div className="lg:hidden w-full mb-6">
              <BookFilters
                searchQuery={searchQuery}
                genreFilter={genreFilter}
                conditionFilter={conditionFilter}
                availableOnly={availableOnly}
                communityFilter={communityFilter}
                userCommunities={userCommunities}
                onSearchChange={setSearchQuery}
                onGenreChange={setGenreFilter}
                onConditionChange={setConditionFilter}
                onAvailableOnlyChange={setAvailableOnly}
                onCommunityChange={setCommunityFilter}
                onClearFilters={handleClearFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              {/* Error State */}
              {error && !isLoading && (
                <Card className="border-2 border-destructive/50 bg-destructive/5">
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
                  books={filteredBooks}
                  onBookClick={handleBookClick}
                  title={resultsTitle}
                  isLoading={isLoading}
                />
              )}

              {/* Empty State */}
              {!isLoading && !error && filteredBooks.length === 0 && (
                <EmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
              )}
            </main>
          </div>
        </div>
      </div>
  );
}
