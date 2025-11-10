import { useState } from 'react';
import { AddBookForm } from '../components/Forms/AddBookForm';
import { BookPreview } from '../components/BookPreview';
import { BookOpen, Plus } from '@repo/ui/components/icons';
import { Button } from '@repo/ui/components/button';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverImage: string;
}

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleAddBook = (book: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...book,
      id: Date.now().toString(),
    };
    setBooks([newBook, ...books]);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-indigo-900">My Book Library</h1>
          </div>
          {!showForm && (
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
              onSubmit={handleAddBook}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Books Grid */}
        {books.length > 0 ? (
          <div>
            <h2 className="mb-6 text-gray-700">Your Books</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookPreview key={book.id} book={book} />
              ))}
            </div>
          </div>
        ) : (
          !showForm && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-600 mb-2">No books yet</h3>
              <p className="text-gray-500 mb-6">Start building your library by adding your first book</p>
              <Button onClick={() => setShowForm(true)} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Book
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
