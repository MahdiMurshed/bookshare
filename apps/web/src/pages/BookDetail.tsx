import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@repo/ui/components/button';
import { StatusBadge } from '@repo/ui/components/status-badge';
import { PageContainer } from '@repo/ui/components/page-container';
import { Alert, AlertDescription } from '@repo/ui/components/alert';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <span className="text-lg text-muted-foreground">
            Loading book details...
          </span>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-background">
        <PageContainer maxWidth="lg" className="py-12">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Alert variant="destructive" className="border-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-base">
              {error instanceof Error ? error.message : 'Book not found'}
            </AlertDescription>
          </Alert>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px),
                             repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px)`,
          }}
        />
      </div>

      <PageContainer maxWidth="xl" className="relative py-8 sm:py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Success Message */}
        {requestSuccess && (
          <Alert className="mb-8 border-2 border-green-500/20 bg-green-500/5 animate-in fade-in slide-in-from-top-4 duration-500">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
            <AlertDescription className="text-base">
              <span className="font-semibold">Request Sent Successfully!</span>
              <span className="block text-sm text-muted-foreground mt-1">
                The owner will be notified and review your request soon.
              </span>
            </AlertDescription>
          </Alert>
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
              <div className="border-2 border-border rounded-lg p-6 sm:p-8 space-y-6 bg-card">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-bold tracking-tight">
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

                <div className="space-y-4">
                  {/* Request Message */}
                  {existingRequest.request_message && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Your Message
                        </p>
                      </div>
                      <p className="text-base text-foreground leading-relaxed pl-6">
                        {existingRequest.request_message}
                      </p>
                    </div>
                  )}

                  {/* Owner's Response */}
                  {existingRequest.response_message && (
                    <div className="space-y-2 pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                          Owner's Response
                        </p>
                      </div>
                      <p className="text-base text-foreground leading-relaxed pl-6">
                        {existingRequest.response_message}
                      </p>
                    </div>
                  )}

                  {/* Due Date */}
                  {existingRequest.status === 'approved' && existingRequest.due_date && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border-2 border-green-500/20">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                            Due Date
                          </p>
                          <p className="text-base font-semibold text-foreground">
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
                    <p className="text-sm text-muted-foreground italic pt-2">
                      The owner will review your request soon. You'll be notified once they respond.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
