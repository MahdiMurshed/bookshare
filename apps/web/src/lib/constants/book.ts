/**
 * Book-related constants
 * Single source of truth for book genres and conditions across the application
 */

// Comprehensive list of book genres (merged from all components)
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

// Book condition values
export const BOOK_CONDITIONS = ['excellent', 'good', 'fair', 'poor'] as const;

// Book conditions with labels for UI dropdowns
export const BOOK_CONDITIONS_WITH_LABELS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
] as const;

// Type exports - inferred from constants
export type BookGenre = (typeof BOOK_GENRES)[number];
export type BookCondition = (typeof BOOK_CONDITIONS)[number];
