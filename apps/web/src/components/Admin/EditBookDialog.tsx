/**
 * EditBookDialog Component
 *
 * Dialog for editing book information with comprehensive validation
 * Features react-hook-form validation with clean monochrome design
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { BookWithOwner, UpdateBookInput } from '@repo/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea';
import { Checkbox } from '@repo/ui/components/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@repo/ui/components/form';
import { Edit3, BookOpen } from 'lucide-react';

// Common book genres
const BOOK_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Fantasy',
  'Biography',
  'History',
  'Thriller',
  'Horror',
  'Self-Help',
  'Business',
  'Poetry',
  'Drama',
  'Children',
  'Young Adult',
  'Graphic Novel',
  'Other',
];

// Book conditions
const BOOK_CONDITIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
] as const;

// Validation schema
const editBookSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  author: z
    .string()
    .min(1, 'Author is required')
    .max(200, 'Author must be less than 200 characters'),
  isbn: z
    .string()
    .max(20, 'ISBN must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  genre: z.string().optional().or(z.literal('')),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  cover_image_url: z
    .string()
    .url('Must be a valid URL')
    .or(z.literal(''))
    .optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  borrowable: z.boolean(),
});

type EditBookFormValues = z.infer<typeof editBookSchema>;

export interface EditBookDialogProps {
  book: BookWithOwner | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: UpdateBookInput) => Promise<void>;
}

export function EditBookDialog({
  book,
  open,
  onClose,
  onSave,
}: EditBookDialogProps) {
  const [imageError, setImageError] = useState(false);

  const form = useForm<EditBookFormValues>({
    resolver: zodResolver(editBookSchema),
    defaultValues: {
      title: '',
      author: '',
      isbn: '',
      genre: '',
      description: '',
      cover_image_url: '',
      condition: 'good',
      borrowable: true,
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  // Reset form when book changes
  useEffect(() => {
    if (book) {
      form.reset({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        genre: book.genre || '',
        description: book.description || '',
        cover_image_url: book.cover_image_url || '',
        condition: book.condition || 'good',
        borrowable: book.borrowable ?? true,
      });
      setImageError(false);
    }
  }, [book, form]);

  const handleSubmit = async (data: EditBookFormValues) => {
    try {
      // Only include fields that have values
      const updateData: UpdateBookInput = {
        title: data.title,
        author: data.author,
        isbn: data.isbn || undefined,
        genre: data.genre || undefined,
        description: data.description || undefined,
        cover_image_url: data.cover_image_url || undefined,
        condition: data.condition,
        borrowable: data.borrowable,
      };

      await onSave(updateData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Failed to update book:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  const watchCoverUrl = form.watch('cover_image_url');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-2">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
              <Edit3 className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <DialogTitle className="text-xl">Edit Book</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Update book information for "{book?.title}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 py-4">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    Title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter book title"
                      disabled={isSubmitting}
                      className="border-2 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Author Field */}
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    Author <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter author name"
                      disabled={isSubmitting}
                      className="border-2 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ISBN and Genre Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ISBN Field */}
              <FormField
                control={form.control}
                name="isbn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">ISBN</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Optional"
                        disabled={isSubmitting}
                        className="border-2 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Genre Field */}
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Genre</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="border-2 focus:ring-2 focus:ring-primary transition-all">
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {BOOK_GENRES.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter book description (optional)"
                      disabled={isSubmitting}
                      className="min-h-[100px] resize-none border-2 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cover Image URL Field */}
            <FormField
              control={form.control}
              name="cover_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Cover Image URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://example.com/cover.jpg (optional)"
                      disabled={isSubmitting}
                      className="border-2 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview cover image if URL exists */}
            {watchCoverUrl && (
              <div className="rounded-lg border-2 border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Cover Preview
                </p>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-32 rounded-md border-2 border-border bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {!imageError ? (
                      <img
                        src={watchCoverUrl}
                        alt="Book cover preview"
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground pt-1">
                    This cover will be displayed on the book card
                  </p>
                </div>
              </div>
            )}

            {/* Condition and Borrowable Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Condition Field */}
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Condition <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="border-2 focus:ring-2 focus:ring-primary transition-all">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BOOK_CONDITIONS.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Borrowable Field */}
              <FormField
                control={form.control}
                name="borrowable"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <div className="flex items-center space-x-2 h-10 px-3 rounded-md border-2 border-border bg-background">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormLabel className="font-medium cursor-pointer !mt-0">
                        Available for borrowing
                      </FormLabel>
                    </div>
                    <FormDescription className="text-xs mt-1.5">
                      Allow users to request to borrow this book
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="border-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
