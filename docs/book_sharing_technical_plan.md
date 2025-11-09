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

## 6. API Layer (Abstraction Example)
**Purpose:** Prevent direct coupling between frontend and Supabase.

Example:
```ts
// packages/api-client/books.ts
export async function getBooks() {
  const { data, error } = await supabase.from('books').select('*')
  if (error) throw error
  return data
}
```
Later replaced by:
```ts
// packages/api-client/books.ts
export async function getBooks() {
  const { data } = await api.get('/books')
  return data
}
```

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

