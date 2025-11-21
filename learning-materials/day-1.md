# Day 1: High-Level Architecture & Mental Models

## Learning Objectives

By the end of today, you will:
- Understand the overall architecture of the `api-client` package
- Know how all 13 modules relate to each other
- Grasp the mental models needed before diving deeper
- Recognize the design principles at play

---

## 1. The Big Picture: What Is This Package?

Your `api-client` is a **backend abstraction layer** - it sits between your frontend applications and your database (Supabase). Think of it as a translator that speaks "frontend" on one side and "database" on the other.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Apps                             │
│         (apps/web, future apps/mobile)                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │ imports
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     @repo/api-client                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      index.ts                                ││
│  │            (barrel export - public API)                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                           │                                      │
│           ┌───────────────┼───────────────┐                     │
│           ▼               ▼               ▼                     │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐                │
│    │ auth.ts  │    │ books.ts │    │ users.ts │   ... etc      │
│    └────┬─────┘    └────┬─────┘    └────┬─────┘                │
│         │               │               │                       │
│         └───────────────┼───────────────┘                       │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │               supabaseClient.ts                              ││
│  │         (single point of backend connection)                 ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────┬───────────────────────────────────────────┘
                      │ network calls
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Supabase                                  │
│    (PostgreSQL + Auth + Storage + Realtime)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

1. **Abstraction**: Apps never see Supabase directly. They call `getBooks()`, not `supabase.from('books').select('*')`.

2. **Migration-Ready**: Every file has `// Future: NestJS implementation` comments. When you switch backends, only this package changes.

3. **Type Safety**: Types are defined once in `types.ts` and shared everywhere.

4. **Testability**: You can mock the entire api-client without knowing anything about Supabase.

---

## 2. Module Map: The 13 Files

Your api-client has 13 source files. Here's what each does:

### Core Infrastructure (2 files)

| File | Purpose | Lines |
|------|---------|-------|
| `supabaseClient.ts` | Creates and exports the Supabase client instance | 36 |
| `types.ts` | All shared TypeScript interfaces and types | 282 |

### Domain Modules (10 files)

| File | Domain | Key Entities | Lines |
|------|--------|--------------|-------|
| `auth.ts` | Authentication | Session, AuthUser | 197 |
| `books.ts` | Book management | Book, BookWithOwner | 307 |
| `borrowRequests.ts` | Borrowing workflow | BorrowRequest | 492 |
| `reviews.ts` | Book reviews | Review | 225 |
| `notifications.ts` | User notifications | Notification | 270 |
| `messages.ts` | Chat/messaging | Message | 298 |
| `users.ts` | User profiles | User | 188 |
| `userSearch.ts` | User discovery | User | 48 |
| `communities.ts` | Community features | Community, CommunityMember | 762 |
| `admin.ts` | Admin dashboard | AdminStats, various | 1573 |

### External Integration (1 file)

| File | Purpose | Lines |
|------|---------|-------|
| `bookSearch.ts` | Google Books API integration | 133 |

### Export Layer (1 file)

| File | Purpose | Lines |
|------|---------|-------|
| `index.ts` | Barrel export (public API surface) | 283 |

---

## 3. Dependency Graph: How Modules Relate

```
                    ┌─────────────────┐
                    │  supabaseClient │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐         ┌─────────┐         ┌─────────────┐
   │  auth   │         │  types  │◄────────│  All modules │
   └─────────┘         └─────────┘         └─────────────┘

   ┌─────────────────────────────────────────────────────┐
   │           DOMAIN MODULES (peer relationships)        │
   │                                                      │
   │    books ──────────► borrowRequests ◄────── users   │
   │      │                     │                  │      │
   │      │                     ▼                  │      │
   │      │               messages ◄───────────────┘      │
   │      │                     │                         │
   │      │                     ▼                         │
   │      └─────────────► notifications                   │
   │                            │                         │
   │    communities ◄───────────┘                         │
   │                                                      │
   │    admin (imports from most modules for analytics)   │
   └─────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────┐
   │  EXTERNAL (no Supabase dependency)                   │
   │    bookSearch (Google Books API only)                │
   └─────────────────────────────────────────────────────┘
```

### Key Relationships

1. **`supabaseClient.ts`** - The root. Every module that talks to the database imports from here.

2. **`types.ts`** - The shared vocabulary. Imported by every module for type definitions.

3. **`auth.ts`** - Standalone. Handles authentication, doesn't depend on other domain modules.

4. **`messages.ts`** - Cross-cutting. Imports from `borrowRequests.ts` and `notifications.ts`.

5. **`admin.ts`** - The aggregator. Imports types from `communities.ts` and uses data from all domains.

6. **`bookSearch.ts`** - The outlier. Doesn't use Supabase at all (external API).

---

## 4. Design Principles in Action

### Principle 1: Single Responsibility

Each module handles one domain. `books.ts` knows nothing about notifications. `auth.ts` knows nothing about reviews.

```typescript
// books.ts - only book operations
export async function getBooks(filters?: BookFilters): Promise<Book[]>
export async function createBook(input: CreateBookInput): Promise<Book>
export async function updateBook(id: string, input: UpdateBookInput): Promise<Book>
export async function deleteBook(id: string): Promise<void>
```

### Principle 2: Abstraction Boundary

The frontend never sees Supabase. Look at how `index.ts` exports:

```typescript
// What apps see:
export { getBooks, createBook, updateBook, deleteBook } from './books.js';

// What apps DON'T see:
// supabase.from('books').select('*')...
```

The `// Note: Supabase client is intentionally NOT exported` comment at the bottom of `index.ts` is deliberate.

### Principle 3: Throw Errors, Don't Return Them

Every function follows the same pattern:

```typescript
export async function getBook(id: string): Promise<Book | null> {
  const { data, error } = await supabase.from('books')...

  if (error) throw error;  // <-- Always throw
  return data as Book;
}
```

This lets callers use try/catch instead of checking `result.error` every time.

### Principle 4: Input Types vs Entity Types

Notice the naming pattern:

```typescript
// Entity (what the database returns)
interface Book {
  id: string;
  title: string;
  // ... all fields including id, timestamps
}

// Input (what you provide to create)
interface CreateBookInput {
  title: string;
  author: string;
  // ... only the fields you control
}

// Input (what you provide to update)
interface UpdateBookInput {
  title?: string;  // optional - partial updates
  author?: string;
}
```

### Principle 5: Filter Objects for Queries

Instead of multiple function parameters:

```typescript
// Bad: too many parameters
getBooks(genre?: string, borrowable?: boolean, ownerId?: string)

// Good: filter object
getBooks(filters?: BookFilters)

interface BookFilters {
  genre?: string;
  borrowable?: boolean;
  owner_id?: string;
  search?: string;
}
```

---

## 5. The Mental Model: Three Layers

When thinking about this codebase, visualize three layers:

### Layer 1: Transport (supabaseClient.ts)

The "how we talk to the database" layer. Currently Supabase, but designed to be swappable.

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

### Layer 2: Domain (books.ts, users.ts, etc.)

The "what operations exist" layer. Each file is a collection of functions for one domain.

```typescript
// Domain operations for books
getBooks(), getBook(), createBook(), updateBook(), deleteBook()
getUserBooks(), getAvailableBooks(), getBooksWithOwners()
uploadBookCover()
```

### Layer 3: Contract (types.ts + index.ts)

The "what apps can use" layer. Types define the shape, index.ts defines what's public.

```typescript
// types.ts - The shape of data
export interface Book { ... }
export interface CreateBookInput { ... }

// index.ts - The public API
export type { Book, CreateBookInput } from './types.js';
export { getBooks, createBook } from './books.js';
```

---

## 6. Real-Time Features: A Special Case

Two modules have real-time capabilities:

### notifications.ts
```typescript
export function subscribeToNotifications(callback: (notification: Notification) => void) {
  const subscription = supabase
    .channel('notifications')
    .on('postgres_changes', { event: 'INSERT', table: 'notifications' }, ...)
    .subscribe();

  return () => subscription.unsubscribe();
}
```

### messages.ts
```typescript
export function subscribeToMessages(requestId: string, callback: ...) {
  const subscription = supabase
    .channel(`messages:${requestId}`)
    .on('postgres_changes', { filter: `borrow_request_id=eq.${requestId}` }, ...)
    .subscribe();

  return () => subscription.unsubscribe();
}
```

**Mental Model**: These functions return unsubscribe functions. The pattern is:
```typescript
const unsubscribe = subscribeToMessages(requestId, handleNewMessage);
// Later, when component unmounts:
unsubscribe();
```

---

## 7. The External API: bookSearch.ts

This module is different - it doesn't use Supabase at all:

```typescript
// bookSearch.ts
export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodedQuery}`
  );
  // ...
}
```

**Why it's in api-client**: It's still a "backend" operation from the app's perspective. The app doesn't care if data comes from Supabase or Google - it just calls the api-client.

---

## 8. Reflection Questions

Before moving to Day 2, ask yourself:

1. **Why doesn't `index.ts` export `supabase` directly?**
   - Think about what would happen if apps could call `supabase.from('books')` directly.

2. **What would need to change if you switched from Supabase to a REST API?**
   - Which files would need updates?
   - Which files would stay the same?

3. **Why are `CreateBookInput` and `UpdateBookInput` separate types?**
   - Could you use one type for both?
   - What are the trade-offs?

4. **Why do real-time subscriptions return an unsubscribe function?**
   - What would happen if they didn't?
   - How does this relate to React's useEffect cleanup?

5. **Why is `admin.ts` so much larger than other modules (1573 lines)?**
   - Is this a problem?
   - How might you split it up?

---

## 9. Reading Plan for Day 1

Today, read these files in order:

1. **`types.ts`** (15 minutes) - Read every interface. Understand the data shapes.

2. **`supabaseClient.ts`** (5 minutes) - It's short. Understand the configuration options.

3. **`index.ts`** (10 minutes) - Scan all exports. This is your public API surface.

4. **`books.ts`** (20 minutes) - Read every function. This is a "template" for other modules.

5. **`auth.ts`** (15 minutes) - Understand the auth flow.

**Total**: ~65 minutes of focused reading.

---

## 10. Key Takeaways

1. **The api-client is an abstraction layer** - Apps never see the database directly.

2. **13 files, 3 logical layers** - Transport, Domain, Contract.

3. **Every module follows the same patterns** - Throw errors, use filter objects, separate Input types.

4. **Real-time is subscription-based** - Functions return unsubscribe callbacks.

5. **One outlier exists** - `bookSearch.ts` talks to Google, not Supabase.

6. **Migration is planned** - Comments throughout show the NestJS migration path.

---

## Next: Day 2

Tomorrow we'll dive deep into the data models in `types.ts` - understanding why each schema is designed the way it is, what alternatives existed, and what trade-offs were made.
