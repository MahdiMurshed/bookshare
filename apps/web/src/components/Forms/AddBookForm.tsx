import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { X, Loader2, Sparkles } from '@repo/ui/components/icons';
import { BookAutocomplete } from './BookAutocomplete';
import { BookFormFields } from './BookFormFields';
import { BookCoverUpload } from './BookCoverUpload';
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
} from '@repo/ui/components/form';
import { mapCategoryToGenre, type BookSearchResult } from '@repo/api-client';
import { bookFormSchema, type BookFormValues } from '../../lib/validations/book';
import { useCreateBook } from '../../hooks/useBooks';

interface AddBookFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  userId?: string;
}

export function AddBookForm({ onSubmit, onCancel, userId }: AddBookFormProps) {
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

  const createBookMutation = useCreateBook(userId);

  const handleBookSelect = (book: BookSearchResult) => {
    form.setValue('title', book.title);
    form.setValue('author', book.authors.join(', '));

    if (book.categories && book.categories.length > 0) {
      const mappedGenre = mapCategoryToGenre(book.categories);
      if (mappedGenre) {
        form.setValue('genre', mappedGenre);
      }
    }

    if (book.description) {
      const cleanDescription = book.description.replace(/<[^>]*>/g, '').substring(0, 500);
      form.setValue('description', cleanDescription);
    }

    if (book.imageUrl) {
      const httpsImageUrl = book.imageUrl.replace('http://', 'https://');
      form.setValue('cover_image_url', httpsImageUrl);
    }
  };

  const handleFormSubmit = async (values: BookFormValues) => {
    try {
      await createBookMutation.mutateAsync({
        title: values.title.trim(),
        author: values.author.trim(),
        genre: values.genre || undefined,
        description: values.description || undefined,
        condition: values.condition,
        borrowable: values.borrowable,
        cover_image_url: values.cover_image_url || undefined,
      });

      form.reset();
      onSubmit();
    } catch (error) {
      console.error('Failed to create book:', error);
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Failed to add book. Please try again.',
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Add New Book</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-4">
              {/* Title with Autocomplete */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <BookAutocomplete
                      value={field.value}
                      onChange={field.onChange}
                      onBookSelect={handleBookSelect}
                      error={form.formState.errors.title?.message}
                    />
                    <FormDescription className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Start typing to auto-fill book details
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Shared Form Fields */}
              <BookFormFields form={form} showTitle={false} />
            </div>

            {/* Right Column - Image Preview and Upload */}
            <div className="space-y-4">
              <BookCoverUpload form={form} />
            </div>
          </div>

          {/* Error Message */}
          {form.formState.errors.root && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{form.formState.errors.root.message}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 mt-6 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={createBookMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBookMutation.isPending}>
              {createBookMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Book'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
