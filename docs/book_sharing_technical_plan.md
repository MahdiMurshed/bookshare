# Book Sharing App – Technical Architecture & Implementation Plan

## 1. Vision
Create a scalable, modular platform that allows users to manage personal book collections, lend and borrow books, and grow into a community ecosystem accessible via both web and mobile. The codebase should prioritize **maintainability**, **modularity**, and **easy backend replacement**.

---

## 2. System Overview
The project will use a **Turborepo monorepo** containing multiple applications and shared packages. Initially, it will use **Supabase** as the backend, abstracted behind a common API layer to allow seamless migration to a custom NestJS backend later.

### High-Level Architecture
```
[Web App (React + Vite)]  --->  [API Client Layer]  --->  [Supabase Backend]
        |                                 ^                     |
        |                                 |                     |
[Mobile App (Expo RN)] --------------------+---------------------+
```

---

## 3. Stack Overview
- **Frontend:** React + TypeScript (Vite), TailwindCSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Mobile:** React Native (Expo)
- **Shared:** TypeScript packages for types, utils, and API clients
- **Repo Management:** Turborepo

---

## 4. Monorepo Structure
```
bookshare/
├── apps/
│   ├── web/                 # React + Vite web app
│   ├── mobile/              # React Native (Expo) app (later)
│   └── backend/             # Future NestJS backend or Supabase edge functions
│
├── packages/
│   ├── ui/                  # Shared UI components (Tailwind + shadcn)
│   ├── types/               # Shared TypeScript types
│   ├── utils/               # Shared utility functions
│   ├── api-client/          # Supabase/NestJS abstraction layer
│   └── config/              # Shared constants, env vars
│
├── supabase/                # Supabase schema, SQL migrations, policies
│   ├── migrations/
│   ├── schema.sql
│   └── seed.sql
│
├── turbo.json
├── package.json
└── tsconfig.json
```

---

## 5. Core Modules
### Authentication
- Supabase Auth (email + OAuth)
- JWT tokens (optional NestJS support later)

### Book Management
- CRUD for books (title, author, genre, status, etc.)
- Ownership enforced by `ownerId`

### Borrow Flow
- Borrow requests stored in `borrow_requests`
- Owner approves/denies → triggers notifications

### Notifications
- Supabase Realtime → WebSocket (later optional NestJS WebSocket gateway)

### Reviews
- Borrowers can review after return; ratings visible on detail pages

---

## 6. API Layer (Backend Abstraction)
**Purpose:** Prevent direct coupling between frontend and Supabase. All backend operations go through `@repo/api-client` to enable seamless migration to NestJS later.

### Usage Pattern
```typescript
// ✅ Correct - Import from api-client
import {
  getBooks,
  createBook,
  signIn,
  type Book,
  type BookFilters,
  type CreateBookInput
} from '@repo/api-client';

// ❌ Wrong - Never import Supabase directly in apps
import { supabase } from '@repo/api-client/supabaseClient';
```

### API Client Structure
The api-client package (`packages/api-client/src/`) is organized by resource:

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| `auth.ts` | Authentication | `signIn`, `signUp`, `signOut`, `getSession`, `getCurrentUser` |
| `books.ts` | Book CRUD | `getBooks`, `createBook`, `updateBook`, `deleteBook`, `getUserBooks` |
| `bookSearch.ts` | External book search | `searchBooks`, `getBookDetails` |
| `borrowRequests.ts` | Borrow flow | `createBorrowRequest`, `approveBorrowRequest`, `markBookReturned` |
| `reviews.ts` | Reviews | `getReviews`, `createReview`, `getBookAverageRating` |
| `notifications.ts` | Notifications | `getMyNotifications`, `markAsRead`, `subscribeToNotifications` |
| `messages.ts` | Chat messaging | `sendMessage`, `getMessagesByRequest`, `subscribeToMessages` |
| `users.ts` | User profiles | `getUserProfile`, `updateProfile`, `uploadAvatar` |
| `communities.ts` | Communities | `getCommunities`, `joinCommunity`, `addBookToCommunity` |
| `admin.ts` | Admin panel | `getAdminStats`, `getAllUsers`, `sendBroadcastNotification` |

### Export Categories
The `index.ts` barrel export organizes exports into categories:

```typescript
// Types - Use 'import type' for these
export type { Book, User, BorrowRequest, Community, ... } from './types.js';

// Constants - For validation and UI
export { BOOK_CONDITIONS, BORROW_REQUEST_STATUSES, ... } from './types.js';

// Zod Schemas - For form validation (from @repo/shared)
export { bookFormSchema, borrowRequestStatusSchema, ... } from '@repo/shared';

// Resource functions - Organized by domain
export { getBooks, createBook, updateBook, ... } from './books.js';
export { signIn, signUp, signOut, ... } from './auth.js';
// ... other resource exports
```

### Function Patterns
All API functions follow these conventions:

```typescript
// Async functions that throw on error
export async function getBooks(filters?: BookFilters): Promise<Book[]> {
  const { data, error } = await supabase.from('books').select('*');
  if (error) throw error;
  return data;
}

// Input types for create/update operations
export interface CreateBookInput {
  title: string;
  author: string;
  genre?: string;
  // ...
}

// Filter types for query operations
export interface BookFilters {
  borrowable?: boolean;
  ownerId?: string;
  genre?: string;
}
```

### Migration Path
When migrating to NestJS, only the api-client internals change:

```typescript
// Before (Supabase)
export async function getBooks(filters?: BookFilters): Promise<Book[]> {
  const { data, error } = await supabase.from('books').select('*');
  if (error) throw error;
  return data;
}

// After (NestJS)
export async function getBooks(filters?: BookFilters): Promise<Book[]> {
  const { data } = await api.get('/books', { params: filters });
  return data;
}
```

Apps remain unchanged since they only import from `@repo/api-client`.

---

## 7. Data Models
| Entity | Key Fields | Description |
|---------|-------------|--------------|
| **User** | id, name, email, avatar | Managed via Supabase Auth |
| **Book** | id, ownerId, title, author, genre, borrowable | Core resource |
| **BorrowRequest** | id, bookId, borrowerId, status | Pending → Approved/Denied |
| **Review** | id, bookId, userId, rating, comment | Post-borrow feedback |
| **Notification** | id, type, userId, payload | Real-time events |

---

## 8. Development Plan
### Phase 1 – MVP
- Monorepo setup (Turborepo)
- Supabase project configuration
- Web app: auth + book CRUD + borrow request
- API abstraction layer

### Phase 2 – Core Expansion
- Reviews and notifications
- UI polishing with shadcn/ui
- Error handling, loading states, validations

### Phase 3 – Mobile App
- Setup Expo app
- Reuse shared logic, types, and API client
- Sync realtime data via Supabase or future backend

### Phase 4 – Backend Migration (Optional)
- Replace Supabase API calls with NestJS backend
- Keep schema compatible (PostgreSQL)

---

## 9. Testing & Quality
- **Unit Tests:** Vitest/Jest for utils and API layer
- **Integration Tests:** Supabase schema + backend routes
- **E2E Tests:** Playwright for key user flows

---

## 10. Deployment Plan
| Environment | Services | Notes |
|--------------|-----------|-------|
| Local | Vite + Supabase local dev | Developer testing |
| Staging | Supabase staging project + Vercel Preview | QA and review |
| Production | Vercel + Supabase (Managed) | Main environment |

---

## 11. Milestones
| Milestone | Deliverables | Target |
|------------|--------------|---------|
| **MVP** | Auth, Book CRUD, Borrow Flow | Month 1 |
| **Core Expansion** | Reviews, Notifications, UI Polish | Month 2 |
| **Mobile Alpha** | Core Mobile Integration | Month 3 |
| **Backend Migration (Optional)** | NestJS replacement | Month 4 |

---

This document serves as the technical foundation for implementation — guiding Claude Code and developers through architecture, structure, and roadmap for the Book Sharing App.

