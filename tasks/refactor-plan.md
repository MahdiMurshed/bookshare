# BookShare Codebase Refactor Plan (By Feature)

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

## Strategy

**Approach:** Feature-by-feature refactoring. Each feature gets fully refactored (API → hooks → components) before moving to the next. A small "Foundation" step handles cross-cutting concerns first.

---

## Feature 0: Foundation (Cross-Cutting)

Fix global issues that affect all features before touching any feature code.

### 0.1 — Fix all 12 `any` types
- Audit and replace with proper types or `unknown`
- Add missing type definitions to `packages/api-client/src/types.ts`

### 0.2 — Fix directory casing
- Rename `components/auth/` → `components/Auth/`
- Rename `components/modals/` → `components/Modals/`
- Update all imports

### 0.3 — Replace `console.error()` with `logError()`
- The utility exists at `apps/web/src/lib/utils/errors.ts`
- Find and replace all 20+ instances

### 0.4 — Review and tighten shared schemas
- Audit `packages/shared/` schemas against database constraints
- Ensure Zod schemas match migration CHECK constraints

**Commit after this step.**

---

## Feature 1: Admin Dashboard

The largest feature by code volume. `admin.ts` API file is 1,574 lines, plus 25 components (many oversized).

### 1.1 — API: Split `admin.ts` into modules
- `admin/stats.ts` — Dashboard statistics and analytics
- `admin/users.ts` — User management operations
- `admin/content.ts` — Books, reviews, content moderation
- `admin/requests.ts` — Borrow request overrides
- `admin/notifications.ts` — System notification sending
- `admin/communities.ts` — Community management
- `admin/index.ts` — Barrel re-export (preserves existing imports)
- Keep same function signatures — pure structural refactor

### 1.2 — Hooks: Standardize admin hooks
- Standardize query key factories in `useAdmin.ts` and `useAdminUser.ts`
- Extract inline business logic from `AdminUsersTab.tsx` into `useUserActions()` hook
- Ensure all mutations use `mutateAsync` with try/catch
- Remove any hardcoded query key strings (e.g., `['admin-users', ...]`)

### 1.3 — Components: Decompose oversized admin components
**`AdminAnalyticsTab.tsx` (705 lines) →**
- `AdminAnalyticsTab.tsx` — Container with tab layout (~80 lines)
- `KPICards.tsx` — Platform KPI metric cards
- `MostActiveUsers.tsx` — Active users leaderboard
- `MostBorrowedBooks.tsx` — Popular books list
- `RetentionMetrics.tsx` — User retention data
- `BorrowDurationStats.tsx` — Average borrow duration display

**`AdminUsersTab.tsx` (384 lines) →**
- `AdminUsersTab.tsx` — Container with search/filter (~100 lines)
- `AdminUserTable.tsx` — User table rendering
- `AdminUserActions.tsx` — Action menu/buttons per row

**`AdminRequestsTab.tsx` (396 lines) →**
- `AdminRequestsTab.tsx` — Container with filters (~80 lines)
- `AdminRequestTable.tsx` — Request table rendering
- `AdminRequestActions.tsx` — Action dialogs

**`AdminBooksTab.tsx` (381 lines) → Same pattern**

**`AdminNotificationsTab.tsx` (303 lines) →**
- Already has `NotificationForms/` subdirectory with forms extracted
- Split remaining container logic (~60 lines)

**Commit after this step.**

---

## Feature 2: Communities

### 2.1 — Hooks: Standardize community hooks
- Standardize query key factories in `useCommunities.ts`, `useCommunityMembers.ts`, `useCommunityInvitations.ts`, `useCommunityActivity.ts`
- Ensure consistent mutation patterns

### 2.2 — Components: Decompose oversized community components
**`CommunitySettings.tsx` (445 lines) →**
- `CommunitySettings.tsx` — Container (~60 lines)
- `CommunityInfoEditor.tsx` — Name, description, privacy form
- `CommunityDangerZone.tsx` — Delete community, transfer ownership

**`CommunityActivityFeed.tsx` (395 lines) →**
- `CommunityActivityFeed.tsx` — Container with filter tabs (~80 lines)
- `ActivityItem.tsx` — Single activity entry rendering
- `ActivityFilters.tsx` — Filter controls

### 2.3 — Pages: Decompose `Communities.tsx` and `CommunityDetail.tsx`
- Extract any inline sub-components
- Ensure proper loading/error/empty states

### 2.4 — Fix: Community filter on Browse page
- Fix "My Communities" filter to properly filter books by community membership

**Commit after this step.**

---

## Feature 3: Books & Browse

### 3.1 — Hooks: Extract filter logic
- Create `useBookFilters()` — filter state management, URL sync, debounced search (from `Browse.tsx`)
- Standardize query keys in `useBooks.ts`, `useAvailableBooks.ts`, `useBookDetail.ts`

### 3.2 — Components: Extract reusable filter component
- Create `FilterButton.tsx` — generic filter button (label, options, value, onChange)
- Refactor `BookFilters.tsx` (280 lines) to compose FilterButtons (~80 lines)
- Extract `useBookCommunities(bookId)` from `EditBookModal.tsx`
- Extract `useCreateBookWithCommunities()` from `AddBookForm.tsx`

### 3.3 — Pages: Decompose `Browse.tsx` (299 lines)
- Move filter logic to `useBookFilters()` hook
- Ensure the page is a thin shell over hook + component composition

### 3.4 — Fix: MyLibrary borrowed count
- Fix hardcoded "borrowed out" count — query actual active borrows

**Commit after this step.**

---

## Feature 4: Borrow Requests & Messaging

### 4.1 — Hooks: Extract request logic
- Create `useRequestFilters()` — filtering and sorting (from `Requests.tsx`)
- Create `useRequestActions()` — approve, deny, return, handover mutations (from `Requests.tsx`)
- Standardize query keys in `useBorrowRequests.ts`, `useMessages.ts`, `useActiveChats.ts`

### 4.2 — Pages: Decompose `Requests.tsx` (412 lines)
- `Requests.tsx` — Page with tab navigation (~80 lines)
- `IncomingRequests.tsx` — Incoming tab content
- `OutgoingRequests.tsx` — Outgoing tab content

### 4.3 — Review messaging components
- Audit `Chats/` components for proper real-time patterns
- Ensure `useMessages.ts` properly cleans up subscriptions

**Commit after this step.**

---

## Feature 5: Notifications

### 5.1 — Pages: Decompose `Notifications.tsx` (439 lines)
- `Notifications.tsx` — Page container with filter tabs (~80 lines)
- `NotificationItem.tsx` — Single notification rendering
- `NotificationActions.tsx` — Type-specific action buttons

### 5.2 — Hook review
- Audit `useNotifications.ts` for proper real-time subscription cleanup
- Standardize query key factory

**Commit after this step.**

---

## Feature 6: Home & Layout

### 6.1 — Components: Decompose `Header.tsx` (388 lines)
- `Header.tsx` — Main layout shell (~80 lines)
- `DesktopNav.tsx` — Desktop navigation links
- `MobileNav.tsx` — Mobile sheet navigation
- `NotificationBell.tsx` — Notification icon with count badge
- `UserMenu.tsx` — User avatar dropdown menu

### 6.2 — Pages: Decompose `Home.tsx` (413 lines)
- `Home.tsx` — Page layout (~100 lines)
- `HeroSection.tsx` — Animated hero with floating books
- `FeaturesGrid.tsx` — Feature showcase cards
- `UserStatsBar.tsx` — Authenticated user statistics
- `CTASection.tsx` — Call-to-action blocks

### 6.3 — Fix: Replace inline styles with Tailwind
- `Home.tsx` — Grid patterns and animation delays
- `Browse.tsx` — Container max-width
- `BookDetail.tsx` — Background patterns

### 6.4 — Fix: Dead links
- Remove or implement Terms/Privacy links from SignUp page

**Commit after this step.**

---

## Feature 7: Auth & Profile

### 7.1 — Review auth patterns
- Audit `AuthContext.tsx` for proper state management
- Review `useProfile.ts` hook patterns
- Ensure `Auth/` components follow form patterns (react-hook-form + Zod)

### 7.2 — Standardize profile components
- Review `ProfileSettings.tsx`, `ProfileHeader.tsx`, `ProfileStats.tsx` sizes
- Extract logic to hooks if needed

**Commit after this step.**

---

## Feature 8: Testing Infrastructure

### 8.1 — Set up Vitest
- Configure in monorepo (root + per-package)
- Set up React Testing Library, MSW for API mocking
- Add test scripts to `package.json` and `turbo.json`

### 8.2 — Unit test API client
- Test all `packages/api-client/` functions with mocked Supabase
- Focus on error handling, input validation, return types

### 8.3 — Unit test hooks
- Test hooks with `@testing-library/react-hooks`
- Mock API client functions
- Test query key generation, cache invalidation, error states

### 8.4 — Unit test shared schemas
- Test all Zod schemas in `packages/shared/`
- Valid inputs, invalid inputs, edge cases

### 8.5 — Set up Playwright E2E
- Configure Playwright with web app
- Write E2E for critical flows:
  - Sign up → Sign in → Browse → Request borrow
  - Add book → Edit → Delete
  - Community create → Join → Add book

**Commit after this step.**

---

## Feature 9: CI/CD & Production Hardening

### 9.1 — GitHub Actions CI
- Lint + type check on PR
- Unit tests on PR
- E2E tests on PR
- Build verification

### 9.2 — Security basics
- CORS, CSP headers
- Rate limiting on auth
- Input sanitization audit
- RLS policy verification

### 9.3 — Performance
- Bundle size audit
- Code splitting with React.lazy + Suspense
- Image lazy loading

### 9.4 — Deployment config
- Vercel/Netlify configuration
- Environment variable docs
- Production build verification

**Commit after this step.**

---

## Execution Summary

| Feature | Focus | Key Files |
|---------|-------|-----------|
| 0. Foundation | Types, schemas, casing, console.error | api-client/types.ts, shared/, all files |
| 1. Admin | Split 1574-line admin.ts, decompose 5 oversized components | api-client/admin.ts, Admin/*.tsx |
| 2. Communities | Decompose settings & activity, fix filter | Communities/*.tsx, useCommunities.ts |
| 3. Books & Browse | Extract filter hooks, reusable FilterButton | Browse/*.tsx, useBooks.ts |
| 4. Requests & Chat | Extract request actions/filters, decompose page | Requests/*.tsx, useBorrowRequests.ts |
| 5. Notifications | Decompose page, review subscriptions | Notifications.tsx, useNotifications.ts |
| 6. Home & Layout | Decompose Header + Home page, fix inline styles | Header.tsx, Home.tsx |
| 7. Auth & Profile | Review patterns, standardize | Auth/*.tsx, useProfile.ts |
| 8. Testing | Vitest + Playwright setup, test critical paths | New test files |
| 9. CI/CD | GitHub Actions, security, performance | .github/, config files |

## Ground Rules

1. **Every feature commit leaves a working app** — no broken intermediate states
2. **Same tech, same structure** — refactoring, not rewriting
3. **One feature at a time** — finish before starting the next
4. **Each feature gets its own commit** with a clear message
5. **Run the app mentally** after each refactor to verify nothing breaks
