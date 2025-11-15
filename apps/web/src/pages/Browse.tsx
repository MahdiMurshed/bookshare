/**
 * Browse Page - Production-Grade Book Discovery
 *
 * Premium literary editorial aesthetic with warm amber/orange palette
 * Features: Hero section, sticky filters sidebar, enhanced book grid
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BookWithOwner } from '@repo/api-client';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { BookOpen, AlertCircle, Sparkles, Search } from '@repo/ui/components/icons';
import { useAvailableBooks } from '../hooks/useAvailableBooks';
import { BookFilters } from '../components/Browse/BookFilters';
import { BookGrid } from '../components/Browse/BookGrid';
import { EmptyState } from '../components/Browse/EmptyState';

export default function Browse() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: books = [], isLoading, error, refetch } = useAvailableBooks({
    genre: genreFilter,
    search: debouncedSearch,
  });

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
  };

  const hasFilters =
    !!searchQuery ||
    genreFilter !== 'all' ||
    conditionFilter !== 'all' ||
    availableOnly;

  const activeFilterCount = [
    !!searchQuery,
    genreFilter !== 'all',
    conditionFilter !== 'all',
    availableOnly,
  ].filter(Boolean).length;

  const resultsTitle = hasFilters ? 'Search Results' : 'Available Books';

  return (
    <>
      {/* Custom Styles for Literary Aesthetic */}
      <style>{`
        @keyframes book-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(2deg); }
          66% { transform: translateY(-8px) rotate(-1deg); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-gradient {
          background: linear-gradient(
            135deg,
            rgba(251, 146, 60, 0.08) 0%,
            rgba(249, 115, 22, 0.12) 35%,
            rgba(234, 88, 12, 0.08) 70%,
            rgba(194, 65, 12, 0.06) 100%
          );
          position: relative;
          overflow: hidden;
        }

        .hero-gradient::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(circle at 20% 30%, rgba(251, 146, 60, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(234, 88, 12, 0.12) 0%, transparent 50%);
          pointer-events: none;
        }

        .gradient-text {
          background: linear-gradient(to right, #f97316, #ea580c, #c2410c);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
        }

        .search-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(251, 146, 60, 0.2);
          box-shadow:
            0 8px 32px rgba(251, 146, 60, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .search-glass:focus-within {
          border-color: rgba(249, 115, 22, 0.4);
          box-shadow:
            0 8px 32px rgba(251, 146, 60, 0.25),
            0 0 0 3px rgba(251, 146, 60, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .book-pattern {
          position: absolute;
          opacity: 0.04;
          pointer-events: none;
        }

        .animate-book-float {
          animation: book-float 6s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>

      <div className="min-h-screen bg-background">
        {/* Hero Section with Literary Patterns */}
        <div className="hero-gradient border-b border-border/40">
          {/* Decorative Book Patterns */}
          <div className="book-pattern top-20 left-10 animate-book-float">
            <BookOpen className="h-32 w-32 text-amber-600" style={{ animationDelay: '0s' }} />
          </div>
          <div className="book-pattern top-40 right-20 animate-book-float">
            <Sparkles className="h-24 w-24 text-orange-600" style={{ animationDelay: '2s' }} />
          </div>
          <div className="book-pattern bottom-20 left-1/3 animate-book-float">
            <BookOpen className="h-28 w-28 text-amber-500" style={{ animationDelay: '4s' }} />
          </div>

          <div className="mx-auto relative z-10" style={{ maxWidth: 'var(--container-page)' }}>
            <div className="px-6 py-12 md:py-16">
              {/* Hero Content */}
              <div className="max-w-3xl mx-auto text-center space-y-6">
                {/* Decorative Element */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-amber-200/50 shadow-sm mb-4">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-900">Discover Your Next Great Read</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl md:text-7xl font-serif font-bold gradient-text tracking-tight leading-tight">
                  Discover Books
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Explore our curated community library and find books that inspire, educate, and entertain
                </p>

                {/* Hero Search Bar */}
                <div className="max-w-2xl mx-auto mt-8">
                  <div className="search-glass rounded-2xl p-2 transition-all duration-300">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-600/70" />
                      <input
                        type="text"
                        placeholder="Search by title, author, or genre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent pl-12 pr-4 py-4 text-base outline-none placeholder:text-muted-foreground/60"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-amber-100"
                        >
                          <span className="text-xs">✕</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Search Status */}
                  {searchQuery && searchQuery !== debouncedSearch && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
                      Searching...
                    </p>
                  )}
                </div>

                {/* Stats Bar */}
                <div className="flex items-center justify-center gap-8 pt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground font-semibold">{filteredBooks.filter(b => b.borrowable).length}</strong> Available
                    </span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amber-600" />
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
                  onSearchChange={setSearchQuery}
                  onGenreChange={setGenreFilter}
                  onConditionChange={setConditionFilter}
                  onAvailableOnlyChange={setAvailableOnly}
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
                onSearchChange={setSearchQuery}
                onGenreChange={setGenreFilter}
                onConditionChange={setConditionFilter}
                onAvailableOnlyChange={setAvailableOnly}
                onClearFilters={handleClearFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              {/* Error State */}
              {error && !isLoading && (
                <Card className="border-destructive/50 bg-destructive/5 animate-fade-in-up">
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
    </>
  );
}
