# Day 6: Refactoring & System Redesign

## Learning Objectives

By the end of today, you will:
- Know specific refactors for each module
- Identify opportunities for shared abstractions
- Understand domain modeling improvements
- Learn caching, batching, and memoization strategies
- Have an architectural restructuring roadmap

---

## 1. Refactoring Principles

Before diving into specifics, let's establish principles:

### Principle 1: Small, Incremental Changes
Don't rewrite everything at once. Each refactor should be:
- Independently deployable
- Backward compatible (or explicitly breaking)
- Testable in isolation

### Principle 2: Extract, Then Abstract
1. First, extract repeated code into functions
2. Then, identify patterns and create abstractions
3. Finally, generalize only when you have 3+ use cases

### Principle 3: Types Guide Refactoring
TypeScript will catch breaking changes. Use `// @ts-expect-error` to find all call sites.

---

## 2. Per-Module Refactoring Plans

### Module: supabaseClient.ts

**Current State**: 35 lines, singleton pattern

**Issues**:
1. Not testable (client created at import time)
2. No error handling for failed initialization

**Refactor 1: Factory Pattern for Testability**

```typescript
// supabaseClient.ts - BEFORE (current)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {...});

// supabaseClient.ts - AFTER
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }

    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

// For testing
export function __setSupabaseForTesting(mockClient: SupabaseClient): void {
  client = mockClient;
}

export function __resetSupabase(): void {
  client = null;
}

// Backward compatibility (deprecated)
/** @deprecated Use getSupabase() instead */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  },
});
```

**Migration Path**:
1. Add `getSupabase()` alongside existing export
2. Gradually update modules to use `getSupabase()`
3. Eventually remove `supabase` export

---

### Module: types.ts

**Current State**: 297 lines, all types centralized

**Issues**:
1. Input types scattered in domain modules
2. No validation (types are compile-time only)

**Refactor 1: Centralize Input Types**

```typescript
// types.ts - Add input types

// Book inputs (currently in books.ts)
export interface CreateBookInput {
  title: string;
  author: string;
  isbn?: string;
  genre?: string;
  description?: string;
  cover_image_url?: string;
  condition: BookCondition;
  borrowable: boolean;
}

export interface UpdateBookInput extends Partial<CreateBookInput> {}

export interface BookFilters {
  genre?: string;
  borrowable?: boolean;
  owner_id?: string;
  search?: string;
}

// Similar for other domains...
```

**Refactor 2: Add Zod Schemas for Runtime Validation**

```typescript
// validations.ts (new file)
import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1).max(255),
  author: z.string().min(1).max(255),
  isbn: z.string().regex(/^\d{10}|\d{13}$/).optional(),
  genre: z.string().optional(),
  description: z.string().max(5000).optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  borrowable: z.boolean(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;

// Usage in books.ts
export async function createBook(input: CreateBookInput): Promise<Book> {
  const validated = createBookSchema.parse(input); // Throws if invalid
  // ...
}
```

---

### Module: books.ts

**Current State**: 306 lines, good structure

**Issues**:
1. `uploadBookCover` mixes storage and data concerns
2. Search uses slow `ilike`

**Refactor 1: Extract Storage Operations**

```typescript
// storage.ts (new file)
import { getSupabase } from './supabaseClient';

export interface UploadOptions {
  bucket: string;
  path: string;
  file: File;
  upsert?: boolean;
}

export async function uploadFile(options: UploadOptions): Promise<string> {
  const supabase = getSupabase();

  const { error } = await supabase.storage
    .from(options.bucket)
    .upload(options.path, options.file, {
      cacheControl: '3600',
      upsert: options.upsert ?? true,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(options.bucket)
    .getPublicUrl(options.path);

  return publicUrl;
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

// books.ts - updated
import { uploadFile } from './storage';

export async function uploadBookCover(bookId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `book-covers/${bookId}-${Date.now()}.${ext}`;

  const publicUrl = await uploadFile({
    bucket: 'books',
    path,
    file,
  });

  await updateBook(bookId, { cover_image_url: publicUrl });
  return publicUrl;
}
```

**Refactor 2: Full-Text Search RPC**

```sql
-- In Supabase SQL editor
CREATE OR REPLACE FUNCTION search_books(
  search_term TEXT,
  filter_genre TEXT DEFAULT NULL,
  filter_borrowable BOOLEAN DEFAULT NULL,
  filter_owner_id UUID DEFAULT NULL
)
RETURNS SETOF books AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM books
  WHERE
    (search_term IS NULL OR search_term = '' OR
     to_tsvector('english', coalesce(title, '') || ' ' || coalesce(author, ''))
     @@ plainto_tsquery('english', search_term))
    AND (filter_genre IS NULL OR genre = filter_genre)
    AND (filter_borrowable IS NULL OR borrowable = filter_borrowable)
    AND (filter_owner_id IS NULL OR owner_id = filter_owner_id)
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

```typescript
// books.ts
export async function getBooks(filters?: BookFilters): Promise<Book[]> {
  const supabase = getSupabase();

  // Use RPC for search, direct query otherwise
  if (filters?.search) {
    const { data, error } = await supabase.rpc('search_books', {
      search_term: filters.search,
      filter_genre: filters.genre ?? null,
      filter_borrowable: filters.borrowable ?? null,
      filter_owner_id: filters.owner_id ?? null,
    });

    if (error) throw error;
    return data as Book[];
  }

  // Original query for non-search cases
  let query = supabase.from('books').select('*');
  // ... existing filter logic
}
```

---

### Module: borrowRequests.ts

**Current State**: 491 lines, state machine logic mixed with data access

**Issues**:
1. Large file with multiple concerns
2. Non-atomic multi-table updates
3. State transitions scattered

**Refactor 1: Split Into Sub-Modules**

```
borrowRequests/
├── index.ts            # Re-exports public API
├── types.ts            # Input types, filters
├── queries.ts          # Read operations
├── mutations.ts        # Write operations (CRUD)
├── workflow.ts         # State machine transitions
└── tracking.ts         # Handover/return tracking
```

```typescript
// borrowRequests/index.ts
export type {
  CreateBorrowRequestInput,
  UpdateBorrowRequestInput,
  HandoverDetails,
  ReturnDetails,
  BorrowRequestFilters,
} from './types';

export {
  getBorrowRequests,
  getBorrowRequest,
  getMyBorrowRequests,
  getIncomingBorrowRequests,
  getMyBorrowRequestsWithDetails,
  getIncomingBorrowRequestsWithDetails,
  getActiveChats,
} from './queries';

export {
  createBorrowRequest,
  updateBorrowRequest,
  deleteBorrowRequest,
} from './mutations';

export {
  approveBorrowRequest,
  denyBorrowRequest,
  markHandoverComplete,
  markBookReturned,
  initiateReturn,
} from './workflow';

export {
  updateHandoverTracking,
  updateReturnTracking,
} from './tracking';
```

**Refactor 2: Atomic Workflow Transitions**

```typescript
// borrowRequests/workflow.ts
export async function approveBorrowRequest(
  id: string,
  dueDate: string,
  handoverDetails: HandoverDetails,
  responseMessage?: string
): Promise<BorrowRequest> {
  const supabase = getSupabase();

  // Use RPC for atomic transaction
  const { data, error } = await supabase.rpc('approve_borrow_request', {
    p_request_id: id,
    p_due_date: dueDate,
    p_handover_method: handoverDetails.method,
    p_handover_address: handoverDetails.address ?? null,
    p_handover_datetime: handoverDetails.datetime ?? null,
    p_handover_instructions: handoverDetails.instructions ?? null,
    p_response_message: responseMessage ?? null,
  });

  if (error) throw error;
  return data as BorrowRequest;
}
```

---

### Module: messages.ts

**Current State**: 297 lines, coupled to borrowRequests and notifications

**Issues**:
1. Cross-module dependencies create tight coupling
2. Hidden notification side effect

**Refactor 1: Event-Based Notification**

Instead of directly calling `createNotification`, emit an event:

```typescript
// events.ts (new file)
type EventCallback<T> = (data: T) => void | Promise<void>;

class EventEmitter {
  private listeners = new Map<string, Set<EventCallback<any>>>();

  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  async emit<T>(event: string, data: T): Promise<void> {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      await Promise.all([...callbacks].map(cb => cb(data)));
    }
  }
}

export const events = new EventEmitter();

// Event types
export interface MessageSentEvent {
  message: Message;
  requestId: string;
  senderId: string;
  recipientId: string;
}

// messages.ts - refactored
import { events, type MessageSentEvent } from './events';

export async function sendMessage(requestId: string, content: string): Promise<Message> {
  // ... create message logic ...

  // Emit event instead of creating notification directly
  await events.emit<MessageSentEvent>('message:sent', {
    message: data as Message,
    requestId,
    senderId: user.id,
    recipientId,
  });

  return data as Message;
}

// notifications.ts - subscribe to event
import { events, type MessageSentEvent } from './events';

// Set up listener (called once at module load)
events.on<MessageSentEvent>('message:sent', async (event) => {
  try {
    await createNotification({
      user_id: event.recipientId,
      type: 'new_message',
      title: 'New Message',
      message: `You have a new message`,
      payload: { request_id: event.requestId },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
});
```

**Benefits**:
- Messages module doesn't import notifications
- Easy to add more listeners (analytics, logging)
- Notification failure doesn't affect message sending

---

### Module: admin.ts

**Current State**: 1574 lines, "god module"

**Issues**:
1. Violates single responsibility
2. Difficult to navigate
3. Hard to test individual features

**Refactor: Split Into Domain-Based Modules**

```
admin/
├── index.ts              # Re-exports all
├── types.ts              # Admin-specific types
├── stats.ts              # getAdminStats, dashboard metrics
├── users.ts              # User management (suspend, promote, delete)
├── content.ts            # Content moderation (flag, delete books/reviews)
├── requests.ts           # Borrow request overrides
├── notifications.ts      # System notifications (broadcast, group)
├── analytics.ts          # Advanced analytics (retention, KPIs)
└── communities.ts        # Community admin operations
```

```typescript
// admin/stats.ts (~150 lines)
export interface AdminStats {
  totalUsers: number;
  totalBooks: number;
  totalCommunities: number;
  activeBorrows: number;
  pendingRequests: number;
  totalBorrowRequests: number;
  completedBorrows: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = getSupabase();

  // Parallel execution
  const [users, books, communities, active, pending, total, completed] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('communities').select('*', { count: 'exact', head: true }),
    supabase.from('borrow_requests').select('*', { count: 'exact', head: true }).eq('status', 'borrowed'),
    supabase.from('borrow_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('borrow_requests').select('*', { count: 'exact', head: true }),
    supabase.from('borrow_requests').select('*', { count: 'exact', head: true }).eq('status', 'returned'),
  ]);

  return {
    totalUsers: users.count ?? 0,
    totalBooks: books.count ?? 0,
    totalCommunities: communities.count ?? 0,
    activeBorrows: active.count ?? 0,
    pendingRequests: pending.count ?? 0,
    totalBorrowRequests: total.count ?? 0,
    completedBorrows: completed.count ?? 0,
  };
}
```

```typescript
// admin/analytics.ts (~300 lines)
// Replace N+1 query with SQL aggregation

export async function getMostActiveUsers(limit = 10): Promise<ActiveUser[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc('get_most_active_users', {
    p_limit: limit,
  });

  if (error) throw error;
  return data as ActiveUser[];
}

// SQL function
/*
CREATE FUNCTION get_most_active_users(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  total_borrows BIGINT,
  total_lends BIGINT,
  active_requests BIGINT
) AS $$
  SELECT
    u.id,
    u.name,
    u.email,
    u.avatar_url,
    COUNT(DISTINCT br_borrow.id) as total_borrows,
    COUNT(DISTINCT br_lend.id) as total_lends,
    COUNT(DISTINCT br_active.id) as active_requests
  FROM users u
  LEFT JOIN borrow_requests br_borrow ON br_borrow.borrower_id = u.id
  LEFT JOIN borrow_requests br_lend ON br_lend.owner_id = u.id
  LEFT JOIN borrow_requests br_active ON
    (br_active.owner_id = u.id OR br_active.borrower_id = u.id)
    AND br_active.status IN ('pending', 'approved', 'borrowed')
  GROUP BY u.id
  ORDER BY (COUNT(DISTINCT br_borrow.id) + COUNT(DISTINCT br_lend.id)) DESC
  LIMIT p_limit;
$$ LANGUAGE SQL;
*/
```

---

## 3. Shared Abstractions

### Abstraction 1: Base Repository

Create a generic repository for common operations:

```typescript
// lib/repository.ts
import { getSupabase } from './supabaseClient';

export interface QueryOptions {
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  offset?: number;
}

export class Repository<T, CreateInput, UpdateInput> {
  constructor(private tableName: string) {}

  async getAll(options?: QueryOptions): Promise<T[]> {
    const supabase = getSupabase();
    let query = supabase.from(this.tableName).select('*');

    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? false });
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  }

  async getById(id: string): Promise<T | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as T | null;
  }

  async create(input: CreateInput): Promise<T> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  async update(id: string, input: UpdateInput): Promise<T> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from(this.tableName)
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

// Usage in reviews.ts
const reviewRepo = new Repository<Review, CreateReviewInput, UpdateReviewInput>('reviews');

export const getReviews = () => reviewRepo.getAll({ orderBy: 'created_at' });
export const getReview = (id: string) => reviewRepo.getById(id);
// Custom methods for domain logic...
```

### Abstraction 2: Query Builder

```typescript
// lib/queryBuilder.ts
export class QueryBuilder<T> {
  private table: string;
  private selectFields = '*';
  private filters: Array<{ method: string; args: any[] }> = [];
  private orderByField?: string;
  private orderAscending = false;
  private limitCount?: number;

  constructor(table: string) {
    this.table = table;
  }

  select(fields: string): this {
    this.selectFields = fields;
    return this;
  }

  where(column: string, value: any): this {
    this.filters.push({ method: 'eq', args: [column, value] });
    return this;
  }

  whereIn(column: string, values: any[]): this {
    this.filters.push({ method: 'in', args: [column, values] });
    return this;
  }

  whereLike(column: string, pattern: string): this {
    this.filters.push({ method: 'ilike', args: [column, pattern] });
    return this;
  }

  orderBy(column: string, ascending = false): this {
    this.orderByField = column;
    this.orderAscending = ascending;
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  async execute(): Promise<T[]> {
    const supabase = getSupabase();
    let query = supabase.from(this.table).select(this.selectFields);

    for (const filter of this.filters) {
      query = (query as any)[filter.method](...filter.args);
    }

    if (this.orderByField) {
      query = query.order(this.orderByField, { ascending: this.orderAscending });
    }

    if (this.limitCount) {
      query = query.limit(this.limitCount);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  }
}

// Usage
const books = await new QueryBuilder<Book>('books')
  .where('borrowable', true)
  .whereLike('title', '%fantasy%')
  .orderBy('created_at')
  .limit(10)
  .execute();
```

---

## 4. Caching Strategies

### Strategy 1: In-Memory Cache for Static Data

```typescript
// cache.ts
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidate(keyPattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new SimpleCache();

// Usage in admin/stats.ts
export async function getGenreDistribution(): Promise<GenreDistribution[]> {
  const cacheKey = 'admin:genreDistribution';
  const cached = cache.get<GenreDistribution[]>(cacheKey);

  if (cached) return cached;

  const data = await fetchGenreDistribution();
  cache.set(cacheKey, data, 5 * 60 * 1000); // 5 minutes

  return data;
}
```

### Strategy 2: Request Deduplication

```typescript
// dedupe.ts
const inFlightRequests = new Map<string, Promise<any>>();

export async function dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) return existing;

  const promise = fn().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
}

// Usage
export async function getBook(id: string): Promise<Book | null> {
  return dedupe(`book:${id}`, async () => {
    const { data, error } = await supabase...;
    // ...
  });
}
```

---

## 5. End-to-End Redesign Roadmap

### Phase 1: Foundation (Week 1)

1. **Create `storage.ts`** - Extract file upload logic
2. **Create `events.ts`** - Event emitter for decoupling
3. **Add factory pattern to `supabaseClient.ts`**
4. **Set up testing infrastructure**

### Phase 2: Large Module Splits (Week 2)

1. **Split `admin.ts`** into 7 sub-modules
2. **Split `communities.ts`** into 4 sub-modules
3. **Split `borrowRequests.ts`** into 4 sub-modules

### Phase 3: Query Optimization (Week 3)

1. **Create SQL functions** for complex queries
2. **Add full-text search** for books
3. **Add pagination** to all list endpoints
4. **Replace N+1 queries** with aggregations

### Phase 4: Reliability (Week 4)

1. **Add RPC functions** for atomic operations
2. **Implement proper error types**
3. **Add retry logic** for transient failures
4. **Improve RLS policies**

### Phase 5: Shared Abstractions (Week 5)

1. **Create `Repository` base class**
2. **Add Zod validation schemas**
3. **Implement caching layer**
4. **Add request deduplication**

---

## 6. Reflection Questions

1. **The Repository pattern provides `getAll`, `getById`, `create`, `update`, `delete`. What domain-specific methods would you add for Books?**

2. **Event-based notifications decouple modules. What other events would be useful?**
   - `book:created`, `request:approved`, `user:suspended`?

3. **Splitting `admin.ts` into 7 files means 7 places to import from. How do you manage this complexity?**
   - Barrel exports? Facade pattern?

4. **The caching strategy uses TTL (time-to-live). What would you use for data that changes frequently?**

5. **The redesign roadmap is 5 weeks. How would you prioritize if you only had 2 weeks?**

---

## 7. Reading Plan for Day 6

1. **Read about Repository Pattern** (20 minutes):
   - [Martin Fowler's Repository](https://martinfowler.com/eaaCatalog/repository.html)

2. **Study one well-designed API client** (30 minutes):
   - [Stripe Node.js SDK](https://github.com/stripe/stripe-node)
   - Note: How do they handle errors? Structure modules?

3. **Sketch your ideal structure** (20 minutes):
   - Draw the folder structure after all refactors
   - List the exports from each module

**Total**: ~70 minutes

---

## 8. Key Takeaways

1. **Split large modules by domain concern** - 500+ lines is a smell

2. **Use events for cross-cutting concerns** - Notifications, analytics, logging

3. **Create shared abstractions after 3+ use cases** - Don't abstract too early

4. **Database transactions for atomic operations** - Use RPC functions

5. **Cache expensive, stable data** - Genre distributions, admin stats

6. **Incremental refactoring** - Each change should be deployable

---

## Next: Day 7

Tomorrow we'll consolidate everything into a final mental model with architecture diagrams and a best-practice checklist.
