# Business Logic Separation Audit

## Overall Assessment: GOOD

The codebase demonstrates **strong separation of concerns**. Business logic is generally well-extracted into custom hooks and the api-client package.

---

## Positive Patterns Found

### 1. Custom Hooks for Data Fetching
All data fetching is properly abstracted into hooks:
- `useBooks`, `useCreateBook`, `useUpdateBook`, `useDeleteBook`
- `useBorrowRequests`, `useApproveBorrowRequest`, `useDenyBorrowRequest`
- `useCommunities`, `useCommunityMembers`
- `useNotifications`, `useMarkNotificationAsRead`

### 2. API Client Abstraction
Backend calls properly abstracted in `packages/api-client/`:
- `auth.ts` - Authentication functions
- `books.ts` - Book CRUD operations
- `borrowRequests.ts` - Borrow request operations
- `communities.ts` - Community management
- `notifications.ts` - Notification operations

### 3. Validation Schemas Separated
Zod schemas properly extracted to dedicated files:
- `apps/web/src/lib/validations/book.ts`
- `apps/web/src/lib/validations/community.ts`
- `packages/shared/src/schemas/`

---

## Violations Found

### VIOLATION 1: Data Transformations in Components

**FILE:** `apps/web/src/pages/Requests.tsx:52-101`
**VIOLATION:** Filtering and sorting logic inside component

```typescript
// Current: Logic in component
const filteredIncomingRequests = useMemo(() => {
  let filtered = incomingRequests;
  if (incomingStatusFilter !== 'all') {
    filtered = filtered.filter((r) => r.status === incomingStatusFilter);
  }
  const sorted = [...filtered].sort((a, b) => {
    if (incomingSortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    // ... more sorting logic
  });
  return sorted;
}, [incomingRequests, incomingStatusFilter, incomingSortBy]);
```

**EXTRACT TO:** `hooks/useFilteredRequests.ts` or `lib/utils/requestFilters.ts`

```typescript
// Better: Pure function in utils
export function filterAndSortRequests(
  requests: BorrowRequestWithDetails[],
  filter: string,
  sortBy: 'newest' | 'oldest' | 'title'
): BorrowRequestWithDetails[] {
  let filtered = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

  return sortRequests(filtered, sortBy);
}
```

---

### VIOLATION 2: Similar Filter Logic in Browse Page

**FILE:** `apps/web/src/pages/Browse.tsx:93-101`
**VIOLATION:** Client-side filtering in component

```typescript
const filteredBooks = books.filter((book) => {
  if (conditionFilter !== 'all' && book.condition !== conditionFilter) {
    return false;
  }
  if (availableOnly && !book.borrowable) {
    return false;
  }
  return true;
});
```

**EXTRACT TO:** `lib/utils/bookFilters.ts`

```typescript
export function filterBooks(
  books: BookWithOwner[],
  filters: { condition?: string; availableOnly?: boolean }
): BookWithOwner[] {
  return books.filter(book => {
    if (filters.condition && filters.condition !== 'all' && book.condition !== filters.condition) {
      return false;
    }
    if (filters.availableOnly && !book.borrowable) {
      return false;
    }
    return true;
  });
}
```

---

### VIOLATION 3: Calculation Logic in Home Page

**FILE:** `apps/web/src/pages/Home.tsx:31-38`
**VIOLATION:** Stats calculation inline

```typescript
const userStats = user
  ? {
      booksOwned: userBooks?.length || 0,
      booksShared: userBooks?.filter((b) => b.borrowable).length || 0,
      activeRequests:
        incomingRequests?.filter((r) => r.status === "pending").length || 0,
    }
  : null;
```

**EXTRACT TO:** `hooks/useUserStats.ts`

```typescript
export function useUserStats(userId: string | undefined) {
  const { data: userBooks } = useBooks(userId);
  const { data: incomingRequests } = useIncomingBorrowRequests();

  return useMemo(() => {
    if (!userId) return null;
    return {
      booksOwned: userBooks?.length || 0,
      booksShared: userBooks?.filter(b => b.borrowable).length || 0,
      activeRequests: incomingRequests?.filter(r => r.status === 'pending').length || 0,
    };
  }, [userId, userBooks, incomingRequests]);
}
```

---

### VIOLATION 4: Debounce Logic Inline

**FILE:** `apps/web/src/pages/Browse.tsx:32-38`
**VIOLATION:** Debounce implementation inline

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchQuery);
  }, 300);
  return () => clearTimeout(timer);
}, [searchQuery]);
```

**EXTRACT TO:** `hooks/useDebouncedValue.ts`

```typescript
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage:
const debouncedSearch = useDebouncedValue(searchQuery, 300);
```

---

### VIOLATION 5: API Client Contains `console.log` Statements

**FILE:** `packages/api-client/src/communities.ts:270-303`
**VIOLATION:** Debug logging in production code

```typescript
console.log('Creating community with user ID:', session.user.id);
console.log('Community data:', { ...input, created_by: session.user.id });
// ...
console.log('Community created successfully:', data);
```

**FIX:** Remove console.log statements or use proper logging utility.

---

## Good Practices Already in Place

### Query Key Factory Pattern
```typescript
// apps/web/src/hooks/useBooks.ts:12-18
export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (userId: string) => [...bookKeys.lists(), userId] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
};
```

### Error Handling Utilities
```typescript
// apps/web/src/lib/utils/errors.ts
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string
export function getContextualErrorMessage(error: unknown, context: string): string
export function logError(error: unknown, context?: string): void
```

### Form Validation with Zod
```typescript
// apps/web/src/lib/validations/book.ts
import { z } from 'zod';
export const bookFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  // ...
});
```

---

## Summary

| Category | Status |
|----------|--------|
| API calls abstracted | GOOD |
| Validation schemas separated | GOOD |
| Query keys organized | GOOD |
| Error handling utilities | GOOD |
| Data transformations | NEEDS IMPROVEMENT |
| Debounce logic | NEEDS EXTRACTION |
| Debug logging | NEEDS CLEANUP |
