import { useState } from 'react';
import { Card } from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select';
import { Button } from '@repo/ui/components/button';
import { Upload, X } from '@repo/ui/components/icons';
import { ImageWithFallback } from '../ImageWithFallback';

interface AddBookFormProps {
  onSubmit: (book: { title: string; author: string; genre: string; coverImage: string }) => void;
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

export function AddBookForm({ onSubmit, onCancel }: AddBookFormProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [coverImage, setCoverImage] = useState('');
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!author.trim()) {
      newErrors.author = 'Author is required';
    }
    if (!genre) {
      newErrors.genre = 'Genre is required';
    }
    if (!coverImage) {
      newErrors.coverImage = 'Cover image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({ title, author, genre, coverImage });
      // Reset form
      setTitle('');
      setAuthor('');
      setGenre('');
      setCoverImage('');
      setErrors({});
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
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter book title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
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
              <Label htmlFor="genre">Genre *</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className={errors.genre ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.genre && (
                <p className="text-red-500 text-sm mt-1">{errors.genre}</p>
              )}
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
              {errors.coverImage && (
                <p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>
              )}
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

        {/* Form Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Book</Button>
        </div>
      </form>
    </Card>
  );
}
