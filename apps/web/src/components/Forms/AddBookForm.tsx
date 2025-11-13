import { useState } from 'react';
import { Card } from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Textarea } from '@repo/ui/components/textarea';
import { Checkbox } from '@repo/ui/components/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select';
import { Button } from '@repo/ui/components/button';
import { Upload, X, Loader2, Sparkles } from '@repo/ui/components/icons';
import { ImageWithFallback } from '../ImageWithFallback';
import { BookAutocomplete } from './BookAutocomplete';
import { createBook, mapCategoryToGenre, type CreateBookInput, type BookSearchResult } from '@repo/api-client';

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
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [borrowable, setBorrowable] = useState(true);
  const [coverImage, setCoverImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setCoverImage(url);
  };

  const handleBookSelect = (book: BookSearchResult) => {
    // Auto-fill form fields from selected book
    setTitle(book.title);
    setAuthor(book.authors.join(', '));

    // Map Google Books category to our genre
    if (book.categories && book.categories.length > 0) {
      const mappedGenre = mapCategoryToGenre(book.categories);
      if (mappedGenre) {
        setGenre(mappedGenre);
      }
    }

    // Set description
    if (book.description) {
      // Remove HTML tags if present and truncate to reasonable length
      const cleanDescription = book.description
        .replace(/<[^>]*>/g, '')
        .substring(0, 500);
      setDescription(cleanDescription);
    }

    // Set cover image (convert HTTP to HTTPS for Google Books images)
    if (book.imageUrl) {
      const httpsImageUrl = book.imageUrl.replace('http://', 'https://');
      setCoverImage(httpsImageUrl);
    }

    // Clear any previous errors
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!author.trim()) {
      newErrors.author = 'Author is required';
    }
    if (!condition) {
      newErrors.condition = 'Condition is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const bookData: CreateBookInput = {
        title: title.trim(),
        author: author.trim(),
        genre: genre || undefined,
        description: description.trim() || undefined,
        condition,
        borrowable,
        cover_image_url: coverImage || undefined,
      };

      await createBook(bookData);

      // Reset form
      setTitle('');
      setAuthor('');
      setGenre('');
      setDescription('');
      setCondition('good');
      setBorrowable(true);
      setCoverImage('');

      onSubmit();
    } catch (error) {
      console.error('Failed to create book:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to add book. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900">Add New Book</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Form Fields */}
          <div className="space-y-4">
            {/* Title with Autocomplete */}
            <div>
              <BookAutocomplete
                value={title}
                onChange={setTitle}
                onBookSelect={handleBookSelect}
                error={errors.title}
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Start typing to auto-fill book details
              </p>
            </div>

            {/* Author */}
            <div>
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                type="text"
                placeholder="Enter author name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className={errors.author ? 'border-red-500' : ''}
              />
              {errors.author && (
                <p className="text-red-500 text-sm mt-1">{errors.author}</p>
              )}
            </div>

            {/* Genre */}
            <div>
              <Label htmlFor="genre">Genre</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a genre (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a brief description of the book"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Condition */}
            <div>
              <Label htmlFor="condition">Condition *</Label>
              <Select value={condition} onValueChange={(value) => setCondition(value as typeof condition)}>
                <SelectTrigger className={errors.condition ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.condition && (
                <p className="text-red-500 text-sm mt-1">{errors.condition}</p>
              )}
            </div>

            {/* Borrowable */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="borrowable"
                checked={borrowable}
                onCheckedChange={(checked: boolean) => setBorrowable(checked === true)}
              />
              <Label
                htmlFor="borrowable"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Available for borrowing
              </Label>
            </div>

            {/* Cover Image URL */}
            <div>
              <Label htmlFor="imageUrl">Cover Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/cover.jpg"
                value={coverImage.startsWith('http') ? coverImage : ''}
                onChange={(e) => handleImageUrlChange(e.target.value)}
              />
            </div>

            {/* File Upload */}
            <div>
              <Label>Or Upload Image</Label>
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
            <Label>Preview</Label>
            <div className="mt-2 aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
              {coverImage ? (
                <ImageWithFallback
                  src={coverImage}
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
        {errors.submit && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{errors.submit}</p>
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
    </Card>
  );
}
