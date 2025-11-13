import type { BookWithOwner } from '@repo/api-client';
import { Badge } from '@repo/ui/components/badge';
import { ImageWithFallback } from '../ImageWithFallback';

interface BookInfoProps {
  book: BookWithOwner;
}

export function BookInfo({ book }: BookInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Book Cover */}
      <div className="md:col-span-1">
        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-gray-100 shadow-lg">
          <ImageWithFallback
            src={book.cover_image_url || ''}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Book Details */}
      <div className="md:col-span-2">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {book.genre && (
            <Badge variant="secondary" className="text-sm">
              {book.genre}
            </Badge>
          )}
          {book.borrowable ? (
            <Badge variant="default" className="text-sm">
              Available to Borrow
            </Badge>
          ) : (
            <Badge variant="outline" className="text-sm">
              Not Available
            </Badge>
          )}
          <Badge variant="outline" className="text-sm capitalize">
            Condition: {book.condition}
          </Badge>
        </div>

        {/* Description */}
        {book.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">{book.description}</p>
          </div>
        )}

        {/* Additional Details */}
        <div className="mb-6 space-y-2">
          {book.isbn && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold">ISBN:</span> {book.isbn}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
