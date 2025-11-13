import { Card } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select';
import { Search, X } from '@repo/ui/components/icons';
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
    <Card className="p-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Genre Filter */}
        <div className="w-full md:w-64">
          <Select value={genreFilter} onValueChange={onGenreChange}>
            <SelectTrigger>
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
            variant="outline"
            onClick={onClearFilters}
            className="w-full md:w-auto"
          >
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </Card>
  );
}
