import type { BookWithOwner } from '@repo/api-client';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { ImageWithFallback } from '../ImageWithFallback';
import { User } from '@repo/ui/components/icons';

interface BookCardProps {
  book: BookWithOwner;
  onClick: (book: BookWithOwner) => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  return (
    <Card
      className="group overflow-hidden cursor-pointer border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={() => onClick(book)}
    >
      {/* Book Cover */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <ImageWithFallback
          src={book.cover_image_url || ''}
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Genre Badge - Positioned on Cover */}
        {book.genre && (
          <div className="absolute left-3 top-3">
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-sm text-xs font-medium shadow-sm"
            >
              {book.genre}
            </Badge>
          </div>
        )}

        {/* Availability Badge */}
        {book.borrowable && (
          <div className="absolute right-3 top-3">
            <Badge
              className="bg-success/90 text-success-foreground backdrop-blur-sm text-xs font-medium shadow-sm"
            >
              Available
            </Badge>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4 space-y-3">
        {/* Title & Author */}
        <div className="space-y-1">
          <h3 className="font-semibold text-base leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            {book.author}
          </p>
        </div>

        {/* Condition */}
        {book.condition && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Condition:</span>{' '}
            <span className="capitalize">{book.condition}</span>
          </p>
        )}

        {/* Owner Info */}
        {book.owner && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            {book.owner.avatar_url ? (
              <img
                src={book.owner.avatar_url}
                alt={book.owner.name}
                className="h-6 w-6 rounded-full object-cover ring-2 ring-background"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center ring-2 ring-background">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {book.owner.name}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
