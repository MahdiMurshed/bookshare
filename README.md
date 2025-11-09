# BookShare

A community-driven book sharing platform that enables users to manage personal book collections, lend and borrow books, and build connections through reading.

## Overview

BookShare is built as a modern monorepo using Turborepo, designed to scale from a web application to mobile platforms while maintaining shared business logic and UI components. The platform emphasizes trust-based book lending, community building, and seamless user experience across devices.

## Features

- **Personal Library Management** - Catalog and organize your book collection
- **Book Lending System** - Lend books to trusted community members
- **Borrow Requests** - Request to borrow books with approval workflow
- **Reviews & Ratings** - Share feedback on borrowed books
- **Real-time Notifications** - Stay updated on borrow requests and book availability
- **Community Discovery** - Find books and connect with readers nearby

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS 4
- **UI Framework:** shadcn/ui components
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Build System:** Turborepo 2.6+
- **Package Manager:** pnpm 10+
- **Mobile:** React Native with Expo (planned)

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- [pnpm](https://pnpm.io/) v10 or higher

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd bookshare
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   # Copy environment template (when available)
   cp .env.example .env.local
   ```

4. Start development servers:

   ```bash
   pnpm dev
   ```

   This starts all apps in development mode using Turborepo's task orchestration.

## Development Commands

```bash
# Development
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps and packages
pnpm lint             # Lint all workspaces
pnpm format           # Format code with Prettier

# UI Components
pnpm ui <component>   # Add new shadcn/ui component (e.g., pnpm ui card)

# Workspace-Specific Commands
pnpm --filter web dev
pnpm --filter @repo/ui lint
```

## Project Structure

```
bookshare/
├── apps/
│   ├── web/              # Main web application (Vite + React)
│   └── nextjs/           # Next.js application (alternative/future use)
├── packages/
│   ├── ui/               # Shared UI components (shadcn/ui + Tailwind 4)
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/# Shared TypeScript configuration
├── docs/                 # Project documentation
└── CLAUDE.md            # Development guidelines for AI assistance
```

### Planned Packages

- `types/` - Shared TypeScript types and interfaces
- `utils/` - Shared utility functions
- `api-client/` - Backend abstraction layer (Supabase → future NestJS migration)
- `config/` - Shared constants and environment variables

## Architecture

### Monorepo Strategy

This project uses **Turborepo** with **pnpm workspaces** to manage multiple applications and shared packages. The monorepo structure enables:

- Code sharing across web and mobile platforms
- Consistent tooling and configuration
- Efficient builds with Turborepo's caching
- Independent deployment of applications

### Backend Abstraction Layer

The architecture implements an abstraction layer between frontend and backend to enable seamless migration from Supabase to a custom NestJS backend in the future:

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

**Key Principles:**
- All backend calls go through `packages/api-client/`
- Never import Supabase client directly in apps
- Design APIs to be backend-agnostic

## Documentation

- [Product Requirements Document](./docs/book_sharing_app_prd.md)
- [Technical Plan](./docs/book_sharing_technical_plan.md)
- [User Stories](./docs/book_sharing_user_stories.md)
- [Development Guidelines](./CLAUDE.md)

## Development Phases

### Phase 1: MVP (Current)
- ✅ Turborepo monorepo setup
- 🚧 Supabase configuration
- 🚧 Web app: Authentication + Book CRUD + Borrow Requests
- 🚧 API abstraction layer

### Phase 2: Core Expansion
- Reviews and notifications
- UI polishing with shadcn/ui
- Error handling and validations

### Phase 3: Mobile
- Expo app setup
- Reuse shared packages (types, utils, api-client)

### Phase 4: Backend Migration
- Optional NestJS backend replacement
- Maintain PostgreSQL schema compatibility

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Modularity First** - All shared code goes into `packages/`
2. **Type Safety** - Use TypeScript strictly
3. **Backend Abstraction** - Never couple frontend directly to Supabase
4. **Component Reusability** - Use `@repo/ui` for shared components
5. **Testing** - Write tests for new features (Vitest/Jest + Playwright)

## License

[License Type] - See LICENSE file for details

---

Built with ❤️ using [Turborepo](https://turbo.build/repo) and [shadcn/ui](https://ui.shadcn.com/)
