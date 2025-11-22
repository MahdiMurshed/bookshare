/**
 * Book-related constants
 * Core types from @repo/shared, UI-specific constants defined here
 */

// Re-export from @repo/shared
export { BOOK_CONDITIONS } from '@repo/shared';
export type { BookCondition } from '@repo/shared';

// UI-specific: Book genres for dropdowns
export const BOOK_GENRES = [
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
] as const;

export type BookGenre = (typeof BOOK_GENRES)[number];

// UI-specific: Book conditions with labels for dropdowns
export const BOOK_CONDITIONS_WITH_LABELS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
] as const;
