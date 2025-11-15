import type { BookWithOwner } from '@repo/api-client';
import { StatusBadge } from '@repo/ui/components/status-badge';
import { Badge } from '@repo/ui/components/badge';
import { ImageWithFallback } from '../ImageWithFallback';

interface BookInfoProps {
  book: BookWithOwner;
}

export function BookInfo({ book }: BookInfoProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Book Cover - Magazine Hero */}
      <div className="lg:col-span-5">
        <div className="sticky top-8">
          <div className="group relative aspect-[2/3] overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-2xl shadow-amber-900/10 dark:shadow-amber-500/5 ring-1 ring-black/5 dark:ring-white/10 transition-all duration-500 hover:shadow-3xl hover:shadow-amber-900/20 dark:hover:shadow-amber-500/10 hover:-translate-y-1">
            <ImageWithFallback
              src={book.cover_image_url || ''}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-transparent dark:from-amber-600/30 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-400/10 to-transparent dark:from-orange-600/20 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Book Details - Editorial Layout */}
      <div className="lg:col-span-7 space-y-8">
        {/* Title & Author */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-px bg-gradient-to-r from-amber-600 to-transparent dark:from-amber-500 flex-1 mt-6" />
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight"
            style={{ fontFamily: '"Crimson Pro", serif' }}
          >
            {book.title}
          </h1>
          <p
            className="text-xl sm:text-2xl text-muted-foreground font-light tracking-wide"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          >
            by {book.author}
          </p>
        </div>

        {/* Status & Metadata Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {book.borrowable ? (
            <StatusBadge
              status="success"
              label="Available to Borrow"
              className="px-4 py-1.5 text-sm font-medium"
            />
          ) : (
            <StatusBadge
              status="warning"
              label="Not Available"
              className="px-4 py-1.5 text-sm font-medium"
            />
          )}
          {book.genre && (
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm font-medium bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300 border-0"
              style={{ fontFamily: '"Outfit", sans-serif' }}
            >
              {book.genre}
            </Badge>
          )}
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm font-medium capitalize border-border/50"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          >
            {book.condition} Condition
          </Badge>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center gap-4">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-500" />
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
        </div>

        {/* Description */}
        {book.description && (
          <div className="space-y-4">
            <h2
              className="text-2xl font-semibold text-foreground tracking-tight"
              style={{ fontFamily: '"Crimson Pro", serif' }}
            >
              About This Book
            </h2>
            <p
              className="text-base sm:text-lg text-muted-foreground leading-relaxed"
              style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 300 }}
            >
              {book.description}
            </p>
          </div>
        )}

        {/* Additional Details */}
        {book.isbn && (
          <div className="pt-6 border-t border-border/50">
            <dl className="space-y-3">
              <div className="flex items-baseline gap-3">
                <dt
                  className="text-sm font-semibold text-muted-foreground uppercase tracking-wider"
                  style={{ fontFamily: '"Outfit", sans-serif' }}
                >
                  ISBN
                </dt>
                <dd
                  className="text-sm font-mono text-foreground bg-muted px-3 py-1 rounded"
                >
                  {book.isbn}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
