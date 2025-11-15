/**
 * BookCard Component - Clean Book Display Card
 *
 * Features:
 * - Minimal border design
 * - Clean hover effects
 * - Simple genre/availability badges
 * - Owner display
 */

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
      className="group overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={() => onClick(book)}
    >
      {/* Book Cover */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <ImageWithFallback
          src={book.cover_image_url || ''}
          alt={book.title}
          className="h-full w-full object-cover"
        />

        {/* Availability Badge - Top */}
        <div className="absolute left-3 top-3 z-10">
          {book.borrowable ? (
            <Badge className="bg-green-500 text-white border-0 shadow-md text-xs font-semibold">
              Available
            </Badge>
          ) : (
            <Badge className="bg-muted text-muted-foreground border-0 shadow-md text-xs font-semibold">
              Borrowed
            </Badge>
          )}
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4 space-y-3">
        {/* Title & Author */}
        <div className="space-y-1.5">
          <h3 className="font-bold text-base leading-tight text-foreground line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            {book.author}
          </p>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          {/* Genre Badge */}
          {book.genre && (
            <Badge className="bg-primary/10 text-primary text-xs">
              {book.genre}
            </Badge>
          )}

          {/* Condition */}
          {book.condition && (
            <span className="text-xs text-muted-foreground capitalize">
              {book.condition}
            </span>
          )}
        </div>

        {/* Owner */}
        {book.owner && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="font-medium truncate">
              {book.owner.name}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
