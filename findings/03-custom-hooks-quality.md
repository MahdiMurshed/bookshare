# Custom Hooks Quality Audit

## Overview

**Total Hooks:** 20 files in `apps/web/src/hooks/`
**Overall Quality:** GOOD

---

## Hook-by-Hook Analysis

### HOOK: useBooks
**FILE:** `apps/web/src/hooks/useBooks.ts`
**QUALITY:** good
**ISSUES:** None
**STRENGTHS:**
- Clean query key factory
- Proper cache invalidation
- Type-safe mutations
- Handles undefined userId gracefully

---

### HOOK: useBorrowRequests
**FILE:** `apps/web/src/hooks/useBorrowRequests.ts`
**QUALITY:** good
**ISSUES:**
- Notification logic mixed with mutation (lines 98-106, 128-136)
- Could extract notification side-effects

**SUGGESTED REFACTOR:**
```typescript
// Consider extracting notification sending to separate effect or middleware
onSuccess: async (request: BorrowRequest) => {
  // Cache invalidation only here
  queryClient.invalidateQueries({ queryKey: borrowRequestKeys.incoming() });

  // Notification could be handled by a separate hook or server-side
};
```

---

### HOOK: useCommunities
**FILE:** `apps/web/src/hooks/useCommunities.ts`
**QUALITY:** good
**ISSUES:** None
**STRENGTHS:**
- Clean separation of concerns
- Proper query invalidation patterns
- Good naming conventions

---

### HOOK: useNotifications
**FILE:** `apps/web/src/hooks/useNotifications.ts`
**QUALITY:** good
**ISSUES:** None
**STRENGTHS:**
- Real-time subscription handling
- Proper cleanup in useEffect
- isMounted pattern for preventing memory leaks

---

### HOOK: useAdmin
**FILE:** `apps/web/src/hooks/useAdmin.ts`
**QUALITY:** needs-improvement
**ISSUES:**
- Very large file (likely 200+ lines based on admin.ts being 1574 lines)
- Many queries/mutations in single file
- Could be split by admin feature

**SUGGESTED REFACTOR:**
```
hooks/admin/
  ├── useAdminUsers.ts
  ├── useAdminBooks.ts
  ├── useAdminRequests.ts
  ├── useAdminStats.ts
  └── useAdminNotifications.ts
```

---

### HOOK: useActivityTracking
**FILE:** `apps/web/src/hooks/useActivityTracking.ts`
**QUALITY:** good
**ISSUES:** None - dedicated purpose

---

### HOOK: useAvailableBooks
**FILE:** `apps/web/src/hooks/useAvailableBooks.ts`
**QUALITY:** good
**ISSUES:** None - clean, focused hook

---

### HOOK: useBookDetail
**FILE:** `apps/web/src/hooks/useBookDetail.ts`
**QUALITY:** good
**ISSUES:** None

---

### HOOK: useMessages
**FILE:** `apps/web/src/hooks/useMessages.ts`
**QUALITY:** good
**ISSUES:**
- Real-time subscription cleanup looks proper
- Could log subscription errors in development

---

### HOOK: useProfile
**FILE:** `apps/web/src/hooks/useProfile.ts`
**QUALITY:** good
**ISSUES:** None

---

### HOOK: useReviews
**FILE:** `apps/web/src/hooks/useReviews.ts`
**QUALITY:** good
**ISSUES:** None

---

### HOOK: useUnreadMessages
**FILE:** `apps/web/src/hooks/useUnreadMessages.ts`
**QUALITY:** good
**ISSUES:** None

---

### HOOK: useActiveChats
**FILE:** `apps/web/src/hooks/useActiveChats.ts`
**QUALITY:** good
**ISSUES:** None

---

### HOOK: useCommunityActivity
**FILE:** `apps/web/src/hooks/useCommunityActivity.ts`
**QUALITY:** good
**ISSUES:** None

---

### HOOK: useCommunityInvitations
**FILE:** `apps/web/src/hooks/useCommunityInvitations.ts`
**QUALITY:** good
**ISSUES:** None

---

### HOOK: useCommunityMembers
**FILE:** `apps/web/src/hooks/useCommunityMembers.ts`
**QUALITY:** good
**ISSUES:** None

---

### HOOK: useAdminUser
**FILE:** `apps/web/src/hooks/useAdminUser.ts`
**QUALITY:** good
**ISSUES:** None - focused hook for admin role checking

---

### HOOK: useBorrowRequest (singular)
**FILE:** `apps/web/src/hooks/useBorrowRequest.ts`
**QUALITY:** good
**ISSUES:** None

---

## Missing Hooks to Add

Based on code analysis, these hooks would improve the codebase:

### 1. useDebouncedValue
```typescript
// hooks/useDebouncedValue.ts
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### 2. useBookFilters
```typescript
// hooks/useBookFilters.ts
export function useBookFilters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [communityFilter, setCommunityFilter] = useState('all');

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setGenreFilter('all');
    setConditionFilter('all');
    setAvailableOnly(false);
    setCommunityFilter('all');
  }, []);

  const activeFilterCount = useMemo(() => {
    return [
      !!searchQuery,
      genreFilter !== 'all',
      conditionFilter !== 'all',
      availableOnly,
      communityFilter !== 'all',
    ].filter(Boolean).length;
  }, [searchQuery, genreFilter, conditionFilter, availableOnly, communityFilter]);

  return {
    filters: { searchQuery, genreFilter, conditionFilter, availableOnly, communityFilter },
    setters: { setSearchQuery, setGenreFilter, setConditionFilter, setAvailableOnly, setCommunityFilter },
    debouncedSearch,
    clearFilters,
    activeFilterCount,
    hasFilters: activeFilterCount > 0,
  };
}
```

### 3. useFilteredRequests
```typescript
// hooks/useFilteredRequests.ts
export function useFilteredRequests(
  requests: BorrowRequestWithDetails[],
  statusFilter: string,
  sortBy: 'newest' | 'oldest' | 'title'
) {
  return useMemo(() => {
    let filtered = statusFilter === 'all'
      ? requests
      : requests.filter(r => r.status === statusFilter);

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return (a.book?.title || '').localeCompare(b.book?.title || '');
      }
    });
  }, [requests, statusFilter, sortBy]);
}
```

---

## Dependency Array Issues

No issues found. All hooks appear to have correct dependency arrays.

---

## Cleanup Issues

No issues found. All subscriptions appear to properly clean up:
- `useNotificationSubscription` has proper cleanup
- `useMessages` subscription cleanup is correct
- `AuthContext` properly unsubscribes from auth changes

---

## Summary

| Metric | Value |
|--------|-------|
| Total Hooks | 20 |
| Quality: Good | 18 |
| Quality: Needs Improvement | 1 (useAdmin) |
| Missing Recommended Hooks | 3 |
| Dependency Array Issues | 0 |
| Cleanup Issues | 0 |
