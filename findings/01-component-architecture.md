# Component Architecture Audit

## Files Exceeding 150 Lines (CLAUDE.md Standard)

### CRITICAL - Files Over 300 Lines

| Component | File | Lines | Primary Issue |
|-----------|------|-------|---------------|
| AdminAnalyticsTab | `apps/web/src/components/Admin/AdminAnalyticsTab.tsx` | 705 | WAY over limit - contains 8 sub-components |
| CommunitySettings | `apps/web/src/components/Communities/CommunitySettings.tsx` | 445 | Multiple forms and dialogs combined |
| Notifications | `apps/web/src/pages/Notifications.tsx` | 439 | Page + multiple handlers |
| Home | `apps/web/src/pages/Home.tsx` | 413 | Contains sub-components inline |
| Requests | `apps/web/src/pages/Requests.tsx` | 412 | Multiple tab contents |
| AdminRequestsTab | `apps/web/src/components/Admin/AdminRequestsTab.tsx` | 396 | Large table component |
| CommunityActivityFeed | `apps/web/src/components/Communities/CommunityActivityFeed.tsx` | 395 | Complex feed rendering |
| Header | `apps/web/src/components/Header.tsx` | 388 | Desktop + Mobile nav combined |
| EditBookDialog | `apps/web/src/components/Admin/EditBookDialog.tsx` | 388 | Complex form |
| AdminUsersTab | `apps/web/src/components/Admin/AdminUsersTab.tsx` | 384 | Large table |
| AdminBooksTab | `apps/web/src/components/Admin/AdminBooksTab.tsx` | 381 | Large table |
| UserNotificationForm | `apps/web/src/components/Admin/NotificationForms/UserNotificationForm.tsx` | 368 | Complex form with user search |
| CommunityDetail | `apps/web/src/pages/CommunityDetail.tsx` | 331 | Multiple tab views |
| CommunityMembersTab | `apps/web/src/components/Communities/CommunityMembersTab.tsx` | 309 | Table + actions |
| AdminCommunitiesTab | `apps/web/src/components/Admin/AdminCommunitiesTab.tsx` | 304 | Table component |
| AdminNotificationsTab | `apps/web/src/components/Admin/AdminNotificationsTab.tsx` | 303 | Multi-form tabs |
| Browse | `apps/web/src/pages/Browse.tsx` | 298 | Page with filters |
| RequestCardDetails | `apps/web/src/components/Requests/RequestCardDetails.tsx` | 290 | Complex card |
| AdminApproveDialog | `apps/web/src/components/Admin/AdminApproveDialog.tsx` | 283 | Form dialog |
| BookFilters | `apps/web/src/components/Browse/BookFilters.tsx` | 280 | Large filter panel |
| AdminDenyDialog | `apps/web/src/components/Admin/AdminDenyDialog.tsx` | 280 | Form dialog |

---

## Detailed Component Issues

### COMPONENT: AdminAnalyticsTab
**FILE:** `apps/web/src/components/Admin/AdminAnalyticsTab.tsx`
**LINES:** 705
**ISSUES:**
- Contains 8 separate section components defined in same file
- Each section (PlatformKPIsSection, MostActiveUsersSection, etc.) should be separate files
- Duplicated loading/error patterns across sections

**REFACTOR:**
```
apps/web/src/components/Admin/Analytics/
  ├── index.tsx (main AdminAnalyticsTab)
  ├── PlatformKPIsSection.tsx
  ├── MostActiveUsersSection.tsx
  ├── MostBorrowedBooksSection.tsx
  ├── BorrowDurationSection.tsx
  ├── UserRetentionSection.tsx
  ├── GrowthIndicator.tsx
  ├── KPICard.tsx
  └── StarRating.tsx
```

---

### COMPONENT: Header
**FILE:** `apps/web/src/components/Header.tsx`
**LINES:** 388
**ISSUES:**
- Desktop navigation and mobile navigation combined
- Multiple conditional renders for auth state
- Sheet content is complex enough for extraction

**REFACTOR:**
- Extract `DesktopNav.tsx`
- Extract `MobileNav.tsx`
- Extract `UserMenu.tsx`
- Extract `NavItem.tsx`

---

### COMPONENT: Home
**FILE:** `apps/web/src/pages/Home.tsx`
**LINES:** 413
**ISSUES:**
- FloatingBookCard and FeatureCard components defined inline
- These sub-components should be extracted

**REFACTOR:**
```
apps/web/src/components/Home/
  ├── FloatingBookCard.tsx
  └── FeatureCard.tsx
```

---

### COMPONENT: Browse
**FILE:** `apps/web/src/pages/Browse.tsx`
**LINES:** 298
**ISSUES:**
- Complex filter state management (7 useState calls)
- Debounce logic inline
- Multiple useMemo for derived data

**REFACTOR:**
- Extract filter state management to `useBookFilters` hook
- Move debounce logic to custom hook `useDebouncedValue`

---

## Props Count Analysis

### Components with >5 Props (Consider Decomposition)

| Component | Props Count | Location |
|-----------|-------------|----------|
| BookFilters | 11 props | `components/Browse/BookFilters.tsx:23-37` |
| RequestList | 9 props | Passed through from Requests page |
| ApproveRequestDialog | 6 props | `components/Requests/ApproveRequestDialog.tsx` |

### BookFilters Props Analysis
```typescript
interface BookFiltersProps {
  searchQuery: string;
  genreFilter: string;
  conditionFilter: string;
  availableOnly: boolean;
  communityFilter: string;
  userCommunities: Community[];
  onSearchChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onAvailableOnlyChange: (value: boolean) => void;
  onCommunityChange: (value: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}
```

**REFACTOR:**
Create a filters context or use a single `filters` object prop:
```typescript
interface BookFiltersProps {
  filters: BookFilterState;
  onFiltersChange: (filters: Partial<BookFilterState>) => void;
  userCommunities: Community[];
  activeFilterCount: number;
}
```

---

## Deeply Nested JSX (>4 Levels)

### COMPONENT: AdminAnalyticsTab - MostActiveUsersSection
**FILE:** `apps/web/src/components/Admin/AdminAnalyticsTab.tsx:280-339`
**NESTING:** 6+ levels
```jsx
<CardContent>
  <div className="space-y-3">
    {data.map((user, index) => (
      <div className={...}>
        <div className="flex items-center justify-center...">
          {rank <= 3 ? getMedalIcon(rank) : `#${rank}`}
        </div>
        <Avatar>
          {user.avatar_url ? (
            <img ... />
          ) : (
            <div className="flex items-center...">
              {user.name.charAt(0)}
            </div>
          )}
        </Avatar>
        ...
      </div>
    ))}
  </div>
</CardContent>
```

**REFACTOR:**
Extract `UserLeaderboardItem` component.

---

## Complex Conditional Rendering

### COMPONENT: Notifications
**FILE:** `apps/web/src/pages/Notifications.tsx:337-420`
**ISSUE:** Deeply nested conditional rendering for different notification types
```jsx
{notification.type === 'community_join_request' && (
  <div className="flex items-center gap-2 mt-3">
    <Button ... />
    <Button ... />
  </div>
)}

{notification.type === 'community_invitation' && (
  <div className="flex items-center gap-2 mt-3">
    <Button ... />
    <Button ... />
  </div>
)}
```

**REFACTOR:**
Create `NotificationActions` component:
```typescript
function NotificationActions({ notification, handlers }: Props) {
  switch (notification.type) {
    case 'community_join_request':
      return <JoinRequestActions ... />;
    case 'community_invitation':
      return <InvitationActions ... />;
    default:
      return null;
  }
}
```

---

## Summary

| Category | Count | Priority |
|----------|-------|----------|
| Files >300 lines | 21 | HIGH |
| Files 150-300 lines | 15+ | MEDIUM |
| Components with >5 props | 3 | MEDIUM |
| Deep nesting issues | 5+ | MEDIUM |
| Complex conditionals | 4 | LOW |
