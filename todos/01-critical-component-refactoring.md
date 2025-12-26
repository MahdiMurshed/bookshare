# Critical Component Refactoring Tasks

These are the highest priority refactoring tasks. Components/files exceeding size limits that significantly impact maintainability.

---

## Task 1: Split admin.ts (HIGHEST PRIORITY)

**File:** `packages/api-client/src/admin.ts`
**Current Size:** 1574 lines
**Target:** ~200 lines per file

### Refactor Structure
```
packages/api-client/src/admin/
├── index.ts          # Barrel exports
├── types.ts          # Admin-specific types
├── users.ts          # User management functions
├── books.ts          # Book management functions
├── requests.ts       # Request management functions
├── communities.ts    # Community management functions
├── stats.ts          # Statistics/analytics functions
└── notifications.ts  # Notification management functions
```

### Acceptance Criteria
- [ ] All existing exports preserved
- [ ] No breaking changes to consumers
- [ ] Each file <250 lines
- [ ] Types properly defined in types.ts

---

## Task 2: Split AdminAnalyticsTab (8 Components)

**File:** `apps/web/src/components/Admin/AdminAnalyticsTab.tsx`
**Current Size:** 705 lines
**Target:** ~100 lines per component

### Refactor Structure
```
apps/web/src/components/Admin/Analytics/
├── index.tsx                  # Main AdminAnalyticsTab (orchestration)
├── PlatformKPIsSection.tsx    # Lines 77-165
├── MostActiveUsersSection.tsx # Lines 257-342
├── MostBorrowedBooksSection.tsx # Lines 357-445
├── BorrowDurationSection.tsx  # Lines 460-530
├── UserRetentionSection.tsx   # Lines 545-620
└── shared/
    ├── KPICard.tsx            # Reusable KPI display
    ├── GrowthIndicator.tsx    # Growth percentage badge
    └── StarRating.tsx         # Rating display
```

### Acceptance Criteria
- [ ] Main component <150 lines
- [ ] Each section component <120 lines
- [ ] Shared components extracted
- [ ] Loading states preserved

---

## Task 3: Split Header Component

**File:** `apps/web/src/components/Header.tsx`
**Current Size:** 388 lines
**Target:** ~100 lines per component

### Refactor Structure
```
apps/web/src/components/Header/
├── index.tsx         # Main Header (scroll detection, structure)
├── DesktopNav.tsx    # Desktop navigation links
├── MobileNav.tsx     # Mobile sheet navigation
├── UserMenu.tsx      # Avatar + dropdown menu
└── NavItem.tsx       # Reusable nav link component
```

### Acceptance Criteria
- [ ] Main Header <120 lines
- [ ] Desktop/Mobile nav separated
- [ ] UserMenu reusable
- [ ] Scroll detection remains in main Header

---

## Task 4: Refactor Notifications Page

**File:** `apps/web/src/pages/Notifications.tsx`
**Current Size:** 439 lines
**Target:** <150 lines

### Extraction Plan
1. Extract `NotificationItem` component
2. Extract `NotificationActions` component (handles join/invite buttons)
3. Create `useNotificationsPage` hook for state/handlers

### Structure
```
apps/web/src/components/Notifications/
├── NotificationItem.tsx      # Single notification display
├── NotificationActions.tsx   # Action buttons per type
└── NotificationFilters.tsx   # Filter tabs

apps/web/src/hooks/
└── useNotificationsPage.ts   # State + mutation handlers
```

### Acceptance Criteria
- [ ] Page component <150 lines
- [ ] NotificationActions handles all type-specific actions
- [ ] Business logic in hook

---

## Task 5: Refactor Requests Page

**File:** `apps/web/src/pages/Requests.tsx`
**Current Size:** 412 lines
**Target:** <150 lines

### Extraction Plan
1. Create `useRequestsPage` hook (8 mutations + state)
2. Extract filter/sort logic to `lib/utils/requestFilters.ts`
3. Consolidate dialog state

### Structure
```
apps/web/src/hooks/
└── useRequestsPage.ts        # All state + handlers

apps/web/src/lib/utils/
└── requestFilters.ts         # filterAndSortRequests()
```

### Acceptance Criteria
- [ ] Page component <150 lines
- [ ] Single dialog state object
- [ ] Filter logic reusable

---

## Task 6: Refactor Home Page

**File:** `apps/web/src/pages/Home.tsx`
**Current Size:** 413 lines
**Target:** <200 lines

### Extraction Plan
Extract inline components:
- `FloatingBookCard` → `components/Home/FloatingBookCard.tsx`
- `FeatureCard` → `components/Home/FeatureCard.tsx`

### Acceptance Criteria
- [ ] Page component <200 lines
- [ ] Sub-components properly typed
- [ ] Animations preserved

---

## Task 7: Refactor AdminBooksTab

**File:** `apps/web/src/components/Admin/AdminBooksTab.tsx`
**Current Size:** 381 lines
**Target:** <150 lines

### Extraction Plan
1. Extract table to `AdminBooksTable.tsx`
2. Move mutations to dedicated hook
3. Create query key factory in `adminKeys`

### Acceptance Criteria
- [ ] Main component <150 lines
- [ ] Query keys use factory pattern
- [ ] Table component reusable

---

## Task 8: Refactor CommunitySettings

**File:** `apps/web/src/components/Communities/CommunitySettings.tsx`
**Current Size:** 445 lines
**Target:** <150 lines

### Extraction Plan
1. Extract each settings section to separate component
2. Create `useCommunitySettings` hook

### Structure
```
apps/web/src/components/Communities/Settings/
├── index.tsx                 # Main container
├── GeneralSettings.tsx       # Name, description, privacy
├── MembershipSettings.tsx    # Join approval settings
├── OwnershipTransfer.tsx     # Transfer ownership form
└── DangerZone.tsx           # Delete community
```

---

## Task 9: Refactor AdminRequestsTab

**File:** `apps/web/src/components/Admin/AdminRequestsTab.tsx`
**Current Size:** 396 lines
**Target:** <150 lines

### Extraction Plan
1. Extract table to `AdminRequestsTable.tsx`
2. Extract action menu to `RequestActionsMenu.tsx`
3. Use query key factory

---

## Task 10: Refactor Browse Page

**File:** `apps/web/src/pages/Browse.tsx`
**Current Size:** 298 lines
**Target:** <150 lines

### Extraction Plan
1. Create `useBookFilters` hook for all filter state
2. Create `useBrowseFilters` hook that combines filter state + debounce
3. Use spread operator for BookFilters props

```typescript
// Usage after refactor
const { filters, ...filterHandlers } = useBookFilters();
const debouncedSearch = useDebouncedValue(filters.searchQuery);

<BookFilters {...filters} {...filterHandlers} />
```

---

## Summary

| Priority | File | Lines | Reduction Target |
|----------|------|-------|------------------|
| 1 | admin.ts | 1574 | 200/file |
| 2 | AdminAnalyticsTab | 705 | 100/component |
| 3 | Notifications.tsx | 439 | <150 |
| 4 | Home.tsx | 413 | <200 |
| 5 | Requests.tsx | 412 | <150 |
| 6 | AdminRequestsTab | 396 | <150 |
| 7 | Header.tsx | 388 | <120 |
| 8 | AdminBooksTab | 381 | <150 |
| 9 | CommunitySettings | 445 | <150 |
| 10 | Browse.tsx | 298 | <150 |

**Total Estimated Effort:** 6-8 hours
