# File Organization Audit

## CLAUDE.md Structure Reference

From CLAUDE.md:
```
apps/web/src/
├── pages/          - Route-level components
├── components/     - Reusable UI components
├── hooks/          - Custom React hooks
├── contexts/       - React Context providers
├── lib/
│   ├── validations/ - Zod schemas
│   ├── constants/   - Constant values
│   └── utils/       - Utility functions
```

---

## Current Structure Analysis

### Pages Directory ✓

**Location:** `apps/web/src/pages/`
**Files:** 13 pages
- SignIn.tsx ✓
- SignUp.tsx ✓
- Home.tsx ✓
- Browse.tsx ✓
- BookDetail.tsx ✓
- MyLibrary.tsx ✓
- Requests.tsx ✓
- Communities.tsx ✓
- CommunityDetail.tsx ✓
- Chats.tsx ✓
- Notifications.tsx ✓
- Profile.tsx ✓
- Admin.tsx ✓

**Assessment:** All route pages are properly placed. Good structure.

---

### Components Directory

**Location:** `apps/web/src/components/`

**Structure:**
```
components/
├── Admin/              (27 files)
│   └── NotificationForms/
├── BookDetail/         (4 files)
├── Browse/             (4 files)
├── Requests/           (13 files)
├── Communities/        (9 files)
├── Chats/              (2 files)
├── Forms/              (4 files)
├── Profile/            (3 files)
├── auth/               (2 files)
├── modals/             (2 files)
└── [root level]        (5 files)
```

**Assessment:** Well-organized by feature/domain.

**Issue:** Naming inconsistency
- `auth/` is lowercase
- `modals/` is lowercase
- All others are PascalCase

**Recommendation:** Rename to `Auth/` and `Modals/` for consistency.

---

### Hooks Directory ✓

**Location:** `apps/web/src/hooks/`
**Files:** 20 hooks

All hooks follow `use*.ts` naming convention.

**Recommendation:** Consider subdirectory organization for related hooks:
```
hooks/
├── queries/          - Data fetching hooks
│   ├── useBooks.ts
│   ├── useCommunities.ts
│   └── useNotifications.ts
├── mutations/        - Data mutation hooks
│   ├── useBorrowRequests.ts
│   └── useMessages.ts
└── ui/               - UI-related hooks
    ├── useActiveChats.ts
    └── useUnreadMessages.ts
```

**Priority:** LOW - Current flat structure is acceptable for 20 hooks.

---

### Contexts Directory ✓

**Location:** `apps/web/src/contexts/`
**Files:**
- AuthContext.tsx ✓
- ThemeContext.tsx ✓

**Assessment:** Properly organized.

---

### Lib Directory ✓

**Location:** `apps/web/src/lib/`

**Structure:**
```
lib/
├── constants/
│   ├── book.ts
│   ├── notification.ts
│   ├── status.ts
│   └── ui.ts
├── utils/
│   └── errors.ts
└── validations/
    ├── book.ts
    └── community.ts
```

**Assessment:** Matches CLAUDE.md specification.

**Note:** Only 1 utility file exists. As the project grows, consider organizing:
```
lib/utils/
├── errors.ts
├── dates.ts
├── formatters.ts
└── filters.ts
```

---

### Packages Structure ✓

**Location:** `packages/`

```
packages/
├── api-client/
│   ├── src/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── supabaseClient.ts
│   │   ├── auth.ts
│   │   ├── books.ts
│   │   ├── borrowRequests.ts
│   │   ├── communities.ts
│   │   ├── notifications.ts
│   │   ├── messages.ts
│   │   ├── reviews.ts
│   │   ├── users.ts
│   │   ├── admin.ts
│   │   ├── bookSearch.ts
│   │   └── userSearch.ts
│   └── migrations/
├── shared/
│   └── src/schemas/
├── ui/
│   └── src/components/
├── eslint-config/
└── typescript-config/
```

**Assessment:** Well-organized per CLAUDE.md specification.

**Issue:** `admin.ts` is 1574 lines. Should be split:
```
api-client/src/admin/
├── index.ts
├── users.ts
├── books.ts
├── requests.ts
├── communities.ts
├── stats.ts
└── notifications.ts
```

---

## Missing Index Exports

### Location: `apps/web/src/hooks/`
**Suggestion:** Add `index.ts` for barrel exports:
```typescript
// hooks/index.ts
export * from './useBooks';
export * from './useBorrowRequests';
export * from './useCommunities';
// ... etc
```

### Location: `apps/web/src/lib/constants/`
**Suggestion:** Add `index.ts`:
```typescript
// lib/constants/index.ts
export * from './book';
export * from './notification';
export * from './status';
export * from './ui';
```

---

## Misplaced Files

### None Found

All files appear to be in appropriate locations.

---

## Structure Deviations from CLAUDE.md

### Deviation 1: Sub-component Placement

Components like FloatingBookCard and FeatureCard are defined inline in `Home.tsx` instead of being extracted to:
```
components/Home/
├── FloatingBookCard.tsx
└── FeatureCard.tsx
```

### Deviation 2: Admin Components Scale

The Admin feature has grown large (27 components). Consider feature-based organization:
```
features/admin/
├── components/
├── hooks/
└── utils/
```

**Priority:** LOW - Current structure still works.

---

## Summary

| Category | Status | Priority |
|----------|--------|----------|
| Pages structure | EXCELLENT | N/A |
| Components structure | GOOD | LOW |
| Hooks structure | GOOD | LOW |
| Contexts structure | EXCELLENT | N/A |
| Lib structure | EXCELLENT | N/A |
| Packages structure | GOOD | MEDIUM (admin.ts) |
| Barrel exports | MISSING | LOW |
| Naming consistency | NEEDS FIX | LOW |

**Immediate Actions:**
1. Rename `auth/` to `Auth/`
2. Rename `modals/` to `Modals/`
3. Split `packages/api-client/src/admin.ts` (1574 lines)

**Long-term Recommendations:**
1. Add barrel exports (index.ts) to hooks and constants
2. Extract inline sub-components from large pages
3. Consider feature-based structure if admin grows further
