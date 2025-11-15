import { useState, useEffect, useCallback } from 'react';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@repo/ui/components/command';
import { BookOpen, Loader2 } from '@repo/ui/components/icons';
import { searchBooks, type BookSearchResult } from '@repo/api-client';

interface BookAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBookSelect: (book: BookSearchResult) => void;
  error?: string;
}

export function BookAutocomplete({ value, onChange, onBookSelect, error }: BookAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  // Debounced search
  const handleSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchBooks(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (newValue: string) => {
    onChange(newValue);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for search
    const timeout = setTimeout(() => {
      handleSearch(newValue);
    }, 300); // 300ms debounce

    setSearchTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSelectBook = (book: BookSearchResult) => {
    onBookSelect(book);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <Label htmlFor="title">Book Title *</Label>
      <div className="relative">
        <Input
          id="title"
          type="text"
          placeholder="Start typing to search for books..."
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className={error ? 'border-red-500' : ''}
          autoComplete="off"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
          <Command className="rounded-lg border-none">
            <CommandList>
              <CommandEmpty>No books found.</CommandEmpty>
              <CommandGroup heading="Book Suggestions">
                {suggestions.map((book) => (
                  <CommandItem
                    key={book.id}
                    value={book.title}
                    onSelect={() => handleSelectBook(book)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-3 w-full">
                      {book.imageUrl ? (
                        <img
                          src={book.imageUrl}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{book.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author'}
                        </p>
                        {book.publishedDate && (
                          <p className="text-xs text-muted-foreground/80">{book.publishedDate.split('-')[0]}</p>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}

      {/* Click outside to close */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}
