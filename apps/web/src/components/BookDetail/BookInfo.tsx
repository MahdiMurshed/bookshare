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
      {/* Book Cover */}
      <div className="lg:col-span-5">
        <div className="group relative aspect-[2/3] overflow-hidden rounded-lg bg-muted border-2 border-border shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <ImageWithFallback
            src={book.cover_image_url || ''}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      {/* Book Details */}
      <div className="lg:col-span-7 space-y-6">
        {/* Title & Author */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
            {book.title}
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground">
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
              className="px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-0"
            >
              {book.genre}
            </Badge>
          )}
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm font-medium capitalize"
          >
            {book.condition} Condition
          </Badge>
        </div>

        {/* Description */}
        {book.description && (
          <div className="space-y-4 pt-6 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              About This Book
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {book.description}
            </p>
          </div>
        )}

        {/* Additional Details */}
        {book.isbn && (
          <div className="pt-6 border-t border-border">
            <dl className="space-y-3">
              <div className="flex items-baseline gap-3">
                <dt className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  ISBN
                </dt>
                <dd className="text-sm font-mono text-foreground bg-muted px-3 py-1 rounded">
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
