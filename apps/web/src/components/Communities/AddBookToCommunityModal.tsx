/**
 * AddBookToCommunityModal - Modal for adding books to a community
 *
 * Features:
 * - Shows user's books that aren't already in the community
 * - Multi-select with checkboxes
 * - Search/filter books
 * - Loading states
 */

import { useState } from 'react';
import type { Book, Community } from '@repo/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Checkbox } from '@repo/ui/components/checkbox';
import { Loader2, Search, BookOpen } from '@repo/ui/components/icons';
import { useAddBookToCommunity } from '../../hooks/useCommunities';
import { ImageWithFallback } from '../ImageWithFallback';

interface AddBookToCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: Community;
  userBooks: Book[];
  communityBookIds: string[];
  onSuccess: () => void;
}

export function AddBookToCommunityModal({
  open,
  onOpenChange,
  community,
  userBooks,
  communityBookIds,
  onSuccess,
}: AddBookToCommunityModalProps) {
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const addBookMutation = useAddBookToCommunity();

  // Filter books that aren't already in the community
  const availableBooks = userBooks.filter((book) => !communityBookIds.includes(book.id));

  // Filter by search query
  const filteredBooks = availableBooks.filter((book) => {
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.genre?.toLowerCase().includes(query)
    );
  });

  const toggleBook = (bookId: string) => {
    setSelectedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handleAddBooks = async () => {
    if (selectedBookIds.length === 0) return;

    try {
      // Add all selected books in parallel
      await Promise.all(
        selectedBookIds.map((bookId) =>
          addBookMutation.mutateAsync({
            bookId,
            communityId: community.id,
          })
        )
      );

      setSelectedBookIds([]);
      setSearchQuery('');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to add books:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Books to {community.name}</DialogTitle>
          <DialogDescription>
            Select books from your library to share with this community.
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Book List */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px] max-h-[400px]">
          {filteredBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {availableBooks.length === 0
                  ? 'All your books are already in this community'
                  : 'No books match your search'}
              </p>
            </div>
          ) : (
            filteredBooks.map((book) => (
              <div
                key={book.id}
                className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => toggleBook(book.id)}
              >
                <Checkbox
                  checked={selectedBookIds.includes(book.id)}
                  onCheckedChange={() => toggleBook(book.id)}
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded border border-border">
                  <ImageWithFallback
                    src={book.cover_image_url || ''}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate">{book.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                  {book.genre && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary">
                      {book.genre}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {selectedBookIds.length} book{selectedBookIds.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedBookIds([]);
                  setSearchQuery('');
                  onOpenChange(false);
                }}
                disabled={addBookMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddBooks}
                disabled={selectedBookIds.length === 0 || addBookMutation.isPending}
              >
                {addBookMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  `Add ${selectedBookIds.length > 0 ? selectedBookIds.length : ''} Book${selectedBookIds.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
