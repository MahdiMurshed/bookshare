export const BOOK_GENRES = [
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
] as const;

export const BOOK_CONDITIONS = ['excellent', 'good', 'fair', 'poor'] as const;

export type BookGenre = (typeof BOOK_GENRES)[number];
export type BookCondition = (typeof BOOK_CONDITIONS)[number];
