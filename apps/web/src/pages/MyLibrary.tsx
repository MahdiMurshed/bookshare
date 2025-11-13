import { useState, useEffect } from 'react';
import { AddBookForm } from '../components/Forms/AddBookForm';
import { BookPreview } from '../components/BookPreview';
import { EditBookModal } from '../components/modals/EditBookModal';
import { DeleteBookModal } from '../components/modals/DeleteBookModal';
import { BookOpen, Plus, Loader2, AlertCircle } from '@repo/ui/components/icons';
import { Button } from '@repo/ui/components/button';
import { getUserBooks, type Book } from '@repo/api-client';
import { useAuth } from '../contexts/AuthContext';

export default function MyLibrary() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  const fetchBooks = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const userBooks = await getUserBooks(user.id);
      setBooks(userBooks);
    } catch (err) {
      console.error('Failed to fetch books:', err);
      setError('Failed to load your books. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [user]);

  const handleAddBookSuccess = () => {
    setShowForm(false);
    fetchBooks();
  };

  const handleEditSuccess = () => {
    setEditingBook(null);
    fetchBooks();
  };

  const handleDeleteSuccess = () => {
    setDeletingBook(null);
    fetchBooks();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-indigo-900">My Book Library</h1>
          </div>
          {!showForm && !isLoading && (
            <Button onClick={() => setShowForm(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add New Book
            </Button>
          )}
        </div>

        {/* Add Book Form */}
        {showForm && (
          <div className="mb-8">
            <AddBookForm
              onSubmit={handleAddBookSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && !showForm && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading your books...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={fetchBooks} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Books Grid */}
        {!isLoading && !error && books.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">
              Your Books ({books.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        )}

        {/* Empty State */}
        {!isLoading && !error && books.length === 0 && !showForm && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No books yet</h3>
            <p className="text-gray-500 mb-6">Start building your library by adding your first book</p>
            <Button onClick={() => setShowForm(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Book
            </Button>
          </div>
        )}
      </div>

      {/* Edit Book Modal */}
      <EditBookModal
        book={editingBook}
        open={!!editingBook}
        onOpenChange={(open) => !open && setEditingBook(null)}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Book Modal */}
      <DeleteBookModal
        book={deletingBook}
        open={!!deletingBook}
        onOpenChange={(open) => !open && setDeletingBook(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
