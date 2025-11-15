/**
 * EmptyState Component - Refined Empty States
 *
 * Features:
 * - Beautiful illustrations with floating animations
 * - Contextual messages
 * - Warm gradient backgrounds
 * - Clear call-to-action
 */

import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { BookOpen, SearchX, Sparkles } from '@repo/ui/components/icons';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <>
      {/* Custom Styles */}
      <style>{`
        @keyframes gentle-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .empty-illustration {
          animation: gentle-float 4s ease-in-out infinite;
        }

        .glow-effect {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>

      <Card className="border-border/30 bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-amber-50/30 backdrop-blur-sm overflow-hidden">
        <div className="relative">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-10 left-10 glow-effect">
              <BookOpen className="h-32 w-32 text-amber-600" style={{ animationDelay: '0s' }} />
            </div>
            <div className="absolute bottom-10 right-10 glow-effect">
              <Sparkles className="h-24 w-24 text-orange-600" style={{ animationDelay: '1.5s' }} />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glow-effect">
              <BookOpen className="h-40 w-40 text-amber-500" style={{ animationDelay: '3s' }} />
            </div>
          </div>

          {/* Content */}
          <div className="relative flex flex-col items-center justify-center py-20 px-6 text-center">
            {/* Icon Illustration */}
            <div className="relative mb-8">
              {/* Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-20 blur-3xl rounded-full scale-150" />

              {/* Icon Container */}
              <div className="empty-illustration relative">
                <div className="bg-gradient-to-br from-white to-amber-50/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-amber-200/50">
                  {hasFilters ? (
                    <SearchX className="h-20 w-20 text-amber-600" />
                  ) : (
                    <BookOpen className="h-20 w-20 text-amber-600" />
                  )}
                </div>
              </div>

              {/* Decorative Sparkles */}
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -left-2">
                <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-4 mb-8 max-w-lg">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                {hasFilters ? 'No Books Found' : 'No Books Available Yet'}
              </h3>

              <div className="h-1 w-16 mx-auto bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-full" />

              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {hasFilters ? (
                  <>
                    We couldn't find any books matching your search criteria.
                    <br className="hidden sm:block" />
                    Try adjusting your filters or search terms to discover more books.
                  </>
                ) : (
                  <>
                    There are no books available for borrowing at the moment.
                    <br className="hidden sm:block" />
                    Check back soon as our community adds new books to share!
                  </>
                )}
              </p>
            </div>

            {/* Action Button */}
            {hasFilters ? (
              <Button
                onClick={onClearFilters}
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                <SearchX className="h-5 w-5 mr-2" />
                Clear All Filters
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-amber-200 hover:bg-amber-50 hover:border-amber-300 text-amber-900 font-semibold"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Browse All Books
                </Button>
              </div>
            )}

            {/* Helper Text */}
            <p className="text-xs text-muted-foreground mt-8 flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Tip: New books are added daily by our community members
            </p>
          </div>
        </div>

        {/* Decorative Footer Gradient */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
      </Card>
    </>
  );
}
