import { useState, useMemo } from 'react';
import { AddBookForm } from '../components/Forms/AddBookForm';
import { BookPreview } from '../components/BookPreview';
import { EditBookModal } from '../components/modals/EditBookModal';
import { DeleteBookModal } from '../components/modals/DeleteBookModal';
import { BookOpen, Plus, AlertCircle, Library, Share2, BookMarked } from '@repo/ui/components/icons';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';
import { PageContainer } from '@repo/ui/components/page-container';
import { PageHeader } from '@repo/ui/components/page-header';
import { type Book } from '@repo/api-client';
import { useBooks } from '../hooks/useBooks';
import { useAuth } from '../contexts/AuthContext';

export default function MyLibrary() {
  const { user } = useAuth();
  const { data: books = [], isLoading, error, refetch } = useBooks(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  // Calculate collection statistics
  const stats = useMemo(() => {
    const totalBooks = books.length;
    const shareableBooks = books.filter((book) => book.borrowable).length;
    // TODO: Add borrowed out count when borrow tracking is implemented
    const borrowedOut = 0;

    return { totalBooks, shareableBooks, borrowedOut };
  }, [books]);

  const handleAddBookSuccess = () => {
    setShowForm(false);
  };

  const handleEditSuccess = () => {
    setEditingBook(null);
  };

  const handleDeleteSuccess = () => {
    setDeletingBook(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageContainer maxWidth="xl">
        {/* Page Header */}
        <PageHeader
          title="My Collection"
          description="Manage your personal library and share books with the community"
          icon={Library}
          actions={
            !showForm &&
            !isLoading && (
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                variant="default"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Book
              </Button>
            )
          }
        />

        {/* Add Book Form */}
        {showForm && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <AddBookForm
              onSubmit={handleAddBookSuccess}
              onCancel={() => setShowForm(false)}
              userId={user?.id}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && !showForm && (
          <div className="space-y-8">
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-4 w-20 mb-4" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </Card>
              ))}
            </div>

            {/* Books Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[2/3] w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-2 border-destructive/50">
            <div className="p-8 text-center">
              <div className="inline-flex p-4 rounded-full bg-muted border-2 border-border mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Failed to load your collection
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Collection Stats & Books Grid */}
        {!isLoading && !error && books.length > 0 && (
          <div className="space-y-8">
            {/* Collection Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Total Books */}
              <Card className="border-2 border-border hover:border-primary transition-colors duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <BookMarked className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Total Books
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.totalBooks}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stats.totalBooks === 1 ? 'Book' : 'Books'} in Collection
                  </div>
                </div>
              </Card>

              {/* Shareable Books */}
              <Card className="border-2 border-border hover:border-primary transition-colors duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Share2 className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Shareable
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.shareableBooks}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Available to Share
                  </div>
                </div>
              </Card>

              {/* Borrowed Out */}
              <Card className="border-2 border-border hover:border-primary transition-colors duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Borrowed
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.borrowedOut}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Currently Borrowed
                  </div>
                </div>
              </Card>
            </div>

            {/* Books Grid */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
                <span>Your Books</span>
                <span className="text-muted-foreground text-lg font-normal">
                  ({books.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => (
                  <BookPreview
                    key={book.id}
                    book={book}
                    onEdit={setEditingBook}
                    onDelete={setDeletingBook}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && books.length === 0 && !showForm && (
          <Card className="border-2 border-border">
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              {/* Icon */}
              <div className="mb-8 p-6 rounded-full bg-muted border-2 border-border">
                <Library className="h-12 w-12 text-muted-foreground" />
              </div>

              {/* Text Content */}
              <div className="space-y-3 mb-8 max-w-md">
                <h3 className="text-2xl font-bold text-foreground">
                  Start Your Collection
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your library is waiting to be filled with stories. Add your first book and
                  start building a collection you'll be proud to share.
                </p>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                variant="default"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Book
              </Button>
            </div>
          </Card>
        )}
      </PageContainer>

      {/* Edit Book Modal */}
      <EditBookModal
        book={editingBook}
        open={!!editingBook}
        onOpenChange={(open) => !open && setEditingBook(null)}
        onSuccess={handleEditSuccess}
        userId={user?.id}
      />

      {/* Delete Book Modal */}
      <DeleteBookModal
        book={deletingBook}
        open={!!deletingBook}
        onOpenChange={(open) => !open && setDeletingBook(null)}
        onSuccess={handleDeleteSuccess}
        userId={user?.id}
      />
    </div>
  );
}
