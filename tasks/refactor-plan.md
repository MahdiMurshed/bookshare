# BookShare Codebase Refactor Plan

## Current State Assessment

**What exists:** A feature-complete book sharing platform (Turborepo monorepo) with 13 pages, 60+ components, 18 hooks, comprehensive API client, real-time features, admin dashboard, communities, messaging, and dark mode. Uses React 19, Vite, TailwindCSS 4, shadcn/ui, TanStack Query, Supabase.

**Core problems:**
- 11 oversized components (200-700+ lines) violating the 150-line guideline
- Business logic mixed directly into components instead of custom hooks
- Duplicated code patterns (filter buttons, admin dialogs, stat cards)
- Zero test files (no unit tests, no E2E tests)
- 12 `any` types across the codebase
- Inconsistent query key patterns
- `console.error()` scattered instead of using centralized `logError()`
- Inconsistent directory casing (`auth/`, `modals/` lowercase vs `Admin/`, `Browse/` PascalCase)
- `admin.ts` in api-client is 1,574 lines (needs splitting)
- No CI/CD, no security hardening, no monitoring
- Some incomplete features (community filtering, borrowed count tracking)

**What stays the same:** Tech stack, folder structure, file organization patterns, backend (Supabase), all existing features.

---

## Refactoring Strategy

**Approach:** Inside-out refactoring. Start with the foundation (types, API client, shared schemas) and work outward to hooks, then components, then pages. Each phase produces a working application — no big-bang rewrites.

---

## Phase 1: Foundation Cleanup (API Client & Shared Packages)

**Goal:** Clean up the shared packages that everything depends on. Fix types, split oversized files, ensure consistent patterns.

### 1.1 — Fix all `any` types
- Audit all 12 `any` types across the codebase
- Replace with proper TypeScript types or `unknown` where appropriate
- Add missing type definitions to `packages/api-client/src/types.ts`

### 1.2 — Split `admin.ts` (1,574 lines)
- Split into focused modules:
  - `admin/stats.ts` — Dashboard statistics and analytics
  - `admin/users.ts` — User management operations
  - `admin/content.ts` — Books, reviews, and content moderation
  - `admin/requests.ts` — Borrow request overrides
  - `admin/notifications.ts` — System notification sending
  - `admin/communities.ts` — Community management
  - `admin/index.ts` — Barrel re-export (preserves existing imports)
- Keep the same function signatures — this is a pure structural refactor

### 1.3 — Standardize API client function patterns
- Ensure all functions follow: async, return Promises, throw errors
- Ensure all filters use optional object arguments
- Ensure all Input types are properly defined and exported
- Add JSDoc comments to public functions for better DX

### 1.4 — Review and tighten shared schemas
- Audit `packages/shared/` schemas against actual database constraints
- Ensure Zod schemas match migration CHECK constraints exactly
- Add any missing validation rules (e.g., string length limits)

**Deliverable:** Clean, well-typed, well-organized shared packages. All existing imports still work.

---

## Phase 2: Hook Layer Refactoring

**Goal:** Extract all business logic from components into well-structured custom hooks. Standardize query key patterns.

### 2.1 — Standardize query key factories
- Audit all query keys across all hooks
- Ensure every entity uses the factory pattern consistently:
  ```typescript
  export const bookKeys = {
    all: ['books'] as const,
    lists: () => [...bookKeys.all, 'list'] as const,
    list: (filters) => [...bookKeys.lists(), filters] as const,
    details: () => [...bookKeys.all, 'detail'] as const,
    detail: (id: string) => [...bookKeys.details(), id] as const,
  };
  ```
- Remove any hardcoded query key strings in components (e.g., `AdminUsersTab.tsx` using `['admin-users', ...]`)
- Centralize all key factories in their respective hook files

### 2.2 — Extract business logic from components into hooks
Create new hooks for logic currently embedded in components:

| New Hook | Extracted From | Logic |
|----------|---------------|-------|
| `useBookCommunities(bookId)` | `EditBookModal.tsx` | Fetching book's community memberships |
| `useCreateBookWithCommunities()` | `AddBookForm.tsx` | Book creation + community assignment in one operation |
| `useUserActions()` | `AdminUsersTab.tsx` | Admin user management actions (suspend, unsuspend, toggle admin, delete) |
| `useBookFilters()` | `Browse.tsx` | Filter state management, URL sync, debounced search |
| `useRequestFilters()` | `Requests.tsx` | Request filtering and sorting logic |
| `useRequestActions()` | `Requests.tsx` | Approve, deny, return, handover mutation orchestration |

### 2.3 — Review existing hooks for consistency
- Ensure all hooks use `mutateAsync` with try/catch (not `mutate` with callbacks)
- Ensure all mutations invalidate the correct query keys in `onSuccess`
- Add proper error handling (use `logError()` utility)
- Ensure loading/error states are properly exposed

**Deliverable:** All business logic lives in hooks. Components only handle presentation and user interaction.

---

## Phase 3: Component Decomposition

**Goal:** Break down oversized components into focused, reusable pieces under 150 lines each.

### 3.1 — Admin components (highest line counts)

**`AdminAnalyticsTab.tsx` (705 lines) → Split into:**
- `AdminAnalyticsTab.tsx` — Container with tab layout (~80 lines)
- `KPICards.tsx` — Platform KPI metric cards
- `MostActiveUsers.tsx` — Active users leaderboard
- `MostBorrowedBooks.tsx` — Popular books list
- `RetentionMetrics.tsx` — User retention data
- `BorrowDurationStats.tsx` — Average borrow duration display

**`AdminUsersTab.tsx` (384 lines) → Split into:**
- `AdminUsersTab.tsx` — Container with search/filter (~100 lines)
- `AdminUserTable.tsx` — User table rendering
- `AdminUserActions.tsx` — Action menu/buttons per user row

**`AdminRequestsTab.tsx` (396 lines) → Split into:**
- `AdminRequestsTab.tsx` — Container with filters (~80 lines)
- `AdminRequestTable.tsx` — Request table rendering
- `AdminRequestActions.tsx` — Action dialogs (approve/deny/cancel)

**`AdminBooksTab.tsx` (381 lines) → Same pattern as above**

**`AdminNotificationsTab.tsx` (303 lines) → Split into:**
- `AdminNotificationsTab.tsx` — Container (~60 lines)
- `BroadcastNotificationForm.tsx`
- `GroupNotificationForm.tsx`
- `UserNotificationForm.tsx`

### 3.2 — Community components

**`CommunitySettings.tsx` (445 lines) → Split into:**
- `CommunitySettings.tsx` — Container with section layout (~60 lines)
- `CommunityInfoEditor.tsx` — Name, description, privacy form
- `CommunityDangerZone.tsx` — Delete community, transfer ownership

**`CommunityActivityFeed.tsx` (395 lines) → Split into:**
- `CommunityActivityFeed.tsx` — Container with filter tabs (~80 lines)
- `ActivityItem.tsx` — Single activity entry rendering
- `ActivityFilters.tsx` — Filter controls

### 3.3 — Shared component extractions

**`Header.tsx` (388 lines) → Split into:**
- `Header.tsx` — Main layout shell (~80 lines)
- `DesktopNav.tsx` — Desktop navigation links
- `MobileNav.tsx` — Mobile sheet navigation
- `NotificationBell.tsx` — Notification icon with count badge
- `UserMenu.tsx` — User avatar dropdown menu

**`BookFilters.tsx` (280 lines) → Extract reusable `FilterButton` component:**
- `FilterButton.tsx` — Generic filter button (label, options, value, onChange)
- `BookFilters.tsx` — Compose FilterButtons (~80 lines)

### 3.4 — Page-level decomposition

**`Notifications.tsx` (439 lines) → Split into:**
- `Notifications.tsx` — Page container with filter tabs (~80 lines)
- `NotificationItem.tsx` — Single notification rendering
- `NotificationActions.tsx` — Type-specific action buttons (community join approve/deny, etc.)

**`Requests.tsx` (412 lines) → Split into:**
- `Requests.tsx` — Page with tab navigation (~80 lines)
- `IncomingRequests.tsx` — Incoming tab content
- `OutgoingRequests.tsx` — Outgoing tab content
- `RequestCard.tsx` — Individual request display (if not already extracted)

**`Home.tsx` (413 lines) → Split into:**
- `Home.tsx` — Page layout (~100 lines)
- `HeroSection.tsx` — Animated hero with floating books
- `FeaturesGrid.tsx` — Feature showcase cards
- `UserStatsBar.tsx` — Authenticated user statistics
- `CTASection.tsx` — Call-to-action blocks

### 3.5 — Fix directory casing inconsistency
- Rename `auth/` → `Auth/`
- Rename `modals/` → `Modals/`
- Update all imports across the codebase

**Deliverable:** No component exceeds ~150 lines. All components are focused on presentation. Reusable pieces are properly extracted.

---

## Phase 4: Cross-Cutting Concerns

**Goal:** Fix patterns that span the entire codebase.

### 4.1 — Replace all `console.error()` with `logError()`
- The utility already exists at `apps/web/src/lib/utils/errors.ts`
- Find and replace all 20+ instances across components and hooks
- Ensure `logError()` is imported consistently

### 4.2 — Replace inline styles with Tailwind classes
- `Home.tsx` — Grid patterns and animation delays
- `Browse.tsx` — Container max-width
- `BookDetail.tsx` — Background patterns
- Use Tailwind arbitrary values `[value]` or CSS variables where needed

### 4.3 — Standardize error/loading state handling
- Ensure every data-fetching component has:
  - Loading skeleton or spinner
  - Error state with retry button
  - Empty state with helpful message
- Use consistent patterns (ErrorState, LoadingSpinner from `@repo/ui`)

### 4.4 — Fix incomplete features
- **Browse page:** Fix "My Communities" filter to actually filter books by community membership (server-side or proper client-side)
- **MyLibrary:** Fix hardcoded "borrowed out" count (query actual active borrows)
- **Terms/Privacy links:** Either implement or remove the dead links from SignUp page

**Deliverable:** Consistent patterns across the entire codebase. No dead code, no incomplete features.

---

## Phase 5: Testing Infrastructure

**Goal:** Set up testing and write tests for critical paths.

### 5.1 — Set up Vitest for unit tests
- Configure Vitest in the monorepo (root and per-package)
- Set up test utilities (React Testing Library, MSW for API mocking)
- Add test scripts to `package.json` and `turbo.json`

### 5.2 — Unit test the API client
- Test all functions in `packages/api-client/` with mocked Supabase client
- Focus on error handling, input validation, and return types
- Aim for 80%+ coverage on api-client

### 5.3 — Unit test custom hooks
- Test all hooks with `@testing-library/react-hooks`
- Mock API client functions
- Test query key generation, cache invalidation, error states

### 5.4 — Unit test shared schemas
- Test all Zod schemas in `packages/shared/`
- Test valid inputs, invalid inputs, edge cases
- Verify type inference matches expected types

### 5.5 — Set up Playwright for E2E tests
- Configure Playwright with the web app
- Write E2E tests for critical user flows:
  - Sign up → Sign in → Browse books → Request to borrow
  - Add book → Edit book → Delete book
  - Create community → Join community → Add book to community
  - Notification flow (request → approve → notify)

**Deliverable:** Testing infrastructure in place with meaningful coverage on critical paths.

---

## Phase 6: CI/CD & Production Hardening

**Goal:** Make this portfolio-ready with proper DevOps and security.

### 6.1 — GitHub Actions CI pipeline
- Lint check on PR
- Type check on PR
- Unit tests on PR
- E2E tests on PR (against preview deployment)
- Build verification

### 6.2 — Security basics
- Add CORS configuration
- Add Content Security Policy headers
- Rate limiting on auth endpoints (via Supabase or Edge Functions)
- Input sanitization audit
- Verify RLS policies cover all tables properly

### 6.3 — Performance optimization
- Audit bundle size (Vite bundle analyzer)
- Implement code splitting for routes (React.lazy + Suspense)
- Optimize image loading (lazy loading, proper sizes)
- Add proper caching headers

### 6.4 — Deployment configuration
- Add Vercel/Netlify deployment config
- Environment variable documentation
- Production build verification

**Deliverable:** Portfolio-grade application with CI/CD, security, and deployment.

---

## Execution Order & Dependencies

```
Phase 1 (Foundation) ──→ Phase 2 (Hooks) ──→ Phase 3 (Components) ──→ Phase 4 (Cross-Cutting)
                                                                              │
                                                                              ▼
                                                                     Phase 5 (Testing)
                                                                              │
                                                                              ▼
                                                                     Phase 6 (CI/CD)
```

**Phases 1-4** are strictly sequential — each builds on the previous.
**Phase 5** can partially overlap with Phase 4.
**Phase 6** can start after Phase 5 is underway.

## Ground Rules

1. **Every phase ends with a working app** — no broken intermediate states
2. **Same tech, same structure** — we're refactoring, not rewriting
3. **One concern at a time** — don't mix structural changes with logic changes
4. **Tests validate refactors** — especially in Phases 2-3, run the app after each change
5. **Commit often** — each sub-task (e.g., 3.1, 3.2) gets its own commit
