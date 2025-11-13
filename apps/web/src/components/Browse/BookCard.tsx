import type { BookWithOwner } from '@repo/api-client';
import { BookPreview } from '../BookPreview';
import { User } from '@repo/ui/components/icons';

interface BookCardProps {
  book: BookWithOwner;
  onClick: (book: BookWithOwner) => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  return (
    <div className="cursor-pointer" onClick={() => onClick(book)}>
      <BookPreview book={book} />

      {/* Owner Info */}
      {book.owner && (
        <div className="mt-2 flex items-center gap-2 px-2">
          {book.owner.avatar_url ? (
            <img
              src={book.owner.avatar_url}
              alt={book.owner.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center">
              <User className="w-3 h-3 text-indigo-700" />
            </div>
          )}
          <span className="text-sm text-gray-600">
            Owned by {book.owner.name}
          </span>
        </div>
      )}
    </div>
  );
}
