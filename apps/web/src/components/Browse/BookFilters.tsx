/**
 * BookFilters Component - Refined Sidebar Filter Panel
 *
 * Premium glass morphism sidebar with:
 * - Pill-style genre filters
 * - Visual condition indicators
 * - Availability toggle
 * - Active filter count badge
 */

import { Card } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { Switch } from '@repo/ui/components/switch';
import {
  SlidersHorizontal,
  Sparkles,
  Star,
  CheckCircle2,
  XCircle,
} from '@repo/ui/components/icons';
import { BOOK_GENRES, BOOK_CONDITIONS } from '../../lib/constants/book';

interface BookFiltersProps {
  searchQuery: string;
  genreFilter: string;
  conditionFilter: string;
  availableOnly: boolean;
  onSearchChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onAvailableOnlyChange: (value: boolean) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

// Condition visual indicators
const conditionConfig = {
  excellent: { color: 'text-green-600', bg: 'bg-green-50', icon: Star, label: 'Excellent' },
  good: { color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle2, label: 'Good' },
  fair: { color: 'text-amber-600', bg: 'bg-amber-50', icon: Star, label: 'Fair' },
  poor: { color: 'text-gray-600', bg: 'bg-gray-50', icon: XCircle, label: 'Poor' },
};

export function BookFilters({
  searchQuery,
  genreFilter,
  conditionFilter,
  availableOnly,
  onGenreChange,
  onConditionChange,
  onAvailableOnlyChange,
  onClearFilters,
  activeFilterCount,
}: BookFiltersProps) {
  return (
    <>
      {/* Custom Styles */}
      <style>{`
        .filter-glass {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(251, 146, 60, 0.15);
          box-shadow:
            0 8px 32px rgba(251, 146, 60, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .genre-pill {
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .genre-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(251, 146, 60, 0.15);
        }

        .genre-pill-active {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);
        }

        .condition-btn {
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .condition-btn:hover {
          transform: translateX(4px);
        }

        .condition-btn-active {
          border-color: currentColor;
          background: currentColor;
          color: white;
          font-weight: 600;
        }
      `}</style>

      <Card className="filter-glass overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
                <SlidersHorizontal className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-foreground">
                  Refine Search
                </h2>
                <p className="text-xs text-muted-foreground">
                  Filter your results
                </p>
              </div>
            </div>

            {/* Active Filter Count Badge */}
            {activeFilterCount > 0 && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-md">
                {activeFilterCount}
              </Badge>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

          {/* Availability Toggle */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-foreground">
                Availability
              </h3>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-900">
                  Available Only
                </span>
              </div>
              <Switch
                checked={availableOnly}
                onCheckedChange={onAvailableOnlyChange}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>

          {/* Genre Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-foreground">
                Genre
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* All Genres Pill */}
              <button
                onClick={() => onGenreChange('all')}
                className={`genre-pill px-3 py-1.5 rounded-full text-xs border transition-all ${
                  genreFilter === 'all'
                    ? 'genre-pill-active'
                    : 'bg-white border-amber-200 text-foreground hover:border-amber-300'
                }`}
              >
                All Genres
              </button>

              {/* Genre Pills */}
              {BOOK_GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => onGenreChange(genre)}
                  className={`genre-pill px-3 py-1.5 rounded-full text-xs border transition-all ${
                    genreFilter === genre
                      ? 'genre-pill-active'
                      : 'bg-white border-amber-200 text-foreground hover:border-amber-300'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-foreground">
                Condition
              </h3>
            </div>

            <div className="space-y-2">
              {/* All Conditions Option */}
              <button
                onClick={() => onConditionChange('all')}
                className={`condition-btn w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  conditionFilter === 'all'
                    ? 'border-amber-500 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                    : 'border-gray-200 bg-white hover:border-amber-300'
                }`}
              >
                <span className="text-sm font-medium">All Conditions</span>
                {conditionFilter === 'all' && (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </button>

              {/* Condition Options */}
              {BOOK_CONDITIONS.map((condition) => {
                const config = conditionConfig[condition];
                const Icon = config.icon;
                const isActive = conditionFilter === condition;

                return (
                  <button
                    key={condition}
                    onClick={() => onConditionChange(condition)}
                    className={`condition-btn w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                      isActive
                        ? `condition-btn-active border-current ${config.color}`
                        : `border-gray-200 ${config.bg} hover:border-current ${config.color}`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : config.color}`} />
                      <span className={`text-sm font-medium capitalize ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {config.label}
                      </span>
                    </div>
                    {isActive && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
              <Button
                onClick={onClearFilters}
                variant="outline"
                className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:from-amber-100 hover:to-orange-100 hover:border-amber-300 text-amber-900 font-semibold shadow-sm"
              >
                <XCircle className="h-4 w-4 mr-2" />
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
                {genreFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Genre: {genreFilter}
                  </Badge>
                )}
                {conditionFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    Condition: {conditionFilter}
                  </Badge>
                )}
                {availableOnly && (
                  <Badge variant="secondary" className="text-xs">
                    Available Only
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Decorative Footer Gradient */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
      </Card>
    </>
  );
}
