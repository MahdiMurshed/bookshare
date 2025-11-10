


import type { Book } from '../pages/MyLibrary';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { ImageWithFallback } from './ImageWithFallback';

interface BookPreviewProps {
  book: Book;
}

export function BookPreview({ book }: BookPreviewProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[2/3] overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <Badge variant="secondary" className="mb-2">
          {book.genre}
        </Badge>
        <h3 className="text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-gray-600">{book.author}</p>
      </div>
    </Card>
  );
}
