import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Loader2 } from '@repo/ui/components/icons';
import { Form } from '@repo/ui/components/form';
import { BookFormFields } from '../Forms/BookFormFields';
import { type Book, getBookCommunities } from '@repo/api-client';
import { bookFormSchema, type BookFormValues } from '../../lib/validations/book';
import { useUpdateBook } from '../../hooks/useBooks';
import { useAddBookToCommunity, useRemoveBookFromCommunity } from '../../hooks/useCommunities';
import { BookCommunitySelector } from '../Communities/BookCommunitySelector';

interface EditBookModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId?: string;
}

export function EditBookModal({ book, open, onOpenChange, onSuccess, userId }: EditBookModalProps) {
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
  const [initialCommunityIds, setInitialCommunityIds] = useState<string[]>([]);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: '',
      author: '',
      genre: '',
      description: '',
      condition: 'good',
      borrowable: true,
      cover_image_url: '',
    },
  });

  const updateBookMutation = useUpdateBook(userId);
  const addBookToCommunityMutation = useAddBookToCommunity();
  const removeBookFromCommunityMutation = useRemoveBookFromCommunity();

  // Pre-fill form and load communities when book changes
  useEffect(() => {
    if (book) {
      form.reset({
        title: book.title,
        author: book.author,
        genre: book.genre || '',
        description: book.description || '',
        condition: book.condition,
        borrowable: book.borrowable,
        cover_image_url: book.cover_image_url || '',
      });

      // Load book's current communities
      getBookCommunities(book.id)
        .then((communities) => {
          const communityIds = communities.map((c) => c.id);
          setSelectedCommunityIds(communityIds);
          setInitialCommunityIds(communityIds);
        })
        .catch((error) => {
          console.error('Failed to load book communities:', error);
        });
    }
  }, [book]);

  const handleFormSubmit = async (values: BookFormValues) => {
    if (!book) return;

    try {
      // Update book details
      await updateBookMutation.mutateAsync({
        id: book.id,
        data: {
          title: values.title.trim(),
          author: values.author.trim(),
          genre: values.genre || undefined,
          description: values.description || undefined,
          condition: values.condition,
          borrowable: values.borrowable,
          cover_image_url: values.cover_image_url || undefined,
        },
      });

      // Handle community changes
      const communitiesToAdd = selectedCommunityIds.filter(
        (id) => !initialCommunityIds.includes(id)
      );
      const communitiesToRemove = initialCommunityIds.filter(
        (id) => !selectedCommunityIds.includes(id)
      );

      // Add book to new communities
      if (communitiesToAdd.length > 0) {
        await Promise.all(
          communitiesToAdd.map((communityId) =>
            addBookToCommunityMutation.mutateAsync({
              bookId: book.id,
              communityId,
            })
          )
        );
      }

      // Remove book from communities
      if (communitiesToRemove.length > 0) {
        await Promise.all(
          communitiesToRemove.map((communityId) =>
            removeBookFromCommunityMutation.mutateAsync({
              bookId: book.id,
              communityId,
            })
          )
        );
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to update book:', error);
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Failed to update book. Please try again.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>
            Update the details of your book. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <div className="space-y-4">
              <BookFormFields form={form} showTitle={true} />
            </div>

            {/* Community Selector */}
            <div className="mt-6 p-4 border border-border rounded-lg bg-muted/30">
              <BookCommunitySelector
                userId={userId}
                selectedCommunityIds={selectedCommunityIds}
                onSelectionChange={setSelectedCommunityIds}
              />
            </div>

            {/* Error Message */}
            {form.formState.errors.root && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-md">
                <p className="text-red-600 dark:text-red-400 text-sm">{form.formState.errors.root.message}</p>
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateBookMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateBookMutation.isPending}>
                {updateBookMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
