import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/alert-dialog';
import { Loader2 } from '@repo/ui/components/icons';
import { type Book } from '@repo/api-client';
import { useDeleteBook } from '../../hooks/useBooks';

interface DeleteBookModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteBookModal({ book, open, onOpenChange, onSuccess }: DeleteBookModalProps) {
  const deleteBookMutation = useDeleteBook();

  const handleDelete = async () => {
    if (!book) return;

    deleteBookMutation.mutate(book.id, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess();
      },
      onError: (error) => {
        console.error('Failed to delete book:', error);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>"{book?.title}"</strong> by {book?.author}.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteBookMutation.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">
              {deleteBookMutation.error instanceof Error
                ? deleteBookMutation.error.message
                : 'Failed to delete book. Please try again.'}
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteBookMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteBookMutation.isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleteBookMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
