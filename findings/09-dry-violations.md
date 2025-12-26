# DRY Violations Audit

## DUPLICATION 1: Filter and Sort Logic

### Instance 1: Incoming Requests Filtering
**FILE:** `apps/web/src/pages/Requests.tsx:52-75`
```typescript
const filteredIncomingRequests = useMemo(() => {
  let filtered = incomingRequests;
  if (incomingStatusFilter !== 'all') {
    filtered = filtered.filter((r) => r.status === incomingStatusFilter);
  }
  const sorted = [...filtered].sort((a, b) => {
    if (incomingSortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (incomingSortBy === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else {
      const titleA = a.book?.title || '';
      const titleB = b.book?.title || '';
      return titleA.localeCompare(titleB);
    }
  });
  return sorted;
}, [incomingRequests, incomingStatusFilter, incomingSortBy]);
```

### Instance 2: Outgoing Requests Filtering (NEARLY IDENTICAL)
**FILE:** `apps/web/src/pages/Requests.tsx:78-101`
```typescript
const filteredMyRequests = useMemo(() => {
  let filtered = myRequests;
  if (outgoingStatusFilter !== 'all') {
    filtered = filtered.filter((r) => r.status === outgoingStatusFilter);
  }
  const sorted = [...filtered].sort((a, b) => {
    if (outgoingSortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (outgoingSortBy === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else {
      const titleA = a.book?.title || '';
      const titleB = b.book?.title || '';
      return titleA.localeCompare(titleB);
    }
  });
  return sorted;
}, [myRequests, outgoingStatusFilter, outgoingSortBy]);
```

**SIMILARITY:** ~95%

**EXTRACT TO:** `lib/utils/requestFilters.ts` or `hooks/useFilteredRequests.ts`

```typescript
// lib/utils/requestFilters.ts
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

// Usage:
const filteredIncomingRequests = useMemo(
  () => filterAndSortRequests(incomingRequests, incomingStatusFilter, incomingSortBy),
  [incomingRequests, incomingStatusFilter, incomingSortBy]
);
```

---

## DUPLICATION 2: Dialog Open Handler Pattern

### Pattern Repeated 4+ Times
**FILE:** `apps/web/src/pages/Requests.tsx:103-117, 169-175, 192-198`

```typescript
const handleApproveClick = (requestId: string) => {
  const request = incomingRequests.find((r) => r.id === requestId);
  if (request) {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  }
};

const handleDenyClick = (requestId: string) => {
  const request = incomingRequests.find((r) => r.id === requestId);
  if (request) {
    setSelectedRequest(request);
    setDenyDialogOpen(true);
  }
};

// Similar for handleAddTracking, handleInitiateReturn
```

**EXTRACT TO:** Single handler with dialog type:

```typescript
type DialogType = 'approve' | 'deny' | 'tracking' | 'return';

const openDialog = (requestId: string, type: DialogType, source: 'incoming' | 'outgoing') => {
  const requests = source === 'incoming' ? incomingRequests : myRequests;
  const request = requests.find(r => r.id === requestId);
  if (request) {
    setSelectedRequest(request);
    setActiveDialog(type);
  }
};

// Usage:
onApprove={(id) => openDialog(id, 'approve', 'incoming')}
```

---

## DUPLICATION 3: Tab Content Structure

### TabsContent Pattern (Browse Filters)
**FILE:** `apps/web/src/pages/Browse.tsx:216-253`

Desktop and mobile filters render the same component with same props:
```typescript
{/* Desktop */}
<BookFilters
  searchQuery={searchQuery}
  genreFilter={genreFilter}
  conditionFilter={conditionFilter}
  availableOnly={availableOnly}
  communityFilter={communityFilter}
  userCommunities={userCommunities}
  onSearchChange={setSearchQuery}
  onGenreChange={setGenreFilter}
  onConditionChange={setConditionFilter}
  onAvailableOnlyChange={setAvailableOnly}
  onCommunityChange={setCommunityFilter}
  onClearFilters={handleClearFilters}
  activeFilterCount={activeFilterCount}
/>

{/* Mobile - IDENTICAL props */}
<BookFilters
  searchQuery={searchQuery}
  ...
/>
```

**EXTRACT TO:** Common props object:

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

// Usage:
<BookFilters {...filterProps} />
```

---

## DUPLICATION 4: Loading Skeleton Patterns

### AdminAnalyticsTab Skeletons
Multiple sections have nearly identical skeleton loading patterns.

**FILE:** `apps/web/src/components/Admin/AdminAnalyticsTab.tsx`
- Lines 93-97: KPI skeleton
- Lines 127-133: Card skeleton
- Lines 221-227: User skeleton
- Lines 372-378: Book skeleton

**EXTRACT TO:** Shared skeleton components already exist in `@repo/ui`, but inline usage could be consolidated.

---

## DUPLICATION 5: Query Invalidation Patterns

### Hook Pattern Repetition
**FILE:** `apps/web/src/hooks/useCommunities.ts`

```typescript
// Pattern repeated in multiple mutations:
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
  if (userId) {
    queryClient.invalidateQueries({ queryKey: communityKeys.myCommunities(userId) });
  }
}
```

**Assessment:** This is somewhat acceptable as the invalidation logic varies per mutation. However, could consider a helper:

```typescript
function invalidateCommunityQueries(queryClient: QueryClient, userId?: string) {
  queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
  if (userId) {
    queryClient.invalidateQueries({ queryKey: communityKeys.myCommunities(userId) });
  }
}
```

---

## DUPLICATION 6: Button Filter Pattern in BookFilters

**FILE:** `apps/web/src/components/Browse/BookFilters.tsx:161-186, 196-221`

Genre and Condition filter buttons have identical structure:
```typescript
{BOOK_GENRES.map((genre) => (
  <button
    key={genre}
    onClick={() => onGenreChange(genre)}
    className={`w-full text-left px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
      genreFilter === genre
        ? 'border-primary bg-primary/10 text-primary'
        : 'border-border hover:border-primary/50'
    }`}
  >
    {genre}
  </button>
))}

// Nearly identical for conditions
{BOOK_CONDITIONS.map((condition) => (
  <button
    key={condition}
    onClick={() => onConditionChange(condition)}
    ...
  >
    {condition}
  </button>
))}
```

**EXTRACT TO:** Reusable FilterButton component:

```typescript
interface FilterButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

function FilterButton({ label, isSelected, onClick, className }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors',
        isSelected
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border hover:border-primary/50',
        className
      )}
    >
      {label}
    </button>
  );
}
```

---

## Summary

| Duplication | Files | Similarity | Priority |
|-------------|-------|------------|----------|
| Filter/Sort logic | Requests.tsx | 95% | HIGH |
| Dialog open handlers | Requests.tsx | 90% | MEDIUM |
| BookFilters props | Browse.tsx | 100% | LOW |
| Skeleton patterns | AdminAnalyticsTab.tsx | 80% | LOW |
| Query invalidation | Multiple hooks | 70% | LOW |
| Filter buttons | BookFilters.tsx | 90% | MEDIUM |

**Quick Wins:**
1. Extract `filterAndSortRequests` utility (HIGH impact)
2. Use spread operator for BookFilters props (LOW effort)
3. Create FilterButton component (MEDIUM effort)

**Longer Term:**
1. Consolidate dialog state management
2. Create shared skeleton components for admin
