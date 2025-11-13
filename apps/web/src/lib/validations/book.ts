import { z } from 'zod';

export const bookFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title is too long'),
  author: z.string().min(1, 'Author is required').max(200, 'Author name is too long'),
  genre: z.string().optional(),
  description: z.string().max(2000, 'Description is too long').optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  borrowable: z.boolean(),
  cover_image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type BookFormValues = z.infer<typeof bookFormSchema>;

// For edit form, all fields except condition can be optional during updates
export const editBookFormSchema = bookFormSchema.partial().required({
  title: true,
  author: true,
  condition: true,
  borrowable: true,
});

export type EditBookFormValues = z.infer<typeof editBookFormSchema>;
