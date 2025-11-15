/**
 * AdminBooksTab Component
 *
 * Book management table for the admin dashboard
 * Features search, filtering, and beautiful styling
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllBooks,
  adminDeleteBook as deleteBook,
  adminUpdateBook as updateBook,
  flagBook,
  unflagBook,
} from '@repo/api-client';
import type { AdminBookFilters as BookFilters, BookWithOwner, AdminUpdateBookInput as UpdateBookInput } from '@repo/api-client';
import { Search, BookOpen, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { BookActionsMenu } from './BookActionsMenu';
import { EditBookDialog } from './EditBookDialog';
import { FlagBookDialog } from './FlagBookDialog';
import { ViewFlaggedDialog } from './ViewFlaggedDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { Card } from '@repo/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { Input } from '@repo/ui/components/input';
import { Badge } from '@repo/ui/components/badge';
import { Skeleton } from '@repo/ui/components/skeleton';
import { format } from 'date-fns';

const CONDITION_COLORS = {
  excellent: 'bg-primary/10 text-primary border-primary/20',
  good: 'bg-muted text-foreground border-border',
  fair: 'bg-muted text-muted-foreground border-border',
  poor: 'bg-muted text-muted-foreground border-border',
};

export function AdminBooksTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<BookFilters>({
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Dialog states
  const [selectedBook, setSelectedBook] = useState<BookWithOwner | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showViewFlagDialog, setShowViewFlagDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: books, isLoading, error } = useQuery({
    queryKey: ['admin-books', search, filters],
    queryFn: () =>
      getAllBooks({
        ...filters,
        search: search || undefined,
      }),
  });

  // Mutation for editing book
  const editBookMutation = useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: UpdateBookInput }) =>
      updateBook(bookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      setShowEditDialog(false);
      setSelectedBook(null);
    },
  });

  // Mutation for deleting book
  const deleteBookMutation = useMutation({
    mutationFn: (bookId: string) => deleteBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      setShowDeleteDialog(false);
      setSelectedBook(null);
    },
  });

  // Mutation for flagging book
  const flagBookMutation = useMutation({
    mutationFn: ({ bookId, reason }: { bookId: string; reason: string }) =>
      flagBook(bookId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      setShowFlagDialog(false);
      setSelectedBook(null);
    },
  });

  // Mutation for unflagging book
  const unflagBookMutation = useMutation({
    mutationFn: (bookId: string) => unflagBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      setShowViewFlagDialog(false);
      setSelectedBook(null);
    },
  });

  // Handle book actions
  const handleBookAction = (action: string, book: BookWithOwner) => {
    setActionError(null);
    setSelectedBook(book);

    switch (action) {
      case 'edit':
        setShowEditDialog(true);
        break;
      case 'flag':
        setShowFlagDialog(true);
        break;
      case 'unflag':
        unflagBookMutation.mutate(book.id);
        break;
      case 'view-flag':
        setShowViewFlagDialog(true);
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
    }
  };

  const handleEditBook = async (data: UpdateBookInput) => {
    if (!selectedBook) return;
    await editBookMutation.mutateAsync({ bookId: selectedBook.id, data });
  };

  const handleFlagBook = async (reason: string) => {
    if (!selectedBook) return;
    await flagBookMutation.mutateAsync({ bookId: selectedBook.id, reason });
  };

  const handleUnflagBook = async () => {
    if (!selectedBook) return;
    await unflagBookMutation.mutateAsync(selectedBook.id);
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;
    await deleteBookMutation.mutateAsync(selectedBook.id);
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {actionError && (
        <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive font-medium">{actionError}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: prev.sortBy === 'title' ? 'created_at' : 'title',
                }))
              }
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
            >
              Sort by {filters.sortBy === 'title' ? 'Date' : 'Title'}
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
                }))
              }
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
            >
              {filters.sortOrder === 'asc' ? 'Z-A' : 'A-Z'}
            </button>
          </div>
        </div>
      </Card>

      {/* Books Table */}
      <Card className="overflow-hidden">
        {error ? (
          <div className="p-6">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">Failed to load books</p>
            </div>
          </div>
        ) : isLoading || !books ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-16 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No books found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Book</TableHead>
                <TableHead className="font-semibold">Owner</TableHead>
                <TableHead className="font-semibold">Genre</TableHead>
                <TableHead className="font-semibold">Condition</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Added</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow
                  key={book.id}
                  className="group hover:bg-accent/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="w-12 h-16 rounded object-cover border border-border group-hover:border-primary/50 transition-colors shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-16 rounded bg-primary/10 flex items-center justify-center border-2 border-border group-hover:border-primary transition-colors">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">
                          {book.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {book.author}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {book.owner?.name || 'Unknown'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {book.genre ? (
                      <Badge variant="outline" className="font-normal">
                        {book.genre}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No genre
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={CONDITION_COLORS[book.condition]}
                    >
                      {book.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {book.borrowable ? (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm">Not available</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(book.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <BookActionsMenu book={book} onAction={handleBookAction} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {books && books.length > 0 && (
          <div className="px-6 py-4 border-t border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Showing {books.length} book{books.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <EditBookDialog
        book={selectedBook}
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedBook(null);
        }}
        onSave={handleEditBook}
      />

      <FlagBookDialog
        book={selectedBook}
        open={showFlagDialog}
        onClose={() => {
          setShowFlagDialog(false);
          setSelectedBook(null);
        }}
        onConfirm={handleFlagBook}
      />

      <ViewFlaggedDialog
        book={selectedBook}
        open={showViewFlagDialog}
        onClose={() => {
          setShowViewFlagDialog(false);
          setSelectedBook(null);
        }}
        onUnflag={handleUnflagBook}
      />

      <ConfirmDialog
        title="Delete Book"
        description={`Are you sure you want to delete "${selectedBook?.title}" by ${selectedBook?.author}? This action cannot be undone and will remove all associated borrow requests and reviews.`}
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedBook(null);
        }}
        onConfirm={handleDeleteBook}
        variant="destructive"
      />
    </div>
  );
}
