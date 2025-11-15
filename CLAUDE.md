# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BookShare** is a book sharing platform built as a Turborepo monorepo. The project enables users to manage personal book collections, lend and borrow books, and build a community around reading. Currently in early development stages with foundational architecture in place.

## Commands

### Development
```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all apps in dev mode (uses Turbo)
pnpm build            # Build all apps and packages
pnpm lint             # Lint all workspaces
pnpm format           # Format code with Prettier
```

### Working with UI Components
```bash
pnpm ui <component>   # Add new shadcn/ui component (e.g., pnpm ui card)
```

### App-Specific Commands
```bash
# Run commands in specific workspace
pnpm --filter web dev
pnpm --filter @repo/ui lint
```

### Claude Code Commands
```bash
/design-polish    # Invoke frontend-design skill to polish UI components with high-quality design
```

## Architecture

### Monorepo Structure
This is a **Turborepo** monorepo using **pnpm workspaces**:

- **`apps/`** - Applications (currently `web` and `nextjs`, targeting `web` and `mobile` per technical plan)
- **`packages/`** - Shared packages
  - `ui/` - Shared UI components using shadcn/ui and Tailwind 4
  - `eslint-config/` - Shared ESLint configuration
  - `typescript-config/` - Shared TypeScript configuration

**Planned packages** (from technical plan):
- `types/` - Shared TypeScript types
- `utils/` - Shared utility functions
- `api-client/` - Backend abstraction layer (Supabase → future NestJS migration)
- `config/` - Shared constants and environment variables

### Backend Strategy

The architecture uses an **abstraction layer** between frontend and backend to enable seamless migration from Supabase to a custom NestJS backend later.

**Rules:**
1. All backend calls must go through `packages/api-client/`
2. **Never** import Supabase client directly in apps
3. Design APIs to be backend-agnostic

**Usage:**
```typescript
// ✅ Correct - Import from api-client
import { getBooks, createBook, type Book } from '@repo/api-client';

// ❌ Wrong - Don't import Supabase directly
import { supabase } from '@repo/api-client/supabaseClient';
```

**Function patterns:**
- Async functions that return Promises
- Throw errors (don't return error objects)
- Filters/params as optional object arguments: `getBooks(filters?: BookFilters)`
- Define and export Input types for create/update operations

### Tech Stack

- **Frontend:** React 19 + TypeScript, Vite, TailwindCSS 4
- **UI Components:** shadcn/ui (shared via `@repo/ui`)
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** react-hook-form + Zod validation
- **Backend (Current):** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Backend (Future):** NestJS with PostgreSQL
- **Mobile (Planned):** React Native with Expo
- **Build System:** Turborepo 2.6+
- **Package Manager:** pnpm 10+

### Core Data Models

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| User | id, name, email, avatar | Managed via Supabase Auth |
| Book | id, ownerId, title, author, genre, borrowable | Core resource with ownership |
| BorrowRequest | id, bookId, borrowerId, status | Status: pending → approved/denied |
| Review | id, bookId, userId, rating, comment | Post-borrow feedback |
| Notification | id, type, userId, payload | Real-time via Supabase |

### Shared UI Package (`@repo/ui`)

The `@repo/ui` package exports:
- Components: `@repo/ui/components/*`
- Hooks: `@repo/ui/hooks/*`
- Utils: `@repo/ui/lib/*`
- Global styles: `@repo/ui/globals.css`

Uses shadcn/ui with Tailwind 4. Add new components via `pnpm ui <component-name>`.

### Project Structure

**Web App (`apps/web/src/`)**
- **`pages/`** - Route-level components (one per route, use default export)
- **`components/`** - Reusable UI components (group related ones in subdirectories like `Browse/`, `auth/`, `modals/`)
- **`hooks/`** - Custom React hooks (prefix with `use`)
- **`contexts/`** - React Context providers (e.g., `AuthContext`)
- **`lib/validations/`** - Zod validation schemas
- **`lib/constants/`** - Constant values and enums
- **`assets/`** - Static files

**API Client (`packages/api-client/src/`)**
- One file per resource (e.g., `books.ts`, `auth.ts`, `borrowRequests.ts`)
- Exports through `index.ts` barrel export
- Types in `types.ts` or co-located

## Key Guidelines

1. **Modularity First:** All shared code goes into `packages/`. Avoid duplicating logic across apps.

2. **Backend Abstraction:** Never couple frontend directly to Supabase. Use `api-client` package for all backend operations.

3. **Type Safety:** Share types via `packages/types/` (when created) to ensure consistency across web and mobile.

4. **Component Reusability:** Use `@repo/ui` for all shared components. Apps should contain only app-specific components.

5. **Testing:** Use Vitest/Jest for unit tests, Playwright for E2E tests (per technical plan).

## Code Standards & Patterns

**Component Architecture**
- Keep components small and focused (~150 lines max). Extract to smaller components when handling multiple concerns.
- Components should only handle presentation and user interaction.

**Business Logic Separation**
- Extract all business logic into custom hooks (e.g., `useBookManagement`, `useBorrowRequest`).
- Never put API calls, calculations, or complex state management directly in components.

**Data Fetching & Mutations**
- Use TanStack Query for all server state (queries and mutations).
- Prefer `mutateAsync` with try/catch for mutations - provides better error handling and control flow.
- Define query keys as constants using factory pattern for consistency and reusability.
- Invalidate queries in `onSuccess` callback for automatic refetch.

```typescript
// Export query key factories
export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (userId: string) => [...bookKeys.lists(), userId] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
};

// Use in mutations
export function useCreateBook(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: bookKeys.list(userId) });
      }
    },
  });
}

// In components
const { mutateAsync } = useMutation({ mutationFn: createBook })
const handleSubmit = async (data) => {
  try {
    await mutateAsync(data)
    // Handle success
  } catch (error) {
    // Handle error
  }
}
```

**Form Management**
- Use react-hook-form + Zod schemas + shadcn Form components for all forms.
- Define Zod schemas in separate files for reusability and type inference.

**Code Reusability (DRY)**
- Never duplicate code. Extract shared logic to custom hooks in `hooks/`.
- Move shared utilities to `packages/utils/` (or local `lib/utils.ts`).
- Move shared UI components to `@repo/ui` for cross-app reuse.

**Best Practices**
- Always use `import type` for type-only imports to optimize bundle size.
- Use `console.error()` for debugging errors during development.
- Show loading states: disable buttons during mutations, display loading text.
- Handle loading and error states in all components that fetch data.

```typescript
// ✅ Type imports
import type { Book, User } from '@repo/api-client';
import { getBooks } from '@repo/api-client';

// ✅ Loading states
<Button disabled={mutation.isPending}>
  {mutation.isPending ? 'Saving...' : 'Save'}
</Button>
```

## Naming Conventions

**Files**
- React Components: `PascalCase.tsx` (e.g., `AddBookForm.tsx`, `BookCard.tsx`)
- Pages: `PascalCase.tsx` (e.g., `Home.tsx`, `MyLibrary.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useBooks.ts`, `useAuth.ts`)
- Utilities: `camelCase.ts` (e.g., `utils.ts`, `formatDate.ts`)
- Constants: Domain name in lowercase (e.g., `book.ts` in `lib/constants/`)

**Components & Exports**
- Components: Named exports `export function MyComponent() { ... }`
- Pages: Default exports `export default function MyPage() { ... }`
- Props interfaces: `ComponentNameProps` (e.g., `BookCardProps`, `AddBookFormProps`)

**Hooks**
- Prefix with `use` (e.g., `useBooks`, `useBorrowRequest`)
- Export query keys: `export const entityKeys = { ... }`

**Types & Interfaces**
- Interfaces for data models: `interface Book`, `interface User`
- Types for unions: `type Status = 'pending' | 'approved' | 'denied'`
- Input types: Suffix with `Input` (e.g., `CreateBookInput`, `UpdateBookInput`)
- Filter types: Suffix with `Filters` (e.g., `BookFilters`)
- Form values: Suffix with `FormValues` (e.g., `BookFormValues`)

**Constants**
- Use `SCREAMING_SNAKE_CASE` (e.g., `BOOK_GENRES`, `BOOK_CONDITIONS`)
- Export with `as const` for type narrowing

**API Functions**
- CRUD prefixes: `get`, `create`, `update`, `delete`
- Collections plural: `getBooks()`, items singular: `getBook(id)`
- Filters as optional objects: `getBooks(filters?: BookFilters)`

## Environment Variables

**Required Variables:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

**Setup:**
1. Copy `.env.example` to `.env.local`: `cp apps/web/.env.example apps/web/.env.local`
2. Fill in Supabase credentials from your project settings

**Conventions:**
- Prefix with `VITE_` for client-side variables (Vite requirement)
- Never commit `.env.local` (in `.gitignore`)
- Keep `.env.example` updated with all required variables (without values)
- Access via `import.meta.env.VITE_VARIABLE_NAME`

## Important Files

- `/docs/book_sharing_app_prd.md` - Product requirements and feature specifications
- `/docs/book_sharing_technical_plan.md` - Detailed technical architecture and implementation roadmap
- `/docs/book_sharing_user_stories.md` - User stories and acceptance criteria
- `/turbo.json` - Turborepo task configuration (build, dev, lint pipeline)
- `/pnpm-workspace.yaml` - Workspace package definitions
