import type { UseFormReturn } from 'react-hook-form';
import { Upload } from '@repo/ui/components/icons';
import { FormLabel } from '@repo/ui/components/form';
import { ImageWithFallback } from '../ImageWithFallback';
import type { BookFormValues } from '../../lib/validations/book';

export interface BookCoverUploadProps {
  form: UseFormReturn<BookFormValues>;
}

/**
 * Book cover upload and preview component
 * Handles file upload and displays preview of the cover image
 */
export function BookCoverUpload({ form }: BookCoverUploadProps) {
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

  return (
    <>
      {/* File Upload */}
      <div>
        <FormLabel>Upload Image</FormLabel>
        <div className="mt-2">
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
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

      {/* Image Preview */}
      <div>
        <FormLabel>Preview</FormLabel>
        <div className="mt-2 aspect-[2/3] bg-muted rounded-lg overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
          {form.watch('cover_image_url') ? (
            <ImageWithFallback
              src={form.watch('cover_image_url')}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-6">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Cover image preview</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
