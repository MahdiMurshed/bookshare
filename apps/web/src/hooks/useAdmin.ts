/**
 * Admin Query Keys and Hooks
 *
 * Centralized query key factory for all admin-related queries
 * Ensures consistent cache management and invalidation
 */

// Query key factory for admin queries
export const adminKeys = {
  all: ['admin'] as const,

  // User (current admin user)
  user: () => [...adminKeys.all, 'user'] as const,
  userById: (userId?: string) => [...adminKeys.user(), userId] as const,

  // Stats
  stats: () => [...adminKeys.all, 'stats'] as const,

  // Activity
  activity: () => [...adminKeys.all, 'activity'] as const,
  recentActivity: () => [...adminKeys.activity(), 'recent'] as const,

  // Users management
  users: () => [...adminKeys.all, 'users'] as const,
  allUsers: (filters?: Record<string, unknown>) => [...adminKeys.users(), filters] as const,
  userActivity: (userId: string) => [...adminKeys.users(), userId, 'activity'] as const,

  // Books management
  books: () => [...adminKeys.all, 'books'] as const,
  allBooks: (filters?: Record<string, unknown>) => [...adminKeys.books(), filters] as const,
  flaggedBooks: () => [...adminKeys.books(), 'flagged'] as const,

  // Borrow requests management
  requests: () => [...adminKeys.all, 'requests'] as const,
  allRequests: (filters?: Record<string, unknown>) => [...adminKeys.requests(), filters] as const,

  // Analytics
  analytics: () => [...adminKeys.all, 'analytics'] as const,
  genreDistribution: () => [...adminKeys.analytics(), 'genre-distribution'] as const,
  borrowActivity: () => [...adminKeys.analytics(), 'borrow-activity'] as const,
  userGrowth: () => [...adminKeys.analytics(), 'user-growth'] as const,
  activeUsers: () => [...adminKeys.analytics(), 'active-users'] as const,
  popularBooks: () => [...adminKeys.analytics(), 'popular-books'] as const,
  borrowDuration: () => [...adminKeys.analytics(), 'borrow-duration'] as const,
  userRetention: () => [...adminKeys.analytics(), 'user-retention'] as const,
  platformKPIs: () => [...adminKeys.analytics(), 'platform-kpis'] as const,

  // Reviews management
  reviews: () => [...adminKeys.all, 'reviews'] as const,
  allReviews: (filters?: Record<string, unknown>) => [...adminKeys.reviews(), filters] as const,
};
