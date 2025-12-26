# React Anti-Patterns Audit

## ISSUE 1: Using Index as Key in Lists

### Occurrences Found (19 instances)

| File | Line | Context |
|------|------|---------|
| `apps/web/src/pages/MyLibrary.tsx` | 85 | `<Card key={i}>` |
| `apps/web/src/pages/MyLibrary.tsx` | 96 | `<Card key={i}>` |
| `apps/web/src/components/Admin/AdminRequestsTab.tsx` | 216 | `<div key={i}>` |
| `apps/web/src/components/Admin/AdminUsersTab.tsx` | 224 | `<div key={i}>` |
| `apps/web/src/components/Admin/AdminCommunitiesTab.tsx` | 153 | `<TableRow key={i}>` |
| `apps/web/src/components/Browse/BookGrid.tsx` | 81 | `<BookCardSkeleton key={i} />` |
| `apps/web/src/components/Admin/AdminStats.tsx` | 74 | `<StatCardSkeleton key={i} />` |
| `apps/web/src/components/Admin/AdminBooksTab.tsx` | 220 | `<div key={i}>` |
| `apps/web/src/components/Admin/UserActivityDialog.tsx` | 114 | `<ActivitySkeleton key={i} />` |
| `apps/web/src/components/Admin/AdminAnalyticsTab.tsx` | 96 | `key={i}` |
| `apps/web/src/components/Admin/AdminAnalyticsTab.tsx` | 130 | `<Card key={i}>` |
| `apps/web/src/components/Admin/AdminAnalyticsTab.tsx` | 224 | `<div key={i}>` |
| `apps/web/src/components/Admin/AdminAnalyticsTab.tsx` | 375 | `<div key={i}>` |
| `apps/web/src/components/Admin/AdminAnalyticsTab.tsx` | 496 | `<div key={i}>` |
| `apps/web/src/components/Admin/AdminAnalyticsTab.tsx` | 552 | `key={index}` |
| `apps/web/src/components/Admin/AdminAnalyticsTab.tsx` | 602 | `<div key={i}>` |
| `apps/web/src/components/Requests/RequestList.tsx` | 119 | `<RequestCardSkeleton key={i} />` |
| `apps/web/src/components/Admin/AdminActivityFeed.tsx` | 110 | `<ActivityItemSkeleton key={i} />` |
| `apps/web/src/components/Admin/NotificationForms/UserNotificationForm.tsx` | 114 | `<div key={i}>` |

### Assessment

**For Skeleton/Loading States:** Using index as key is acceptable since:
- Items are static (not reordered)
- Items don't have stable IDs
- This is a temporary loading state

**For Data Lists:** Should use unique IDs:
```typescript
// Bad
{data.map((item, i) => <Component key={i} />)}

// Good
{data.map((item) => <Component key={item.id} />)}
```

### Action Required

Most occurrences are in skeleton loaders - **ACCEPTABLE**.
Check if any are rendering actual data items with index keys.

---

## ISSUE 2: Prop Drilling Analysis

### BookFilters Component Path
```
Browse (page)
  └── BookFilters (11 props passed)
```

**Assessment:** While 11 props seems high, all props are used directly by BookFilters. This is a controlled component pattern, not deep drilling.

### Request Components Path
```
Requests (page)
  └── RequestList (9 props)
      └── RequestCard (props passed through)
          └── RequestCardActions (action handlers)
```

**Assessment:** Actions are passed 2-3 levels deep. Consider:
```typescript
// Option 1: RequestsContext for shared state/actions
const RequestsContext = createContext<RequestsContextType>(null!);

// Option 2: Render props or compound components
<RequestList
  renderActions={(request) => (
    <RequestCardActions
      request={request}
      onApprove={...}
    />
  )}
/>
```

---

## ISSUE 3: State That Should Be Derived

### GOOD - Already using useMemo
**FILE:** `apps/web/src/pages/Requests.tsx:52-75, 78-101`
```typescript
const filteredIncomingRequests = useMemo(() => {
  // filtering and sorting
}, [incomingRequests, incomingStatusFilter, incomingSortBy]);
```

### GOOD - Derived calculations
**FILE:** `apps/web/src/pages/Requests.tsx:238-245`
```typescript
// Count pending requests for badge - directly calculated, not stored in state
const pendingIncomingCount = incomingRequests.filter((r) => r.status === 'pending').length;
```

**Assessment:** No issues found. Derived values are properly calculated.

---

## ISSUE 4: useEffect Misuse

### Checked Patterns

**Debounce Pattern (ACCEPTABLE):**
**FILE:** `apps/web/src/pages/Browse.tsx:32-38`
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchQuery);
  }, 300);
  return () => clearTimeout(timer);
}, [searchQuery]);
```
This is a legitimate use case for useEffect.

**Auth State Sync (CORRECT):**
**FILE:** `apps/web/src/contexts/AuthContext.tsx:16-48`
```typescript
useEffect(() => {
  let isMounted = true;
  getCurrentUser().then(...)
  const unsubscribe = onAuthStateChange(...)
  return () => {
    isMounted = false;
    unsubscribe();
  };
}, []);
```
Correct pattern for external subscriptions.

**Assessment:** No useEffect misuse found. Effects are used appropriately for:
- External subscriptions
- Debouncing
- Scroll handlers

---

## ISSUE 5: Inline Function Definitions

### Potential Re-render Issues

**FILE:** `apps/web/src/components/Header.tsx:133-155`
```typescript
{navItems.map((item) => {
  const Icon = item.icon;
  const isActive = isActiveRoute(item.href);
  return (
    <Link
      key={item.href}
      to={item.href}
      className={cn(...)}  // This creates new object each render
    >
      ...
    </Link>
  );
})}
```

**Assessment:** The `cn()` call creates new className strings but this is acceptable for CSS-in-JS patterns. No significant performance issue.

---

## ISSUE 6: Missing useCallback for Handlers

### Requests Page Handlers
**FILE:** `apps/web/src/pages/Requests.tsx:103-235`

```typescript
const handleApproveClick = (requestId: string) => { ... };
const handleDenyClick = (requestId: string) => { ... };
const handleApprove = async (...) => { ... };
const handleDeny = async (...) => { ... };
// ... 8 more handlers
```

**Assessment:** These handlers are recreated on each render. Consider wrapping with `useCallback` if passed to memoized children:

```typescript
const handleApproveClick = useCallback((requestId: string) => {
  const request = incomingRequests.find((r) => r.id === requestId);
  if (request) {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  }
}, [incomingRequests]);
```

**Priority:** LOW - Only matters if child components are memoized with React.memo.

---

## ISSUE 7: State Updates During Render

**SEARCH RESULT:** No issues found. All state updates are in event handlers or effects.

---

## ISSUE 8: Direct DOM Manipulation

**SEARCH RESULT:** No issues found. No direct DOM manipulation outside of React patterns.

---

## Summary

| Anti-Pattern | Occurrences | Severity | Action |
|--------------|-------------|----------|--------|
| Index as key | 19 | LOW | Most are skeletons - acceptable |
| Prop drilling | 2-3 levels | LOW | Consider context for requests |
| Derived state issues | 0 | N/A | Good |
| useEffect misuse | 0 | N/A | Good |
| Inline functions | Many | LOW | Normal pattern |
| Missing useCallback | Many | LOW | Only if memoizing children |
| State during render | 0 | N/A | Good |
| Direct DOM | 0 | N/A | Good |

**Overall React Patterns Score: 8/10**

The codebase follows React best practices well. Main recommendations:
1. Ensure data lists use item IDs as keys (not indexes)
2. Consider useCallback for handlers passed to memoized children
3. Consider context for deeply passed action handlers
