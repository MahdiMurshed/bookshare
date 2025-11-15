import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@repo/ui/components/button';
import { StatusBadge } from '@repo/ui/components/status-badge';
import { PageContainer } from '@repo/ui/components/page-container';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Calendar, MessageSquare } from '@repo/ui/components/icons';
import { useBookDetail } from '../hooks/useBookDetail';
import { useBorrowRequest } from '../hooks/useBorrowRequest';
import { useMyBorrowRequests } from '../hooks/useBorrowRequests';
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
  const { data: myRequests = [] } = useMyBorrowRequests();

  // Find existing request for this book
  const existingRequest = useMemo(() => {
    if (!id) return null;
    return myRequests.find((req) => req.book_id === id);
  }, [myRequests, id]);

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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-background dark:via-background dark:to-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-amber-600 dark:text-amber-500 animate-spin" />
          <span
            className="text-lg text-muted-foreground"
            style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 300 }}
          >
            Loading book details...
          </span>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-background dark:via-background dark:to-background">
        <PageContainer maxWidth="lg" className="py-12">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-8 hover:bg-amber-100 dark:hover:bg-amber-950/20"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-2xl" />
            <div className="relative p-8 rounded-2xl border border-red-200 dark:border-red-800/50 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
              <p
                className="text-lg text-red-700 dark:text-red-400"
                style={{ fontFamily: '"Outfit", sans-serif' }}
              >
                {error instanceof Error ? error.message : 'Book not found'}
              </p>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-background dark:via-background dark:to-background">
      <PageContainer maxWidth="xl" className="py-8 sm:py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 hover:bg-amber-100 dark:hover:bg-amber-950/20 transition-colors duration-200"
          style={{ fontFamily: '"Outfit", sans-serif' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Success Message */}
        {requestSuccess && (
          <div className="relative group mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl" />
            <div className="relative p-5 sm:p-6 rounded-2xl border border-green-200 dark:border-green-800/50 flex items-center gap-4">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p
                  className="text-base sm:text-lg font-semibold text-green-900 dark:text-green-100 mb-0.5"
                  style={{ fontFamily: '"Crimson Pro", serif' }}
                >
                  Request Sent Successfully!
                </p>
                <p
                  className="text-sm text-green-700 dark:text-green-300"
                  style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 300 }}
                >
                  The owner will be notified and review your request soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-8 sm:space-y-12">
          {/* Book Info */}
          <BookInfo book={book} />

          {/* Owner Info and Actions Section */}
          <div className="space-y-6 sm:space-y-8">
            {/* Owner Info */}
            {book.owner && <OwnerInfo owner={book.owner} />}

            {/* Borrow Request Section */}
            {!requestSuccess && !existingRequest && (
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

            {/* Existing Request Status */}
            {existingRequest && !requestSuccess && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10 rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative p-6 sm:p-8 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 backdrop-blur-sm space-y-6">
                  <div className="flex items-start justify-between">
                    <h3
                      className="text-2xl font-semibold text-foreground"
                      style={{ fontFamily: '"Crimson Pro", serif' }}
                    >
                      Your Borrow Request
                    </h3>
                    <StatusBadge
                      status={
                        existingRequest.status === 'approved'
                          ? 'approved'
                          : existingRequest.status === 'denied'
                          ? 'denied'
                          : 'pending'
                      }
                      className="px-4 py-1.5"
                    />
                  </div>

                  {/* Decorative Divider */}
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
                  </div>

                  <div className="space-y-4">
                    {/* Request Message */}
                    {existingRequest.request_message && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <p
                            className="text-sm font-semibold text-muted-foreground uppercase tracking-wider"
                            style={{ fontFamily: '"Outfit", sans-serif' }}
                          >
                            Your Message
                          </p>
                        </div>
                        <p
                          className="text-base text-foreground leading-relaxed pl-6"
                          style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 300 }}
                        >
                          {existingRequest.request_message}
                        </p>
                      </div>
                    )}

                    {/* Owner's Response */}
                    {existingRequest.response_message && (
                      <div className="space-y-2 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                          <p
                            className="text-sm font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-wider"
                            style={{ fontFamily: '"Outfit", sans-serif' }}
                          >
                            Owner's Response
                          </p>
                        </div>
                        <p
                          className="text-base text-foreground leading-relaxed pl-6"
                          style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 300 }}
                        >
                          {existingRequest.response_message}
                        </p>
                      </div>
                    )}

                    {/* Due Date */}
                    {existingRequest.status === 'approved' && existingRequest.due_date && (
                      <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800/50">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p
                              className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-0.5"
                              style={{ fontFamily: '"Outfit", sans-serif' }}
                            >
                              Due Date
                            </p>
                            <p
                              className="text-base font-semibold text-green-900 dark:text-green-100"
                              style={{ fontFamily: '"Outfit", sans-serif' }}
                            >
                              {new Date(existingRequest.due_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pending Message */}
                    {existingRequest.status === 'pending' && (
                      <p
                        className="text-sm text-muted-foreground italic pt-2"
                        style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 300 }}
                      >
                        The owner will review your request soon. You'll be notified once they respond.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
