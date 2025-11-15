/**
 * BookCard Component - Premium Book Display Card
 *
 * Features:
 * - Refined minimal design with professional polish
 * - Sophisticated hover effects with coordinated transitions
 * - Subtle availability dot indicator
 * - Impeccable spacing and typography hierarchy
 * - Inspired by high-end e-commerce and SaaS interfaces
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
      className="group relative overflow-hidden border border-border bg-background cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1"
      onClick={() => onClick(book)}
    >
      {/* Book Cover Container */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted border-b border-border">
        {/* Cover Image with Scale Effect */}
        <div className="h-full w-full transition-transform duration-300 group-hover:scale-105">
          <ImageWithFallback
            src={book.cover_image_url || ''}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Subtle Gradient Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />

        {/* Availability Dot Indicator - Minimal & Refined */}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2 bg-background/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-border shadow-sm">
          <div
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              book.borrowable
                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                : 'bg-muted-foreground/40'
            }`}
          />
          <span className="text-[10px] font-medium tracking-wide uppercase text-muted-foreground">
            {book.borrowable ? 'Available' : 'Borrowed'}
          </span>
        </div>
      </div>

      {/* Book Info Section - Enhanced Spacing & Hierarchy */}
      <div className="p-5 space-y-4">
        {/* Title & Author - Primary Information */}
        <div className="space-y-2">
          <h3 className="font-semibold text-base leading-snug text-foreground line-clamp-2 tracking-tight">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground font-normal leading-relaxed">
            {book.author}
          </p>
        </div>

        {/* Metadata Section - Clean Divider */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between gap-3">
            {/* Genre Badge - Refined Styling */}
            {book.genre && (
              <Badge className="bg-primary/5 text-primary border border-primary/10 text-[11px] font-medium px-2.5 py-0.5 hover:bg-primary/10 transition-colors duration-200">
                {book.genre}
              </Badge>
            )}

            {/* Condition - Subtle Typography */}
            {book.condition && (
              <span className="text-[11px] text-muted-foreground/70 capitalize tracking-wide font-medium">
                {book.condition}
              </span>
            )}
          </div>
        </div>

        {/* Owner Info - Minimal Footer */}
        {book.owner && (
          <div className="flex items-center gap-2 pt-2">
            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted border border-border">
              <User className="h-2.5 w-2.5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground/80 font-medium truncate">
              {book.owner.name}
            </span>
          </div>
        )}
      </div>

      {/* Subtle Hover Accent - Top Border Highlight */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
