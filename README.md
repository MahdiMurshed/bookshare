# BookShare

A modern, community-driven book sharing platform that enables users to manage personal book collections, lend and borrow books, and build meaningful connections through reading.

**Status:** ✅ MVP Complete - All core features implemented and functional

## Overview

BookShare is a full-stack web application built with modern technologies and best practices. The platform emphasizes trust-based book lending, real-time communication, and seamless user experience. Built as a monorepo using Turborepo, the architecture is designed for future scalability to mobile platforms while maintaining a clean separation between frontend and backend.

## ✨ Features

### Core Features (All Implemented ✅)

- **📚 Personal Library Management** - Add, edit, and organize your book collection with rich metadata
- **🔄 Smart Borrow System** - Complete borrow workflow from request to return with status tracking
- **✅ Approval Workflow** - Owners can approve or deny borrow requests with real-time notifications
- **💬 Real-time Chat** - In-app messaging between borrowers and owners for coordination
- **🔔 Live Notifications** - Real-time updates on requests, approvals, messages, and reviews
- **📦 Handover Tracking** - Track book exchange status and add delivery/pickup details
- **⭐ Reviews & Ratings** - Rate and review books after borrowing
- **👤 User Profiles** - Customizable profiles with avatars, bio, and activity statistics
- **🔍 Book Discovery** - Browse community books with search and filters
- **🛡️ Admin Panel** - Comprehensive admin dashboard with user management, analytics, and moderation

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with modern hooks and concurrent features
- **TypeScript** - Full type safety across the application
- **Vite** - Fast build tool with HMR
- **TailwindCSS 4** - Utility-first CSS with modern features
- **shadcn/ui** - High-quality, accessible UI components
- **TanStack Query** - Powerful data fetching and caching
- **React Hook Form** + **Zod** - Type-safe form handling and validation

### Backend
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication (email/password, OAuth ready)
  - Storage for file uploads
- **Backend Abstraction Layer** - Migration-ready architecture for future NestJS backend

### Development
- **Turborepo 2.6+** - High-performance build system
- **pnpm 10+** - Fast, efficient package manager
- **ESLint** + **Prettier** - Code quality and formatting

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- [pnpm](https://pnpm.io/) v10 or higher
- [Supabase](https://supabase.com) account (free tier available)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/MahdiMurshed/bookshare.git
   cd bookshare
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   ```bash
   # Copy the environment template
   cp apps/web/.env.example apps/web/.env.local
   ```

   Edit `apps/web/.env.local` and add your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can find these in your [Supabase project settings](https://supabase.com/dashboard) under Settings → API.

4. **Set up the database:**

   Your Supabase database should include the following tables:
   - `users` (managed by Supabase Auth)
   - `books`
   - `borrow_requests`
   - `messages`
   - `notifications`
   - `reviews`

   > **Note:** Database migrations will be added in a future update. For now, tables are created manually via Supabase dashboard.

5. **Start the development server:**

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:5173`

## 📦 Project Structure

```
bookshare/
├── apps/
│   ├── web/                    # Main web application (Vite + React)
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── pages/          # Route pages
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── contexts/       # React context providers
│   │   │   └── lib/            # Utilities and constants
│   │   └── ...
│   └── nextjs/                 # Alternative Next.js setup (unused)
├── packages/
│   ├── api-client/             # Backend abstraction layer
│   │   ├── src/
│   │   │   ├── auth.ts         # Authentication functions
│   │   │   ├── books.ts        # Book operations
│   │   │   ├── borrowRequests.ts
│   │   │   ├── messages.ts
│   │   │   ├── notifications.ts
│   │   │   ├── reviews.ts
│   │   │   ├── users.ts
│   │   │   └── admin.ts        # Admin operations
│   │   └── ...
│   ├── ui/                     # Shared UI components (shadcn/ui)
│   ├── eslint-config/          # Shared ESLint configuration
│   └── typescript-config/      # Shared TypeScript configuration
├── docs/                       # Product documentation
│   ├── book_sharing_app_prd.md
│   ├── book_sharing_technical_plan.md
│   └── book_sharing_user_stories.md
├── CLAUDE.md                   # Development guidelines
├── turbo.json                  # Turborepo configuration
└── package.json
```

## 💻 Development Commands

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm build            # Build all apps and packages for production
pnpm lint             # Lint all workspaces
pnpm format           # Format code with Prettier

# UI Components (shadcn/ui)
pnpm ui <component>   # Add new shadcn/ui component
# Example: pnpm ui dialog

# Workspace-Specific Commands
pnpm --filter web dev           # Start web app only
pnpm --filter @repo/ui lint     # Lint UI package only
pnpm --filter @repo/api-client build
```

## 🏗️ Architecture

### Backend Abstraction Layer

The application uses an **abstraction layer** to decouple the frontend from Supabase, enabling a seamless migration to NestJS or any other backend in the future.

**Example:**
```typescript
// ✅ Correct - Use api-client abstraction
import { getBooks, createBook, type Book } from '@repo/api-client';

const books = await getBooks({ borrowable: true });
await createBook({ title: 'Book Title', author: 'Author' });

// ❌ Wrong - Never import Supabase directly in apps
import { supabase } from '@repo/api-client/supabaseClient';
```

**Key Principles:**
- All backend operations go through `packages/api-client`
- Apps never import Supabase client directly
- Function signatures are backend-agnostic
- When migrating to NestJS, only `api-client` package needs changes

### Data Flow

```
[React Component]
    ↓
[Custom Hook (TanStack Query)]
    ↓
[API Client Function]
    ↓
[Supabase Client]
    ↓
[PostgreSQL Database]
```

## 📚 Documentation

- **[Product Requirements Document](./docs/book_sharing_app_prd.md)** - Features, requirements, and success metrics
- **[Technical Plan](./docs/book_sharing_technical_plan.md)** - Architecture and implementation roadmap
- **[User Stories](./docs/book_sharing_user_stories.md)** - User flows and acceptance criteria
- **[Development Guidelines](./CLAUDE.md)** - Code standards, naming conventions, and best practices

## 🔐 Security

- **Supabase Auth** - Industry-standard authentication
- **Row Level Security (RLS)** - Database-level access control
- **Type Validation** - Zod schemas for all user inputs
- **XSS Protection** - No `dangerouslySetInnerHTML` usage
- **Environment Variables** - Secrets stored securely, never committed

## 🎯 Code Quality

- ✅ **Full TypeScript** - 100% type coverage, no `any` types
- ✅ **Backend Abstraction** - Clean separation, migration-ready
- ✅ **Error Handling** - Standardized error logging throughout
- ✅ **Component Architecture** - Small, focused components (< 200 lines)
- ✅ **Query Management** - Proper TanStack Query with key factories
- ✅ **Race Condition Prevention** - isMounted flags in subscriptions
- ✅ **Memory Leak Prevention** - Proper cleanup in all effects

## 📈 Current Status

**MVP Complete** - All 9 core features implemented:
1. ✅ User Authentication
2. ✅ Book Inventory Management
3. ✅ Browse Community Books
4. ✅ Borrow Requests with Tracking
5. ✅ Real-time Chat
6. ✅ Notifications
7. ✅ User Profiles
8. ✅ Book Reviews
9. ✅ Admin Panel

**Next Steps for Production:**
- Add comprehensive test coverage (unit, integration, E2E)
- Set up deployment pipeline (Vercel/Netlify)
- Implement database migrations with Supabase CLI
- Add error tracking (Sentry)
- Set up monitoring and analytics

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Code Quality** - Follow the patterns in `CLAUDE.md`
2. **Type Safety** - Maintain full TypeScript coverage
3. **Backend Abstraction** - Never import Supabase directly in apps
4. **Component Size** - Keep components focused and under 200 lines
5. **Testing** - Add tests for new features
6. **Documentation** - Update docs for significant changes

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes with clear messages
4. Push to your fork (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues

See [GitHub Issues](https://github.com/MahdiMurshed/bookshare/issues) for current bugs and feature requests.

## 📄 License

[License Type] - See LICENSE file for details

## 🙏 Acknowledgments

- [Turborepo](https://turbo.build/repo) - Build system
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Supabase](https://supabase.com) - Backend platform
- [TanStack Query](https://tanstack.com/query) - Data fetching

---

**Built by [MahdiMurshed](https://github.com/MahdiMurshed)** | **Status:** MVP Complete 🎉
