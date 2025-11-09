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

The architecture uses an **abstraction layer** between frontend and backend to enable seamless migration from Supabase to a custom NestJS backend later. When implementing backend features:

1. All backend calls must go through `packages/api-client/`
2. Never import Supabase client directly in apps
3. Design APIs to be backend-agnostic

Example pattern:
```typescript
// packages/api-client/books.ts
export async function getBooks() {
  // Current: Supabase implementation
  const { data, error } = await supabase.from('books').select('*')
  if (error) throw error
  return data

  // Future: Replace with NestJS API call
  // const { data } = await api.get('/books')
  // return data
}
```

### Tech Stack

- **Frontend:** React 19 + TypeScript, Vite, TailwindCSS 4
- **UI Components:** shadcn/ui (shared via `@repo/ui`)
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

## Development Phases

Per the technical plan:

**Phase 1 (MVP)** - Current
- Turborepo monorepo setup ✓
- Supabase configuration (pending)
- Web app: auth + book CRUD + borrow requests
- API abstraction layer

**Phase 2 (Core Expansion)**
- Reviews and notifications
- UI polishing with shadcn/ui
- Error handling and validations

**Phase 3 (Mobile)**
- Expo app setup
- Reuse shared packages (types, utils, api-client)

**Phase 4 (Backend Migration)**
- Optional NestJS backend replacement
- Maintain PostgreSQL schema compatibility

## Key Guidelines

1. **Modularity First:** All shared code goes into `packages/`. Avoid duplicating logic across apps.

2. **Backend Abstraction:** Never couple frontend directly to Supabase. Use `api-client` package for all backend operations.

3. **Type Safety:** Share types via `packages/types/` (when created) to ensure consistency across web and mobile.

4. **Component Reusability:** Use `@repo/ui` for all shared components. Apps should contain only app-specific components.

5. **Testing:** Use Vitest/Jest for unit tests, Playwright for E2E tests (per technical plan).

## Important Files

- `/docs/book_sharing_app_prd.md` - Product requirements and feature specifications
- `/docs/book_sharing_technical_plan.md` - Detailed technical architecture and implementation roadmap
- `/docs/book_sharing_user_stories.md` - User stories and acceptance criteria
- `/turbo.json` - Turborepo task configuration (build, dev, lint pipeline)
- `/pnpm-workspace.yaml` - Workspace package definitions
