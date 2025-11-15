/**
 * BookCard Component - Premium Book Display Card
 *
 * Features:
 * - Decorative frame with warm gradient borders
 * - Enhanced hover effects (lift, glow, scale)
 * - Quick view overlay on hover
 * - Genre/condition/availability badges
 * - Owner avatar display
 * - Smooth loading states
 */

import type { BookWithOwner } from '@repo/api-client';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { ImageWithFallback } from '../ImageWithFallback';
import { User, Eye, CheckCircle, Star, AlertCircle } from '@repo/ui/components/icons';

interface BookCardProps {
  book: BookWithOwner;
  onClick: (book: BookWithOwner) => void;
}

// Genre color mapping for visual variety
const genreColors = {
  'Fiction': 'from-purple-500 to-purple-600',
  'Non-Fiction': 'from-blue-500 to-blue-600',
  'Mystery': 'from-indigo-600 to-purple-700',
  'Science Fiction': 'from-cyan-500 to-blue-600',
  'Fantasy': 'from-pink-500 to-purple-600',
  'Romance': 'from-rose-500 to-pink-600',
  'Thriller': 'from-red-600 to-orange-700',
  'Biography': 'from-amber-600 to-orange-600',
  'History': 'from-stone-600 to-amber-700',
  'Self-Help': 'from-green-500 to-emerald-600',
  'Poetry': 'from-violet-500 to-purple-600',
  'Other': 'from-gray-500 to-gray-600',
};

// Condition indicators
const conditionConfig = {
  excellent: { icon: Star, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  good: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  fair: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  poor: { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
};

export function BookCard({ book, onClick }: BookCardProps) {
  const genreGradient = genreColors[book.genre as keyof typeof genreColors] || genreColors['Other'];
  const condition = book.condition || 'good';
  const conditionInfo = conditionConfig[condition as keyof typeof conditionConfig] || conditionConfig.good;
  const ConditionIcon = conditionInfo.icon;

  return (
    <>
      {/* Custom Styles */}
      <style>{`
        .book-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .book-card:hover {
          transform: translateY(-8px);
        }

        .book-card:hover .book-cover {
          transform: scale(1.05);
        }

        .book-card:hover .quick-view-overlay {
          opacity: 1;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .book-card:hover .book-frame {
          box-shadow:
            0 0 0 2px white,
            0 0 0 4px rgba(251, 146, 60, 0.5),
            0 20px 40px rgba(251, 146, 60, 0.3);
        }

        .book-cover {
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .quick-view-overlay {
          opacity: 0;
          transition: all 0.3s ease;
        }

        .book-frame {
          position: relative;
          background: linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.2) 100%);
          padding: 3px;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .book-frame::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 2px;
          background: linear-gradient(135deg, #f97316, #ea580c, #c2410c);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.3;
        }

        .owner-avatar {
          transition: all 0.2s ease;
        }

        .book-card:hover .owner-avatar {
          transform: scale(1.1);
        }
      `}</style>

      <div className="book-card">
        <Card className="overflow-hidden border-border/50 bg-card shadow-md">
          {/* Book Cover with Decorative Frame */}
          <div className="book-frame">
            <div className="relative aspect-[2/3] overflow-hidden bg-muted rounded-lg">
              <ImageWithFallback
                src={book.cover_image_url || ''}
                alt={book.title}
                className="book-cover h-full w-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/20" />

              {/* Quick View Overlay on Hover */}
              <div className="quick-view-overlay absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transform transition-transform hover:scale-105">
                  <Eye className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold text-foreground">Quick View</span>
                </div>
              </div>

              {/* Genre Badge - Top Left */}
              {book.genre && (
                <div className="absolute left-3 top-3 z-10">
                  <Badge className={`bg-gradient-to-r ${genreGradient} text-white border-0 shadow-lg text-xs font-semibold`}>
                    {book.genre}
                  </Badge>
                </div>
              )}

              {/* Availability Badge - Top Right */}
              <div className="absolute right-3 top-3 z-10">
                {book.borrowable ? (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg text-xs font-semibold flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    Available
                  </Badge>
                ) : (
                  <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-lg text-xs font-semibold">
                    Borrowed
                  </Badge>
                )}
              </div>

              {/* Owner Avatar - Bottom Right */}
              {book.owner && (
                <div className="absolute right-3 bottom-3 z-10">
                  <div className="owner-avatar">
                    {book.owner.avatar_url ? (
                      <img
                        src={book.owner.avatar_url}
                        alt={book.owner.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-lg"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center ring-2 ring-white shadow-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Book Info */}
          <div className="p-4 space-y-3" onClick={() => onClick(book)}>
            {/* Title & Author */}
            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-base leading-tight text-foreground line-clamp-2 group-hover:text-amber-600 transition-colors duration-200">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                by {book.author}
              </p>
            </div>

            {/* Metadata Row */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/30">
              {/* Condition Badge */}
              {book.condition && (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${conditionInfo.bg} ${conditionInfo.border} border`}>
                  <ConditionIcon className={`h-3 w-3 ${conditionInfo.color}`} />
                  <span className={`text-xs font-medium capitalize ${conditionInfo.color}`}>
                    {book.condition}
                  </span>
                </div>
              )}

              {/* Owner Name */}
              {book.owner && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                  <User className="h-3 w-3" />
                  <span className="font-medium truncate max-w-[100px]">
                    {book.owner.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
