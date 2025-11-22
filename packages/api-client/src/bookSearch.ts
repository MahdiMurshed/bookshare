/**
 * Book search service using Google Books API
 * Provides autocomplete functionality for book metadata
 */

export interface BookSearchResult {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  categories?: string[];
  imageUrl?: string;
  isbn?: string;
  pageCount?: number;
  publisher?: string;
  publishedDate?: string;
}

/**
 * Search for books by title using Google Books API
 * Returns a list of matching books with metadata
 */
export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodedQuery}&maxResults=10&printType=books`
    );

    if (!response.ok) {
      throw new Error('Failed to search books');
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item: any) => {
      const volumeInfo = item.volumeInfo;
      const imageLinks = volumeInfo.imageLinks || {};

      return {
        id: item.id,
        title: volumeInfo.title || '',
        authors: volumeInfo.authors || [],
        description: volumeInfo.description || undefined,
        categories: volumeInfo.categories || [],
        imageUrl: imageLinks.thumbnail || imageLinks.smallThumbnail || undefined,
        isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || undefined,
        pageCount: volumeInfo.pageCount || undefined,
        publisher: volumeInfo.publisher || undefined,
        publishedDate: volumeInfo.publishedDate || undefined,
      } as BookSearchResult;
    });
  } catch (error) {
    console.error('Book search error:', error);
    return [];
  }
}

/**
 * Get a single book's details by Google Books ID
 */
export async function getBookDetails(bookId: string): Promise<BookSearchResult | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${bookId}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch book details');
    }

    const item = await response.json();
    const volumeInfo = item.volumeInfo;
    const imageLinks = volumeInfo.imageLinks || {};

    return {
      id: item.id,
      title: volumeInfo.title || '',
      authors: volumeInfo.authors || [],
      description: volumeInfo.description || undefined,
      categories: volumeInfo.categories || [],
      imageUrl: imageLinks.thumbnail || imageLinks.smallThumbnail || undefined,
      isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || undefined,
      pageCount: volumeInfo.pageCount || undefined,
      publisher: volumeInfo.publisher || undefined,
      publishedDate: volumeInfo.publishedDate || undefined,
    };
  } catch (error) {
    console.error('Book details fetch error:', error);
    return null;
  }
}

/**
 * Map Google Books categories to our genre system
 */
export function mapCategoryToGenre(categories: string[]): string | undefined {
  if (!categories || categories.length === 0) return undefined;

  const category = categories[0]!.toLowerCase();
  const genreMap: Record<string, string> = {
    'fiction': 'Fiction',
    'literary fiction': 'Fiction',
    'science fiction': 'Science Fiction',
    'fantasy': 'Fantasy',
    'mystery': 'Mystery',
    'thriller': 'Thriller',
    'romance': 'Romance',
    'biography': 'Biography',
    'autobiography': 'Biography',
    'history': 'History',
    'non-fiction': 'Non-Fiction',
    'self-help': 'Self-Help',
    'poetry': 'Poetry',
  };

  for (const [key, value] of Object.entries(genreMap)) {
    if (category.includes(key)) {
      return value;
    }
  }

  return 'Other';
}
