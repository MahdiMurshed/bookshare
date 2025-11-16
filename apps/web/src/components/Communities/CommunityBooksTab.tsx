/**
 * CommunityBooksTab - Display books in a community
 *
 * Features:
 * - Grid of books in the community
 * - Empty state
 * - Loading state
 * - Click to view book details
 */

import { useNavigate } from 'react-router-dom';
import type { Book } from '@repo/api-client';
import { Loader2, BookOpen } from '@repo/ui/components/icons';
import { Button } from '@repo/ui/components/button';
import { useCommunityBooks } from '../../hooks/useCommunities';
import { BookCard } from '../Browse/BookCard';

interface CommunityBooksTabProps {
  communityId: string;
}

export function CommunityBooksTab({ communityId }: CommunityBooksTabProps) {
  const navigate = useNavigate();
  const { data: books = [], isLoading } = useCommunityBooks(communityId);

  const handleBookClick = (book: any) => {
    navigate(`/books/${book.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-full bg-muted p-6 mb-6">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No books yet</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          No books have been added to this community yet. Members can add their books to share with the
          community.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {books.length} {books.length === 1 ? 'book' : 'books'} in this community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book as any} onClick={handleBookClick} />
        ))}
      </div>
    </div>
  );
}
