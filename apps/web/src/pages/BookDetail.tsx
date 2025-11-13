import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle } from '@repo/ui/components/icons';
import { useBookDetail } from '../hooks/useBookDetail';
import { useBorrowRequest } from '../hooks/useBorrowRequest';
import { BookInfo } from '../components/BookDetail/BookInfo';
import { OwnerInfo } from '../components/BookDetail/OwnerInfo';
import { BorrowRequestSection } from '../components/BookDetail/BorrowRequestSection';

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const { data: book, isLoading, error } = useBookDetail(id);

  const borrowRequestMutation = useBorrowRequest({
    bookId: id || '',
    onSuccess: () => {
      setRequestSuccess(true);
      setShowRequestForm(false);
    },
  });

  const handleRequestBorrow = async (message: string) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    try {
      await borrowRequestMutation.mutateAsync(message);
    } catch (error) {
      console.error('Failed to create borrow request:', error);
    }
  };

  const handleShowForm = () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    setShowRequestForm(true);
  };

  const handleCancelForm = () => {
    setShowRequestForm(false);
  };

  const isOwnBook = user && book && book.owner_id === user.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-gray-600">Loading book details...</span>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-700">
              {error instanceof Error ? error.message : 'Book not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Success Message */}
        {requestSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700">
              Borrow request sent successfully! The owner will be notified.
            </p>
          </div>
        )}

        <Card className="overflow-hidden">
          <div className="p-8">
            {/* Book Info */}
            <BookInfo book={book} />

            {/* Owner Info and Borrow Section */}
            <div className="md:col-start-2 md:col-span-2 mt-6">
              {book.owner && <OwnerInfo owner={book.owner} />}

              {/* Borrow Request Section */}
              {!requestSuccess && (
                <BorrowRequestSection
                  isAuthenticated={!!user}
                  isOwnBook={!!isOwnBook}
                  isAvailable={book.borrowable}
                  showForm={showRequestForm}
                  isPending={borrowRequestMutation.isPending}
                  error={borrowRequestMutation.error}
                  onShowForm={handleShowForm}
                  onSubmit={handleRequestBorrow}
                  onCancel={handleCancelForm}
                />
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
