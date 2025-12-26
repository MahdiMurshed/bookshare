# Code Quality Improvements

Address DRY violations, error handling consistency, and code smells.

---

## Error Handling Consistency

### Task 1: Replace alert() with Toast Notifications

**Affected Files:**
- `apps/web/src/pages/CommunityDetail.tsx:99, 110-111`
- `apps/web/src/components/Communities/CommunitySettings.tsx:129, 143-146`

**Current:**
```typescript
alert('Failed to delete community. Please try again.');
alert('Ownership transferred successfully! You are now an admin.');
```

**Fix:**
```typescript
import { toast } from 'sonner';  // or @repo/ui toast

toast.error('Failed to delete community. Please try again.');
toast.success('Ownership transferred successfully!');
```

**Acceptance Criteria:**
- [ ] All 4 `alert()` calls replaced
- [ ] All 2 `confirm()` calls replaced with AlertDialog
- [ ] Toast notifications styled consistently

---

### Task 2: Replace confirm() with AlertDialog

**Affected Files:**
- `apps/web/src/pages/CommunityDetail.tsx:99`

**Current:**
```typescript
if (!confirm('Are you sure you want to leave this community?')) return;
```

**Fix:**
```typescript
// Use AlertDialog from shadcn/ui
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="outline">Leave Community</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Leave Community?</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to leave this community?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleLeave}>Leave</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### Task 3: Standardize Error Logging to logError()

**Affected Files (20+ locations):**
- `apps/web/src/pages/CommunityDetail.tsx:92, 107`
- `apps/web/src/pages/Communities.tsx:60`
- `apps/web/src/components/Header.tsx:75`
- `apps/web/src/components/Admin/EditBookDialog.tsx:112`
- `apps/web/src/components/Forms/BookAutocomplete.tsx:35`
- `apps/web/src/components/Requests/ChatDialog.tsx:68`
- `apps/web/src/components/Admin/AdminNotificationsTab.tsx:119`
- `apps/web/src/components/Admin/EditUserDialog.tsx:103`
- `apps/web/src/components/Communities/CommunitySettings.tsx:116,128,145`
- `apps/web/src/components/Communities/AddBookToCommunityModal.tsx:87`
- `apps/web/src/components/modals/EditBookModal.tsx:72,130`
- `apps/web/src/components/modals/DeleteBookModal.tsx:34`
- `apps/web/src/components/Communities/CreateCommunityModal.tsx:66`
- `apps/web/src/components/Communities/CommunityMembersTab.tsx:54,63,72,81,94`
- `apps/web/src/components/Communities/InviteMemberModal.tsx:67,89`

**Current:**
```typescript
console.error('Failed to join community:', error);
```

**Fix:**
```typescript
import { logError } from '../lib/utils/errors';

logError(error, 'joining community');
```

**Search Pattern:**
```bash
grep -r "console.error" apps/web/src --include="*.tsx" --include="*.ts"
```

---

### Task 4: Remove Debug console.log Statements

**Affected Files:**
- `packages/api-client/src/communities.ts:270, 277, 303`
- `packages/api-client/src/messages.ts:159`

**Current:**
```typescript
console.log('Creating community with user ID:', session.user.id);
console.log('Community data:', { ...input, created_by: session.user.id });
console.log('Community created successfully:', data);
console.log(`[Messages] Subscribed to request: ${requestId}`);
```

**Fix:** Remove all console.log statements from production code.

---

## DRY Violations

### Task 5: Extract Filter/Sort Logic (HIGH PRIORITY)

**Affected Files:**
- `apps/web/src/pages/Requests.tsx:52-75, 78-101`

**Current:** Nearly identical filter/sort logic duplicated for incoming and outgoing requests.

**Fix:** Create utility function:

```typescript
// apps/web/src/lib/utils/requestFilters.ts
import type { BorrowRequestWithDetails } from '@repo/api-client';

type SortBy = 'newest' | 'oldest' | 'title';

export function filterAndSortRequests(
  requests: BorrowRequestWithDetails[],
  statusFilter: string,
  sortBy: SortBy
): BorrowRequestWithDetails[] {
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
}
```

**Usage:**
```typescript
const filteredIncomingRequests = useMemo(
  () => filterAndSortRequests(incomingRequests, incomingStatusFilter, incomingSortBy),
  [incomingRequests, incomingStatusFilter, incomingSortBy]
);
```

---

### Task 6: Create useDebouncedValue Hook

**Affected Files:**
- `apps/web/src/pages/Browse.tsx:32-38`
- `apps/web/src/pages/Communities.tsx:32-38`

**Current:** Same debounce pattern duplicated.

**Fix:**
```typescript
// apps/web/src/hooks/useDebouncedValue.ts
import { useState, useEffect } from 'react';

export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

**Usage:**
```typescript
const debouncedSearch = useDebouncedValue(searchQuery, 300);
```

---

### Task 7: Create useBookFilters Hook

**Affected File:** `apps/web/src/pages/Browse.tsx:24-29`

**Current:** 7 useState calls for filter state.

**Fix:**
```typescript
// apps/web/src/hooks/useBookFilters.ts
export interface BookFilterState {
  searchQuery: string;
  genreFilter: string;
  conditionFilter: string;
  availableOnly: boolean;
  communityFilter: string;
}

export function useBookFilters() {
  const [filters, setFilters] = useState<BookFilterState>({
    searchQuery: '',
    genreFilter: 'all',
    conditionFilter: 'all',
    availableOnly: false,
    communityFilter: 'all',
  });

  const updateFilter = <K extends keyof BookFilterState>(
    key: K,
    value: BookFilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      genreFilter: 'all',
      conditionFilter: 'all',
      availableOnly: false,
      communityFilter: 'all',
    });
  }, []);

  const activeFilterCount = useMemo(() => {
    return [
      !!filters.searchQuery,
      filters.genreFilter !== 'all',
      filters.conditionFilter !== 'all',
      filters.availableOnly,
      filters.communityFilter !== 'all',
    ].filter(Boolean).length;
  }, [filters]);

  return { filters, updateFilter, clearFilters, activeFilterCount };
}
```

---

### Task 8: Use Spread Operator for BookFilters Props

**Affected File:** `apps/web/src/pages/Browse.tsx:216-253`

**Current:** Same props passed twice (desktop and mobile).

**Fix:**
```typescript
const filterProps = {
  searchQuery,
  genreFilter,
  conditionFilter,
  availableOnly,
  communityFilter,
  userCommunities,
  onSearchChange: setSearchQuery,
  onGenreChange: setGenreFilter,
  onConditionChange: setConditionFilter,
  onAvailableOnlyChange: setAvailableOnly,
  onCommunityChange: setCommunityFilter,
  onClearFilters: handleClearFilters,
  activeFilterCount,
};

// Usage
<BookFilters {...filterProps} />
```

---

### Task 9: Create FilterButton Component

**Affected File:** `apps/web/src/components/Browse/BookFilters.tsx:161-186, 196-221`

**Current:** Genre and condition filter buttons have identical structure.

**Fix:**
```typescript
// apps/web/src/components/Browse/FilterButton.tsx
interface FilterButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export function FilterButton({ label, isSelected, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors',
        isSelected
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border hover:border-primary/50'
      )}
    >
      {label}
    </button>
  );
}
```

---

### Task 10: Consolidate Dialog State in Requests Page

**Affected File:** `apps/web/src/pages/Requests.tsx:33-37`

**Current:**
```typescript
const [selectedRequest, setSelectedRequest] = useState<...>(null);
const [approveDialogOpen, setApproveDialogOpen] = useState(false);
const [denyDialogOpen, setDenyDialogOpen] = useState(false);
const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
const [returnDialogOpen, setReturnDialogOpen] = useState(false);
```

**Fix:**
```typescript
type DialogType = 'approve' | 'deny' | 'tracking' | 'return' | null;

interface DialogState {
  type: DialogType;
  request: BorrowRequestWithDetails | null;
}

const [dialog, setDialog] = useState<DialogState>({ type: null, request: null });

const openDialog = (type: DialogType, request: BorrowRequestWithDetails) => {
  setDialog({ type, request });
};

const closeDialog = () => {
  setDialog({ type: null, request: null });
};
```

---

## Dead Code Removal

### Task 11: Remove Commented-Out Code

**Affected Files:**
- `packages/api-client/src/books.ts:75` - DELETE
- `packages/api-client/src/books.ts:226` - DELETE
- `packages/api-client/src/reviews.ts:56` - DELETE
- `packages/api-client/src/notifications.ts:53` - DELETE
- `packages/api-client/src/borrowRequests.ts:88` - DELETE

All are remnants of previous REST API implementation:
```typescript
// const params = new URLSearchParams(filters as any);
```

---

## Code Smells

### Task 12: Extract Magic Numbers to Constants

**Affected Files:**
- `apps/web/src/pages/Browse.tsx:35` - Debounce delay
- `apps/web/src/components/Header.tsx:64` - Scroll threshold

**Fix:**
```typescript
// apps/web/src/lib/constants/ui.ts
export const DEBOUNCE_DELAY_MS = 300;
export const SCROLL_THRESHOLD_PX = 10;
```

---

### Task 13: Fix Boolean Naming

**Affected Files:**
- `apps/web/src/pages/Browse.tsx:27` - `availableOnly` → `showAvailableOnly`
- `apps/web/src/components/Header.tsx:59` - `scrolled` → `isScrolled`

---

## Summary

| Task | Priority | Effort |
|------|----------|--------|
| Replace alert() | HIGH | 30 min |
| Replace confirm() | HIGH | 30 min |
| Standardize logError() | HIGH | 1 hour |
| Remove console.log | MEDIUM | 15 min |
| Extract filter logic | HIGH | 45 min |
| Create useDebouncedValue | MEDIUM | 15 min |
| Create useBookFilters | MEDIUM | 30 min |
| Spread operator for props | LOW | 10 min |
| Create FilterButton | MEDIUM | 20 min |
| Consolidate dialog state | MEDIUM | 30 min |
| Remove dead code | LOW | 10 min |
| Magic numbers | LOW | 10 min |
| Boolean naming | LOW | 10 min |

**Total Estimated Effort:** 4-5 hours
