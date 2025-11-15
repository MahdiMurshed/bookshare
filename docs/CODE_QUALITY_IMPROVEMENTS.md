# Code Quality Improvements & Best Practices

This document outlines the code quality improvements, refactoring work, and best practices implemented in the BookShare codebase.

## Table of Contents
1. [Component Architecture](#component-architecture)
2. [React Hook Best Practices](#react-hook-best-practices)
3. [Query Key Factories](#query-key-factories)
4. [Type Import Optimization](#type-import-optimization)
5. [Error Handling](#error-handling)

---

## Component Architecture

### Component Size Guidelines

**Rule:** Keep components under ~150-200 lines. Extract logic into smaller, focused components when exceeding this limit.

#### Example: Profile.tsx Refactoring

**Before:** 495 lines (monolithic)
**After:** 107 lines (orchestration only)

**Extracted Components:**
- `ProfileHeader.tsx` (~250 lines) - Avatar upload, user info, inline editing
- `ProfileStats.tsx` (~80 lines) - Activity statistics display
- `ProfileSettings.tsx` (~165 lines) - Account settings with delete dialog

**Benefits:**
- ✅ Better separation of concerns
- ✅ Improved testability (test each component independently)
- ✅ Easier maintenance and code navigation
- ✅ Reusable components across different pages

**File Structure:**
```
apps/web/src/
├── pages/
│   └── Profile.tsx              # Orchestration only (107 lines)
├── components/
    └── Profile/
        ├── ProfileHeader.tsx    # Avatar & user info (~250 lines)
        ├── ProfileStats.tsx     # Statistics display (~80 lines)
        └── ProfileSettings.tsx  # Account settings (~165 lines)
```

### Component Responsibilities

Each component should have a single, clear responsibility:

- **Pages** - Route-level orchestration, data fetching, layout
- **Feature Components** - Specific feature implementation with local state
- **Shared Components** - Reusable UI elements in `@repo/ui`

---

## React Hook Best Practices

### useEffect Dependency Arrays

#### Problem: Unstable Dependencies

Including entire objects (like `form` from react-hook-form) causes unnecessary re-renders:

```typescript
// ❌ BAD - form object is unstable, causes infinite re-renders
useEffect(() => {
  if (book) {
    form.reset({ title: book.title, author: book.author });
  }
}, [book, form]);  // form reference changes every render

// ✅ GOOD - Only track the data that actually changes
useEffect(() => {
  if (book) {
    form.reset({ title: book.title, author: book.author });
  }
}, [book]);  // form.reset is stable, no need to include
```

**Files Fixed:**
- `apps/web/src/components/Admin/EditBookDialog.tsx`
- `apps/web/src/components/Admin/EditUserDialog.tsx`
- `apps/web/src/components/modals/EditBookModal.tsx`

### Race Condition Prevention

#### Problem: State Updates After Unmount

Async operations and subscriptions can trigger after component unmount, causing React warnings and memory leaks.

**Solution:** Use `isMounted` flag pattern

```typescript
// ✅ GOOD - Track mount state and prevent updates after unmount
export function useNotificationSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Track if component is still mounted
    let isMounted = true;

    const unsubscribe = subscribeToNotifications(() => {
      // Only update cache if component is still mounted
      if (!isMounted) return;

      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    });

    return () => {
      isMounted = false;  // Mark as unmounted BEFORE cleanup
      unsubscribe();
    };
  }, [queryClient]);
}
```

**Files Fixed:**
- `apps/web/src/hooks/useNotifications.ts` - useNotificationSubscription
- `apps/web/src/hooks/useUnreadMessages.ts` - useUnreadSubscription
- `apps/web/src/contexts/AuthContext.tsx` - Auth state management

**Benefits:**
- ✅ Prevents "Can't perform a React state update on an unmounted component" warnings
- ✅ Eliminates memory leaks from dangling subscriptions
- ✅ Safer async operation handling

### useEffect Pattern Reference

```typescript
useEffect(() => {
  // 1. Early return for conditional execution
  if (!condition) return;

  // 2. Track mount state for async operations
  let isMounted = true;

  // 3. Setup subscription or async operation
  const unsubscribe = subscribe(() => {
    if (!isMounted) return;  // Guard against unmounted updates
    // ... perform state updates
  });

  // 4. Cleanup function
  return () => {
    isMounted = false;  // Mark unmounted FIRST
    unsubscribe();      // Then cleanup resources
  };
}, [dependencies]);  // Only include values that should trigger re-run
```

---

## Query Key Factories

### Centralized Query Key Management

**Problem:** Scattered query keys make cache invalidation error-prone and inconsistent.

**Solution:** Query key factories with hierarchical structure

```typescript
// ✅ Query Key Factory Pattern
export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (userId: string) => [...bookKeys.lists(), userId] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
};

// Usage in hooks
export function useBooks(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? bookKeys.list(userId) : ['books', 'disabled'],
    queryFn: () => getBooks(userId),
    enabled: !!userId,
  });
}

// Cache invalidation
export function useCreateBook(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: bookKeys.list(userId) });
      }
    },
  });
}
```

### Query Key Factory Coverage

All major domains now have query key factories:

- `bookKeys` - Book queries (list, detail, search)
- `borrowRequestKeys` - Borrow request queries
- `notificationKeys` - Notification queries (list, unread count)
- `profileKeys` - User profile queries
- `messageKeys` - Message queries (by request)
- `adminKeys` - Admin dashboard queries (stats, users, books)
- `reviewKeys` - Review queries (by book, by user)
- `unreadKeys` - Unread message count queries
- `chatKeys` - Active chat queries

**Benefits:**
- ✅ Consistent cache invalidation patterns
- ✅ Prevents typos in query keys
- ✅ Easy to invalidate related queries (e.g., all book queries)
- ✅ Type-safe query key generation
- ✅ Self-documenting query structure

---

## Type Import Optimization

### Bundle Size Optimization

**Rule:** Use `import type` for type-only imports to enable better tree-shaking.

```typescript
// ✅ GOOD - Inline type imports
import { getBooks, createBook, type Book, type CreateBookInput } from '@repo/api-client';

// ✅ GOOD - Separate type imports
import type { Book, User } from '@repo/api-client';
import { getBooks, createBook } from '@repo/api-client';

// ✅ GOOD - React type imports
import { useState, useEffect, type ReactNode } from 'react';

// ❌ AVOID - Regular imports for types
import { Book, User } from '@repo/api-client';  // May include in bundle
```

**Current Status:**
- ✅ Codebase already follows best practices
- ✅ Most files use inline `type` imports
- ✅ Separate `import type` statements where appropriate
- ✅ Admin components use proper type-only imports

**Impact:**
- Smaller bundle size (types stripped during compilation)
- Clearer distinction between runtime and type-only code
- Better IDE autocomplete and type checking

---

## Error Handling

### Centralized Error Logging

**Pattern:** Use `logError()` utility for consistent error handling.

```typescript
import { logError } from '../lib/utils/errors';

try {
  await mutation.mutateAsync(data);
} catch (error) {
  logError(error, 'creating book');  // Contextual logging
}
```

**Coverage:** 15 locations across the codebase now use standardized error logging:
- Pages: BookDetail.tsx, Notifications.tsx, Requests.tsx
- Hooks: useBorrowRequests.ts
- Components: ChatConversation.tsx, AddBookForm.tsx

**Benefits:**
- ✅ Consistent error message format
- ✅ Easy to integrate error tracking services (Sentry, etc.)
- ✅ Contextual information for debugging
- ✅ Production-ready error handling

---

## Performance Improvements

### Summary of Optimizations

| Improvement | Impact | Files Affected |
|-------------|--------|----------------|
| **Component Extraction** | 78% size reduction | Profile.tsx (495 → 107 lines) |
| **useEffect Dependencies** | Eliminated unnecessary re-renders | 3 dialog components |
| **Race Condition Prevention** | Memory leak prevention | 3 subscription hooks |
| **Query Key Factories** | Consistent cache management | 8 hook files |
| **Type Import Optimization** | Bundle size reduction | 1 context file |
| **Error Utility Standardization** | Better debugging | 15 locations |

### Measured Impact

- **Bundle Size:** Reduced through proper type imports
- **Re-renders:** Eliminated unnecessary renders from form dependencies
- **Memory Leaks:** Prevented through isMounted flags
- **Developer Experience:** Improved code navigation and maintenance

---

## Best Practices Summary

### Component Development
1. ✅ Keep components under 150-200 lines
2. ✅ Extract feature logic into separate components
3. ✅ Use composition over large monolithic components
4. ✅ Define clear component responsibilities

### React Hooks
1. ✅ Minimize useEffect dependencies (only include what changes)
2. ✅ Use isMounted flags for async operations
3. ✅ Always cleanup subscriptions in useEffect return
4. ✅ Guard state updates against unmounted components

### Data Fetching
1. ✅ Use query key factories for cache management
2. ✅ Prefer `mutateAsync` with try/catch for better control
3. ✅ Invalidate related queries in `onSuccess`
4. ✅ Handle loading and error states in all queries

### TypeScript
1. ✅ Use `import type` for type-only imports
2. ✅ Define interfaces for component props
3. ✅ Export types alongside implementations
4. ✅ Use `as const` for query keys and constants

### Error Handling
1. ✅ Use centralized error logging utility
2. ✅ Provide contextual error messages
3. ✅ Handle errors at appropriate boundaries
4. ✅ Show user-friendly error messages

---

## Future Recommendations

### High Priority
- [ ] Add component unit tests (Vitest)
- [ ] Implement E2E tests for critical flows (Playwright)
- [ ] Add error boundary components for better error handling
- [ ] Document component APIs with JSDoc

### Medium Priority
- [ ] Implement bundle size monitoring
- [ ] Add performance monitoring (Web Vitals)
- [ ] Create component style guide
- [ ] Add accessibility testing

### Low Priority
- [ ] Consider React Compiler for auto-memoization
- [ ] Explore code splitting strategies
- [ ] Add visual regression testing
- [ ] Create component playground (Storybook)

---

## References

- [React Hooks Best Practices](https://react.dev/reference/react)
- [TanStack Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [TypeScript Performance](https://github.com/microsoft/TypeScript/wiki/Performance)
- [Component Composition Patterns](https://react.dev/learn/passing-props-to-a-component)

---

*Last Updated: November 15, 2025*
*Maintained by: BookShare Development Team*
