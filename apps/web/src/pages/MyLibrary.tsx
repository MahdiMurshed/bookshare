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
    <div
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-background dark:via-background dark:to-background"
      style={{ fontFamily: '"Outfit", sans-serif' }}
    >
      <PageContainer maxWidth="xl">
        {/* Page Header */}
        <PageHeader
          title="My Collection"
          description="Your personal library - a curated collection of stories, knowledge, and adventures"
          icon={Library}
          actions={
            !showForm &&
            !isLoading && (
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
          <div className="relative group animate-in fade-in zoom-in-95 duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-2xl" />
            <Card className="relative border-red-200 dark:border-red-800/50">
              <div className="p-8 text-center">
                <div className="inline-flex p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">
                  Failed to load your collection
                </h3>
                <p className="text-red-700 dark:text-red-400 mb-6 max-w-md mx-auto">
                  {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
                </p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Try Again
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Collection Stats & Books Grid */}
        {!isLoading && !error && books.length > 0 && (
          <div className="space-y-8">
            {/* Collection Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Total Books */}
              <Card
                className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                      <BookMarked className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {stats.totalBooks}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stats.totalBooks === 1 ? 'Book' : 'Books'} in Collection
                  </div>
                </div>
              </Card>

              {/* Shareable Books */}
              <Card
                className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                      <Share2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {stats.shareableBooks}
                  </div>
                  <div className="text-sm text-muted-foreground">Available to Share</div>
                </div>
              </Card>

              {/* Borrowed Out */}
              <Card
                className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {stats.borrowedOut}
                  </div>
                  <div className="text-sm text-muted-foreground">Currently Borrowed</div>
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
                {books.map((book, index) => (
                  <div
                    key={book.id}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{
                      animationDelay: `${Math.min(index * 50, 800)}ms`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    <BookPreview
                      book={book}
                      onEdit={setEditingBook}
                      onDelete={setDeletingBook}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && books.length === 0 && !showForm && (
          <div className="relative group animate-in fade-in zoom-in-95 duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-orange-100/50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-3xl blur-2xl" />
            <Card className="relative border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                {/* Icon with glow effect */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-amber-500/20 dark:bg-amber-500/10 blur-3xl rounded-full scale-150" />
                  <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full p-8 border border-amber-200 dark:border-amber-800/50">
                    <Library className="h-16 w-16 text-amber-600 dark:text-amber-500" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4 mb-8 max-w-md">
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
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Add Your First Book
                </Button>
              </div>
            </Card>
          </div>
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
