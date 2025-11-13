import type { BookWithOwner } from '@repo/api-client';
import { BookCard } from './BookCard';

interface BookGridProps {
  books: BookWithOwner[];
  onBookClick: (book: BookWithOwner) => void;
  title: string;
}

export function BookGrid({ books, onBookClick, title }: BookGridProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onClick={onBookClick} />
        ))}
      </div>
    </div>
  );
}
