/**
 * CommunityBooksTab - Display books in a community
 *
 * Features:
 * - Grid of books in the community
 * - Add Book button for members
 * - Empty state
 * - Loading state
 * - Click to view book details
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Community, BookWithOwner } from '@repo/api-client';
import { Loader2, BookOpen, Plus } from '@repo/ui/components/icons';
import { Button } from '@repo/ui/components/button';
import { useCommunityBooks } from '../../hooks/useCommunities';
import { useBooks } from '../../hooks/useBooks';
import { useAuth } from '../../contexts/AuthContext';
import { BookCard } from '../Browse/BookCard';
import { AddBookToCommunityModal } from './AddBookToCommunityModal';

interface CommunityBooksTabProps {
  communityId: string;
  community: Community;
  isMember: boolean;
}

export function CommunityBooksTab({ communityId, community, isMember }: CommunityBooksTabProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAddBookModal, setShowAddBookModal] = useState(false);

  const { data: books = [], isLoading, refetch } = useCommunityBooks(communityId);
  const { data: userBooks = [] } = useBooks(user?.id);

  const handleBookClick = (book: BookWithOwner) => {
    navigate(`/books/${book.id}`);
  };

  const handleAddBookSuccess = () => {
    refetch();
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
      <>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="rounded-full bg-muted p-6 mb-6">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No books yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            No books have been added to this community yet. Members can add their books to share with the
            community.
          </p>
          {isMember && user && (
            <Button onClick={() => setShowAddBookModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Book
            </Button>
          )}
        </div>

        {isMember && user && (
          <AddBookToCommunityModal
            open={showAddBookModal}
            onOpenChange={setShowAddBookModal}
            community={community}
            userBooks={userBooks}
            communityBookIds={[]}
            onSuccess={handleAddBookSuccess}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {books.length} {books.length === 1 ? 'book' : 'books'} in this community
          </p>
          {isMember && user && (
            <Button onClick={() => setShowAddBookModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Books
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onClick={handleBookClick} />
          ))}
        </div>
      </div>

      {isMember && user && (
        <AddBookToCommunityModal
          open={showAddBookModal}
          onOpenChange={setShowAddBookModal}
          community={community}
          userBooks={userBooks}
          communityBookIds={books.map((b) => b.id)}
          onSuccess={handleAddBookSuccess}
        />
      )}
    </>
  );
}
