import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea';
import { Checkbox } from '@repo/ui/components/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select';
import { Button } from '@repo/ui/components/button';
import { Upload, X, Loader2, Sparkles } from '@repo/ui/components/icons';
import { ImageWithFallback } from '../ImageWithFallback';
import { BookAutocomplete } from './BookAutocomplete';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { createBook, mapCategoryToGenre, type BookSearchResult } from '@repo/api-client';
import { bookFormSchema, type BookFormValues } from '../../lib/validations/book';

interface AddBookFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const genres = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Science Fiction',
  'Fantasy',
  'Romance',
  'Thriller',
  'Biography',
  'History',
  'Self-Help',
  'Poetry',
  'Other',
];

const conditions: Array<'excellent' | 'good' | 'fair' | 'poor'> = [
  'excellent',
  'good',
  'fair',
  'poor',
];

export function AddBookForm({ onSubmit, onCancel }: AddBookFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('cover_image_url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBookSelect = (book: BookSearchResult) => {
    // Auto-fill form fields from selected book
    form.setValue('title', book.title);
    form.setValue('author', book.authors.join(', '));

    // Map Google Books category to our genre
    if (book.categories && book.categories.length > 0) {
      const mappedGenre = mapCategoryToGenre(book.categories);
      if (mappedGenre) {
        form.setValue('genre', mappedGenre);
      }
    }

    // Set description
    if (book.description) {
      const cleanDescription = book.description
        .replace(/<[^>]*>/g, '')
        .substring(0, 500);
      form.setValue('description', cleanDescription);
    }

    // Set cover image
    if (book.imageUrl) {
      const httpsImageUrl = book.imageUrl.replace('http://', 'https://');
      form.setValue('cover_image_url', httpsImageUrl);
    }
  };

  const handleFormSubmit = async (values: BookFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createBook({
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
      setSubmitError(error instanceof Error ? error.message : 'Failed to add book. Please try again.');
    } finally {
      setIsSubmitting(false);
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

              {/* Author */}
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter author name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Genre */}
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a genre (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genres.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a brief description of the book"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Condition */}
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conditions.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Borrowable */}
              <FormField
                control={form.control}
                name="borrowable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Available for borrowing
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {/* Cover Image URL */}
              <FormField
                control={form.control}
                name="cover_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/cover.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Upload */}
              <div>
                <FormLabel>Or Upload Image</FormLabel>
                <div className="mt-2">
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Choose File</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Image Preview */}
            <div>
              <FormLabel>Preview</FormLabel>
              <div className="mt-2 aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                {form.watch('cover_image_url') ? (
                  <ImageWithFallback
                    src={form.watch('cover_image_url')}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Cover image preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 mt-6 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
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
