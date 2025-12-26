# Comments & Documentation Audit

## TODO/FIXME Comments

### Found Occurrences

| File | Line | Comment | Action Required |
|------|------|---------|-----------------|
| `apps/web/src/pages/MyLibrary.tsx` | 27 | `// TODO: Add borrowed out count when borrow tracking is implemented` | Feature enhancement - can remain |

**Assessment:** Only 1 TODO found. This is a legitimate feature enhancement note.

---

## Dead/Commented-Out Code

### Found Occurrences

| File | Lines | Code | Recommendation |
|------|-------|------|----------------|
| `packages/api-client/src/books.ts` | 75 | `// const params = new URLSearchParams(filters as any);` | DELETE |
| `packages/api-client/src/books.ts` | 226 | `// const params = new URLSearchParams({ ...filters, include: 'owner' } as any);` | DELETE |
| `packages/api-client/src/reviews.ts` | 56 | `// const params = new URLSearchParams(filters as any);` | DELETE |
| `packages/api-client/src/notifications.ts` | 53 | `// const params = new URLSearchParams(filters as any);` | DELETE |
| `packages/api-client/src/borrowRequests.ts` | 88 | `// const params = new URLSearchParams(filters as any);` | DELETE |

**Recommendation:** Remove all commented-out code. These appear to be remnants from a previous REST API implementation.

---

## JSDoc on Exported Functions

### API Client (packages/api-client/src/)

**Good JSDoc Examples:**

```typescript
// types.ts - Good documentation
/**
 * NotificationType
 *
 * Defines all valid notification types in the system.
 * - User notifications: borrow_request, request_approved, request_denied...
 * - Community notifications: community_join_request, community_invitation
 * - Admin notifications: announcement (system-wide), alert (urgent)...
 */
export type NotificationType = ...

// communities.ts - Good function docs
/**
 * Get all communities with optional filters
 */
export async function getCommunities(filters?: CommunityFilters): Promise<Community[]>

/**
 * Create a new community
 */
export async function createCommunity(input: CreateCommunityInput): Promise<Community>
```

**Missing JSDoc:**
Most functions have brief one-line comments. Consider adding parameter descriptions for complex functions.

### Hooks (apps/web/src/hooks/)

**Good Examples:**
```typescript
/**
 * Hook to fetch borrow requests made by the current user
 */
export function useMyBorrowRequests(status?: BorrowRequestStatus)

/**
 * Hook to approve a borrow request with handover details
 */
export function useApproveBorrowRequest()
```

**Assessment:** Hooks have consistent JSDoc comments. Good pattern.

### Utilities (apps/web/src/lib/utils/)

**Good Example:**
```typescript
/**
 * Extract a user-friendly error message from an unknown error type
 *
 * @param error - Unknown error (could be Error, string, or other type)
 * @param fallback - Fallback message if error cannot be parsed
 * @returns A user-friendly error message string
 *
 * @example
 * try {
 *   await someAsyncOperation();
 * } catch (err) {
 *   const message = getErrorMessage(err);
 *   setError(message);
 * }
 */
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string
```

**Assessment:** Error utilities have excellent documentation with examples.

---

## File-Level Documentation

### Good Examples

**FILE:** `packages/api-client/src/types.ts:1-4`
```typescript
/**
 * Core data models for BookShare
 * These types represent the database schema and are shared across all apps
 */
```

**FILE:** `packages/api-client/src/communities.ts:1-9`
```typescript
/**
 * Communities abstraction layer
 *
 * Provides backend-agnostic community CRUD operations.
 * Currently implemented with Supabase.
 *
 * MIGRATION NOTE: When migrating to NestJS, replace Supabase calls
 * with REST API calls to /communities/* endpoints while keeping function signatures identical.
 */
```

**FILE:** `apps/web/src/pages/Browse.tsx:1-6`
```typescript
/**
 * Browse Page - Clean Book Discovery
 *
 * Minimal SaaS aesthetic matching Home page design
 * Features: Hero section, filters sidebar, clean book grid
 */
```

---

## Comments That Describe "What" Instead of "Why"

### Found Occurrences

**FILE:** `apps/web/src/pages/Requests.tsx:51-55`
```typescript
// Filter and sort incoming requests
const filteredIncomingRequests = useMemo(() => {
```
**Issue:** Comment describes what, not why.
**Better:** No comment needed - code is self-explanatory.

**FILE:** `apps/web/src/pages/Browse.tsx:40`
```typescript
// Fetch user's communities
const { data: userCommunities = [] } = useMyCommunities(user?.id);
```
**Issue:** Comment describes what the code does.
**Better:** Remove - the hook name is descriptive enough.

---

## Missing Documentation

### Components Missing JSDoc

Most components don't have JSDoc documentation. Consider adding for exported components:

```typescript
/**
 * BookFilters - Filter panel for book browsing
 *
 * Provides filtering by:
 * - Search query (title, author)
 * - Genre
 * - Condition
 * - Availability
 * - Community membership
 */
export function BookFilters({ ... }: BookFiltersProps)
```

**Priority:** LOW - Component props interfaces serve as documentation.

---

## README Files

**Found:**
- `/README.md` - Root project README
- `/CLAUDE.md` - AI assistant instructions (comprehensive)

**Assessment:** Good high-level documentation exists.

---

## Summary

| Category | Status |
|----------|--------|
| TODO/FIXME comments | 1 found (appropriate) |
| Dead code | 5 instances (DELETE) |
| API function JSDoc | GOOD |
| Hook JSDoc | GOOD |
| Utility JSDoc | EXCELLENT |
| File-level docs | GOOD |
| "What" comments | 2-3 (minor) |
| Component JSDoc | MISSING (low priority) |

**Immediate Actions:**
1. DELETE 5 commented-out code blocks in packages/api-client/src/
2. Remove redundant "what" comments

**Overall Documentation Score: 8/10**

The codebase has good documentation practices:
- Error utilities are exceptionally well documented
- API client functions have consistent JSDoc
- File-level documentation explains purpose
- CLAUDE.md provides comprehensive project guidance
