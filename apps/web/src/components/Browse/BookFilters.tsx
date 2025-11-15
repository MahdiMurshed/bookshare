import { Card } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Search, X, SlidersHorizontal } from '@repo/ui/components/icons';
import { BOOK_GENRES } from '../../lib/constants/book';

interface BookFiltersProps {
  searchQuery: string;
  genreFilter: string;
  onSearchChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onClearFilters: () => void;
}

export function BookFilters({
  searchQuery,
  genreFilter,
  onSearchChange,
  onGenreChange,
  onClearFilters,
}: BookFiltersProps) {
  const hasFilters = searchQuery || genreFilter !== 'all';

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Discover Books
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-background/60 border-border/60 focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* Genre Filter */}
          <div className="w-full sm:w-52">
            <Select value={genreFilter} onValueChange={onGenreChange}>
              <SelectTrigger className="bg-background/60 border-border/60 focus:border-primary/50 transition-colors">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {BOOK_GENRES.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="w-full sm:w-auto text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters Indicator */}
        {hasFilters && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              {searchQuery && (
                <span>
                  Searching for <strong className="text-foreground">"{searchQuery}"</strong>
                </span>
              )}
              {searchQuery && genreFilter !== 'all' && ' • '}
              {genreFilter !== 'all' && (
                <span>
                  Genre: <strong className="text-foreground">{genreFilter}</strong>
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
