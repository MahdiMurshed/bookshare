/**
 * BookFilters Component - Clean Filter Panel
 *
 * Minimal filter sidebar with:
 * - Simple genre filters
 * - Clean condition options
 * - Availability toggle
 * - Active filter badge
 */

import type { Community } from '@repo/api-client';
import { Card } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { Switch } from '@repo/ui/components/switch';
import {
  SlidersHorizontal,
  X,
  Users,
} from '@repo/ui/components/icons';
import { BOOK_GENRES, BOOK_CONDITIONS } from '../../lib/constants/book';

interface BookFiltersProps {
  searchQuery: string;
  genreFilter: string;
  conditionFilter: string;
  availableOnly: boolean;
  communityFilter: string;
  userCommunities: Community[];
  onSearchChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onAvailableOnlyChange: (value: boolean) => void;
  onCommunityChange: (value: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function BookFilters({
  searchQuery,
  genreFilter,
  conditionFilter,
  availableOnly,
  communityFilter,
  userCommunities,
  onGenreChange,
  onConditionChange,
  onAvailableOnlyChange,
  onCommunityChange,
  onClearFilters,
  activeFilterCount,
}: BookFiltersProps) {
  return (
    <Card className="border-2 overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Filters
              </h2>
              <p className="text-xs text-muted-foreground">
                Refine your search
              </p>
            </div>
          </div>

          {/* Active Filter Count Badge */}
          {activeFilterCount > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {activeFilterCount}
            </Badge>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Community Filter */}
        {userCommunities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                Community
              </h3>
            </div>

            <div className="space-y-2">
              {/* All Books */}
              <button
                onClick={() => onCommunityChange('all')}
                className={`w-full text-left px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                  communityFilter === 'all'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                All Books
              </button>

              {/* My Communities */}
              <button
                onClick={() => onCommunityChange('my-communities')}
                className={`w-full text-left px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                  communityFilter === 'my-communities'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                My Communities
              </button>

              {/* Individual Communities */}
              {userCommunities.map((community) => (
                <button
                  key={community.id}
                  onClick={() => onCommunityChange(community.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    communityFilter === community.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {community.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Availability Toggle */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Availability
          </h3>

          <div className="flex items-center justify-between p-3 rounded-lg border-2 border-border bg-muted/30">
            <span className="text-sm font-medium text-foreground">
              Available Only
            </span>
            <Switch
              checked={availableOnly}
              onCheckedChange={onAvailableOnlyChange}
            />
          </div>
        </div>

        {/* Genre Filters */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Genre
          </h3>

          <div className="space-y-2">
            {/* All Genres */}
            <button
              onClick={() => onGenreChange('all')}
              className={`w-full text-left px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                genreFilter === 'all'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              All Genres
            </button>

            {/* Genre List */}
            {BOOK_GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => onGenreChange(genre)}
                className={`w-full text-left px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                  genreFilter === genre
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Condition Filters */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Condition
          </h3>

          <div className="space-y-2">
            {/* All Conditions */}
            <button
              onClick={() => onConditionChange('all')}
              className={`w-full text-left px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                conditionFilter === 'all'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              All Conditions
            </button>

            {/* Condition Options */}
            {BOOK_CONDITIONS.map((condition) => (
              <button
                key={condition}
                onClick={() => onConditionChange(condition)}
                className={`w-full text-left px-3 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-colors ${
                  conditionFilter === condition
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {condition}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <>
            <div className="h-px bg-border" />
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="w-full font-semibold"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </>
        )}

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="pt-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Active Filters
            </p>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchQuery}"
                </Badge>
              )}
              {communityFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {communityFilter === 'my-communities'
                    ? 'My Communities'
                    : userCommunities.find(c => c.id === communityFilter)?.name || 'Community'}
                </Badge>
              )}
              {genreFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {genreFilter}
                </Badge>
              )}
              {conditionFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {conditionFilter}
                </Badge>
              )}
              {availableOnly && (
                <Badge variant="secondary" className="text-xs">
                  Available
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
