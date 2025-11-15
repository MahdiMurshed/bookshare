
import type { Book } from '@repo/api-client';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ImageWithFallback } from './ImageWithFallback';
import { Pencil, Trash2 } from '@repo/ui/components/icons';

interface BookPreviewProps {
  book: Book;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

export function BookPreview({ book, onEdit, onDelete }: BookPreviewProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[2/3] overflow-hidden bg-muted relative group">
        <ImageWithFallback
          src={book.cover_image_url || ''}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        {(onEdit || onDelete) && (
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {onEdit && (
              <Button
                size="icon"
                variant="secondary"
                onClick={() => onEdit(book)}
                title="Edit book"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="destructive"
                onClick={() => onDelete(book)}
                title="Delete book"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {book.genre && (
            <Badge variant="secondary" className="text-xs">
              {book.genre}
            </Badge>
          )}
          {book.borrowable && (
            <Badge variant="default" className="text-xs">
              Available
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-sm text-muted-foreground">{book.author}</p>
        {book.condition && (
          <p className="text-xs text-muted-foreground/80 mt-2 capitalize">
            Condition: {book.condition}
          </p>
        )}
      </div>
    </Card>
  );
}
