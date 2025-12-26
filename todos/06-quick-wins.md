# Quick Wins

Small, immediate improvements that take less than 5 minutes each.

---

## File Organization Quick Wins

### Task 1: Rename auth/ to Auth/

**Current:** `apps/web/src/components/auth/`
**Fix:** `apps/web/src/components/Auth/`

```bash
cd apps/web/src/components
mv auth Auth
```

**Update imports in:**
- `apps/web/src/pages/SignIn.tsx`
- `apps/web/src/pages/SignUp.tsx`

---

### Task 2: Rename modals/ to Modals/

**Current:** `apps/web/src/components/modals/`
**Fix:** `apps/web/src/components/Modals/`

```bash
cd apps/web/src/components
mv modals Modals
```

**Update imports in:**
- `apps/web/src/pages/MyLibrary.tsx`
- Any other files importing from modals/

---

## Code Cleanup Quick Wins

### Task 3: Remove Commented-Out Code in API Client

**Files to clean:**
- `packages/api-client/src/books.ts:75` - Delete commented line
- `packages/api-client/src/books.ts:226` - Delete commented line
- `packages/api-client/src/reviews.ts:56` - Delete commented line
- `packages/api-client/src/notifications.ts:53` - Delete commented line
- `packages/api-client/src/borrowRequests.ts:88` - Delete commented line

**Pattern to delete:**
```typescript
// const params = new URLSearchParams(filters as any);
```

---

### Task 4: Remove Debug console.log in communities.ts

**File:** `packages/api-client/src/communities.ts`
**Lines to delete:** 270, 277, 303

```typescript
// DELETE these lines:
console.log('Creating community with user ID:', session.user.id);
console.log('Community data:', { ...input, created_by: session.user.id });
console.log('Community created successfully:', data);
```

---

### Task 5: Remove Debug console.log in messages.ts

**File:** `packages/api-client/src/messages.ts:159`
**Delete:**
```typescript
console.log(`[Messages] Subscribed to request: ${requestId}`);
```

---

## Naming Convention Quick Wins

### Task 6: Rename scrolled to isScrolled

**File:** `apps/web/src/components/Header.tsx:59`

**Current:**
```typescript
const [scrolled, setScrolled] = useState(false);
```

**Fix:**
```typescript
const [isScrolled, setIsScrolled] = useState(false);
```

**Also update all usages of `scrolled` in the file.**

---

### Task 7: Rename availableOnly to showAvailableOnly

**File:** `apps/web/src/pages/Browse.tsx:27`

**Current:**
```typescript
const [availableOnly, setAvailableOnly] = useState(false);
```

**Fix:**
```typescript
const [showAvailableOnly, setShowAvailableOnly] = useState(false);
```

**Update all usages in Browse.tsx and BookFilters.tsx.**

---

### Task 8: Rename generic books variable

**File:** `apps/web/src/pages/Browse.tsx:68-71`

**Current:**
```typescript
const books = shouldUseAllBooks
  ? allBooksQuery.data || []
  : specificCommunityId
  ? communityBooksQuery.data || []
  : myCommunityBooks;
```

**Fix:**
```typescript
const displayedBooks = shouldUseAllBooks
  ? allBooksQuery.data || []
  : specificCommunityId
  ? communityBooksQuery.data || []
  : myCommunityBooks;
```

---

## Constants Quick Wins

### Task 9: Add DEBOUNCE_DELAY_MS Constant

**File:** `apps/web/src/lib/constants/ui.ts`

**Add:**
```typescript
export const DEBOUNCE_DELAY_MS = 300;
```

**Update Browse.tsx:35:**
```typescript
import { DEBOUNCE_DELAY_MS } from '../lib/constants/ui';

// ...
setTimeout(() => {
  setDebouncedSearch(searchQuery);
}, DEBOUNCE_DELAY_MS);
```

---

### Task 10: Add SCROLL_THRESHOLD Constant

**File:** `apps/web/src/lib/constants/ui.ts`

**Add:**
```typescript
export const SCROLL_THRESHOLD_PX = 10;
```

**Update Header.tsx:64:**
```typescript
import { SCROLL_THRESHOLD_PX } from '../lib/constants/ui';

// ...
setIsScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
```

---

## Summary Checklist

| # | Task | Time | Files |
|---|------|------|-------|
| 1 | Rename auth/ to Auth/ | 2 min | 3 files |
| 2 | Rename modals/ to Modals/ | 2 min | 2 files |
| 3 | Remove commented code in api-client | 3 min | 5 files |
| 4 | Remove console.log in communities.ts | 1 min | 1 file |
| 5 | Remove console.log in messages.ts | 1 min | 1 file |
| 6 | Rename scrolled → isScrolled | 2 min | 1 file |
| 7 | Rename availableOnly → showAvailableOnly | 3 min | 2 files |
| 8 | Rename books → displayedBooks | 2 min | 1 file |
| 9 | Add DEBOUNCE_DELAY_MS constant | 3 min | 2 files |
| 10 | Add SCROLL_THRESHOLD_PX constant | 2 min | 2 files |

**Total Time: ~20-30 minutes**

---

## Verification

After completing all quick wins:

```bash
# Verify builds
pnpm build

# Verify linting
pnpm lint

# Verify type checking
pnpm type-check

# Verify no console.log in production
grep -r "console.log" packages/api-client/src --include="*.ts"
# Should return empty or only conditional dev logging
```
