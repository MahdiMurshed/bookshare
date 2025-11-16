import { z } from 'zod';

export const createCommunitySchema = z.object({
  name: z
    .string()
    .min(3, 'Community name must be at least 3 characters')
    .max(100, 'Community name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().max(200, 'Location is too long').optional().or(z.literal('')),
  is_private: z.boolean(),
  requires_approval: z.boolean(),
});

export type CreateCommunityFormValues = z.infer<typeof createCommunitySchema>;

// For edit form, make all fields optional
export const editCommunitySchema = createCommunitySchema.partial().required({
  name: true,
});

export type EditCommunityFormValues = z.infer<typeof editCommunitySchema>;
