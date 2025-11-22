# Day 3: Query Design & Best Practices

## Learning Objectives

By the end of today, you will:
- Understand every query pattern used in the api-client
- Know which Supabase operators are used and why
- Recognize performance implications and indexing needs
- Identify queries that could be optimized or rewritten
- Understand when to use RPC functions vs client-side queries

---

## 1. Supabase Query Fundamentals

Before analyzing individual queries, let's understand the core operators you'll see:

### Basic Operators

| Operator | SQL Equivalent | Example |
|----------|----------------|---------|
| `select('*')` | `SELECT *` | Fetch all columns |
| `select('id, name')` | `SELECT id, name` | Fetch specific columns |
| `eq('col', val)` | `WHERE col = val` | Equality |
| `neq('col', val)` | `WHERE col != val` | Not equal |
| `gt/gte/lt/lte` | `> / >= / < / <=` | Comparisons |
| `in('col', [])` | `WHERE col IN (...)` | Multiple values |
| `is('col', null)` | `WHERE col IS NULL` | Null check |
| `not('col', 'is', null)` | `WHERE col IS NOT NULL` | Not null |
| `ilike('col', '%x%')` | `WHERE col ILIKE '%x%'` | Case-insensitive search |
| `or('a.eq.1,b.eq.2')` | `WHERE a=1 OR b=2` | OR conditions |

**Documentation**: [Supabase Filtering](https://supabase.com/docs/reference/javascript/using-filters)

### Join Syntax

```typescript
.select(`
  *,
  owner:users!owner_id (id, name, email)
`)
```

This is PostgREST's embedded resource syntax:
- `owner:` - alias for the joined data
- `users` - the table to join
- `!owner_id` - the foreign key column
- `(id, name, email)` - columns to select from joined table

**Documentation**: [Supabase Joins](https://supabase.com/docs/reference/javascript/select#query-foreign-tables)

### Aggregation

```typescript
.select('*', { count: 'exact', head: true })
```

- `count: 'exact'` - Return exact row count
- `head: true` - Don't return data, only count (like `SELECT COUNT(*)`)

**Documentation**: [Supabase Count](https://supabase.com/docs/reference/javascript/select#counting-rows)

---

## 2. Per-Query Analysis: books.ts

### Query 1: getBooks()

```typescript
let query = supabase.from('books').select('*');

if (filters?.genre) {
  query = query.eq('genre', filters.genre);
}
if (filters?.borrowable !== undefined) {
  query = query.eq('borrowable', filters.borrowable);
}
if (filters?.owner_id) {
  query = query.eq('owner_id', filters.owner_id);
}
if (filters?.search) {
  query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
}

const { data, error } = await query.order('created_at', { ascending: false });
```

#### Analysis

| Aspect | Assessment |
|--------|------------|
| **What it does** | Fetches books with optional filtering |
| **Why this structure** | Conditional filter building allows flexible queries |
| **Optimal?** | Yes for current scale |
| **Index needs** | `(genre)`, `(borrowable)`, `(owner_id)`, `(created_at DESC)` |

#### Performance Notes

1. **`ilike` is slow** - Full table scan for text search. At scale, use PostgreSQL full-text search or a search service.

2. **`or()` with `ilike`** - Combines two slow operations. Consider:
   ```sql
   CREATE INDEX books_search_idx ON books USING gin(to_tsvector('english', title || ' ' || author));
   ```

#### Better Alternative at Scale

Create a PostgreSQL function:
```sql
CREATE FUNCTION search_books(search_term TEXT)
RETURNS SETOF books AS $$
  SELECT * FROM books
  WHERE to_tsvector('english', title || ' ' || author) @@ plainto_tsquery('english', search_term)
  ORDER BY created_at DESC;
$$ LANGUAGE SQL;
```

Then call via RPC:
```typescript
const { data } = await supabase.rpc('search_books', { search_term: filters.search });
```

**Documentation**: [Supabase Full-Text Search](https://supabase.com/docs/guides/database/full-text-search)

---

### Query 2: getBooksWithOwners()

```typescript
let query = supabase
  .from('books')
  .select(`
    *,
    owner:users!owner_id (
      id,
      name,
      email,
      avatar_url
    )
  `);
```

#### Analysis

| Aspect | Assessment |
|--------|------------|
| **What it does** | Fetches books with owner profile embedded |
| **Why this structure** | Single query instead of N+1 |
| **Optimal?** | Yes - PostgREST handles the join efficiently |
| **Index needs** | `books.owner_id` (foreign key index) |

#### How It Works

PostgREST translates this to:
```sql
SELECT books.*,
  (SELECT row_to_json(u) FROM (SELECT id, name, email, avatar_url FROM users WHERE id = books.owner_id) u) as owner
FROM books;
```

This is a **correlated subquery**, not a true JOIN, but PostgreSQL optimizes it well with indexes.

---

### Query 3: getBook() - Single Item

```typescript
const { data, error } = await supabase
  .from('books')
  .select('*')
  .eq('id', id)
  .single();

if (error) {
  if (error.code === 'PGRST116') return null; // Not found
  throw error;
}
```

#### Analysis

| Aspect | Assessment |
|--------|------------|
| **What it does** | Fetches single book by ID |
| **`.single()` behavior** | Expects exactly one row; error if 0 or 2+ |
| **Error code PGRST116** | "JSON object requested, multiple (or no) rows returned" |

**Documentation**: [Supabase .single()](https://supabase.com/docs/reference/javascript/single)

#### Alternative: .maybeSingle()

```typescript
const { data, error } = await supabase
  .from('books')
  .select('*')
  .eq('id', id)
  .maybeSingle();  // Returns null instead of error if not found
```

**Documentation**: [Supabase .maybeSingle()](https://supabase.com/docs/reference/javascript/maybesingle)

---

## 3. Per-Query Analysis: borrowRequests.ts

### Query 4: createBorrowRequest() - Upsert Prevention

```typescript
// Check for existing pending or approved request
const { data: existingRequest } = await supabase
  .from('borrow_requests')
  .select('id, status')
  .eq('book_id', input.book_id)
  .eq('borrower_id', user.id)
  .in('status', ['pending', 'approved'])
  .maybeSingle();

if (existingRequest) {
  throw new Error('You already have a pending request for this book');
}
```

#### Analysis

| Aspect | Assessment |
|--------|------------|
| **What it does** | Prevents duplicate requests |
| **Race condition?** | Yes - two requests could pass check simultaneously |
| **Better approach** | Database constraint or serializable transaction |

#### Better Alternative

Use a unique partial index:
```sql
CREATE UNIQUE INDEX unique_active_request
ON borrow_requests (book_id, borrower_id)
WHERE status IN ('pending', 'approved');
```

Then catch the constraint violation:
```typescript
const { error } = await supabase.from('borrow_requests').insert({...});
if (error?.code === '23505') {  // unique_violation
  throw new Error('You already have a pending request for this book');
}
```

---

### Query 5: getActiveChats()

```typescript
const { data, error } = await supabase
  .from('borrow_requests')
  .select(`
    *,
    book:books!book_id (...),
    borrower:users!borrower_id (...),
    owner:users!owner_id (...)
  `)
  .or(`owner_id.eq.${user.id},borrower_id.eq.${user.id}`)
  .not('last_message_at', 'is', null)
  .order('last_message_at', { ascending: false });
```

#### Analysis

| Aspect | Assessment |
|--------|------------|
| **What it does** | Gets all chat-enabled requests for current user |
| **Triple join** | Fetches book, borrower, AND owner in one query |
| **`not(..., 'is', null)`** | Filters to only requests with messages |
| **Index needs** | `(owner_id)`, `(borrower_id)`, `(last_message_at DESC)` |

#### The `or()` Syntax

```typescript
.or(`owner_id.eq.${user.id},borrower_id.eq.${user.id}`)
```

This is PostgREST filter syntax. Translates to:
```sql
WHERE owner_id = :user_id OR borrower_id = :user_id
```

**Documentation**: [Supabase .or()](https://supabase.com/docs/reference/javascript/or)

---

## 4. Per-Query Analysis: messages.ts

### Query 6: getTotalUnreadCount() - Optimized N+1 Prevention

```typescript
// Get all requests where user is involved
const { data: requests } = await supabase
  .from('borrow_requests')
  .select('id, owner_id, borrower_id')
  .or(`owner_id.eq.${user.id},borrower_id.eq.${user.id}`);

// Split by role
const ownerRequestIds = requests.filter(r => r.owner_id === user.id).map(r => r.id);
const borrowerRequestIds = requests.filter(r => r.borrower_id === user.id).map(r => r.id);

// Batch query for owner role
if (ownerRequestIds.length > 0) {
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('borrow_request_id', ownerRequestIds)
    .eq('read_by_owner', false)
    .neq('sender_id', user.id);
  totalUnread += count || 0;
}

// Similar for borrower role...
```

#### Analysis

| Aspect | Assessment |
|--------|------------|
| **What it does** | Counts all unread messages across all chats |
| **Why split by role?** | `read_by_owner` vs `read_by_borrower` fields |
| **N+1 avoided?** | Yes - only 3 queries regardless of chat count |

#### Why This Is Smart

The naive approach would be:
```typescript
// BAD: N+1 queries
for (const request of requests) {
  const count = await getUnreadMessageCount(request.id);  // 1 query each
}
```

The current approach batches into 3 queries total:
1. Get all request IDs
2. Count unread where user is owner
3. Count unread where user is borrower

#### Even Better: Single Query with RPC

```sql
CREATE FUNCTION get_total_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM messages m
  JOIN borrow_requests br ON m.borrow_request_id = br.id
  WHERE m.sender_id != p_user_id
    AND (
      (br.owner_id = p_user_id AND m.read_by_owner = false) OR
      (br.borrower_id = p_user_id AND m.read_by_borrower = false)
    );
$$ LANGUAGE SQL;
```

**Documentation**: [Supabase RPC](https://supabase.com/docs/reference/javascript/rpc)

---

## 5. Per-Query Analysis: notifications.ts

### Query 7: createNotification() - RPC for RLS Bypass

```typescript
const { data, error } = await supabase.rpc('create_notification_secure', {
  p_user_id: input.user_id,
  p_type: input.type,
  p_title: input.title,
  p_message: input.message,
  p_payload: input.payload || null,
});
```

#### Analysis

| Aspect | Assessment |
|--------|------------|
| **What it does** | Creates notification via secure function |
| **Why RPC?** | Bypasses Row Level Security |
| **When needed?** | Creating notifications for OTHER users |

#### The RLS Problem

With RLS, users can only insert rows for themselves:
```sql
CREATE POLICY "Users can insert own notifications"
ON notifications FOR INSERT
WITH CHECK (user_id = auth.uid());
```

But when User A sends a message, User B needs a notification. User A can't insert a row with `user_id = B`.

#### The Solution: SECURITY DEFINER Function

```sql
CREATE FUNCTION create_notification_secure(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_payload JSONB DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER  -- Runs with function creator's permissions
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, payload)
  VALUES (p_user_id, p_type, p_title, p_message, p_payload)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;
```

**Documentation**: [Supabase Security Definer Functions](https://supabase.com/docs/guides/database/functions#security-definer-vs-invoker)

---

### Query 8: subscribeToNotifications() - Realtime

```typescript
const subscription = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
    },
    (payload) => {
      callback(payload.new as Notification);
    }
  )
  .subscribe();
```

#### Analysis

| Aspect | Assessment |
|--------|------------|
| **What it does** | Subscribes to new notification inserts |
| **Channel name** | 'notifications' (arbitrary identifier) |
| **Event types** | INSERT, UPDATE, DELETE, or * |
| **Filter missing!** | Should filter by `user_id` |

#### Security Issue

This subscribes to ALL notification inserts, not just the current user's. The callback receives notifications for everyone!

#### Better Implementation

```typescript
const subscription = supabase
  .channel(`notifications:${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,  // Add filter!
    },
    (payload) => {
      callback(payload.new as Notification);
    }
  )
  .subscribe();
```

**Documentation**: [Supabase Realtime Filters](https://supabase.com/docs/guides/realtime/postgres-changes#available-filters)

---

## 6. Per-Query Analysis: admin.ts

### Query 9: getAdminStats() - Multiple Count Queries

```typescript
const { count: totalUsers } = await supabase
  .from('users').select('*', { count: 'exact', head: true });

const { count: totalBooks } = await supabase
  .from('books').select('*', { count: 'exact', head: true });

const { count: activeBorrows } = await supabase
  .from('borrow_requests').select('*', { count: 'exact', head: true })
  .eq('status', 'borrowed');

// ... more counts
```

#### Analysis

| Aspect | Assessment |
|--------|------------|
| **What it does** | Gets dashboard statistics |
| **Query count** | 7 separate queries |
| **Parallelizable?** | Yes - could use Promise.all |
| **Better approach** | Single SQL query or materialized view |

#### Optimized Version

```typescript
// Run all counts in parallel
const [users, books, communities, activeBorrows, pending, total, completed] =
  await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('books').select('*', { count: 'exact', head: true }),
    // ... etc
  ]);
```

#### Even Better: Single Query

```sql
CREATE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM books) as total_books,
  (SELECT COUNT(*) FROM communities) as total_communities,
  (SELECT COUNT(*) FROM borrow_requests WHERE status = 'borrowed') as active_borrows,
  (SELECT COUNT(*) FROM borrow_requests WHERE status = 'pending') as pending_requests,
  (SELECT COUNT(*) FROM borrow_requests) as total_requests,
  (SELECT COUNT(*) FROM borrow_requests WHERE status = 'returned') as completed_borrows;
```

Then:
```typescript
const { data } = await supabase.from('admin_stats').select('*').single();
```

---

### Query 10: getMostActiveUsers() - N+1 Problem

```typescript
const userStats = await Promise.all(
  users.map(async (user) => {
    const { count: totalBorrows } = await supabase
      .from('borrow_requests')
      .select('*', { count: 'exact', head: true })
      .eq('borrower_id', user.id);

    const { count: totalLends } = await supabase
      .from('borrow_requests')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id);

    // ... more counts per user
  })
);
```

#### Analysis

| Aspect | Assessment |
|--------|------------|
| **What it does** | Gets activity stats per user |
| **Query count** | 3N queries for N users |
| **With 100 users** | 300 database round trips! |
| **Optimal?** | No - classic N+1 problem |

#### Better: Single Aggregation Query

```sql
CREATE VIEW user_activity_stats AS
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
LEFT JOIN borrow_requests br_active ON (br_active.owner_id = u.id OR br_active.borrower_id = u.id)
  AND br_active.status IN ('pending', 'approved', 'borrowed')
GROUP BY u.id
ORDER BY (COUNT(DISTINCT br_borrow.id) + COUNT(DISTINCT br_lend.id)) DESC;
```

---

## 7. Query Pattern Summary

### Patterns Used Well

| Pattern | Example | Why It's Good |
|---------|---------|---------------|
| Conditional building | `getBooks()` filters | Clean, readable |
| Embedded resources | `getBooksWithOwners()` | Avoids N+1 |
| Count with head:true | `getAdminStats()` | Efficient counting |
| RPC for RLS bypass | `createNotification()` | Secure cross-user ops |

### Patterns Needing Improvement

| Pattern | Example | Problem | Solution |
|---------|---------|---------|----------|
| N+1 in loops | `getMostActiveUsers()` | 3N queries | SQL aggregation |
| `ilike` search | `getBooks()` search | Full table scan | Full-text search |
| Unfiltered realtime | `subscribeToNotifications()` | Security leak | Add filter |
| Sequential counts | `getAdminStats()` | 7 queries | Promise.all or view |

---

## 8. Indexing Recommendations

Based on query analysis, these indexes should exist:

```sql
-- books.ts queries
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_borrowable ON books(borrowable);
CREATE INDEX idx_books_owner_id ON books(owner_id);
CREATE INDEX idx_books_created_at ON books(created_at DESC);

-- borrowRequests.ts queries
CREATE INDEX idx_borrow_requests_book_id ON borrow_requests(book_id);
CREATE INDEX idx_borrow_requests_borrower_id ON borrow_requests(borrower_id);
CREATE INDEX idx_borrow_requests_owner_id ON borrow_requests(owner_id);
CREATE INDEX idx_borrow_requests_status ON borrow_requests(status);
CREATE INDEX idx_borrow_requests_last_message ON borrow_requests(last_message_at DESC);

-- messages.ts queries
CREATE INDEX idx_messages_request_id ON messages(borrow_request_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- notifications.ts queries
CREATE INDEX idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

**Documentation**: [Supabase Indexes](https://supabase.com/docs/guides/database/postgres/indexes)

---

## 9. Reflection Questions

1. **Why does `getBooks()` use string interpolation in `.or()` instead of parameterized queries?**
   - Is this safe? (Hint: Read the comment in the code)

2. **The `getMostActiveUsers()` function has an N+1 problem. Why wasn't this caught earlier?**
   - When would it become noticeable?

3. **`subscribeToNotifications()` doesn't filter by user_id. What are the security implications?**
   - What data could leak?

4. **When would you use `.single()` vs `.maybeSingle()`?**
   - What errors does each throw?

5. **The `createNotification()` uses RPC. Could you achieve the same with RLS policies?**
   - What would the policy look like?

---

## 10. Reading Plan for Day 3

1. **Read the queries in `admin.ts`** (30 minutes) - Focus on the analytics functions.

2. **Supabase Documentation** (30 minutes):
   - [Filtering](https://supabase.com/docs/reference/javascript/using-filters)
   - [Realtime](https://supabase.com/docs/guides/realtime/postgres-changes)
   - [RPC Functions](https://supabase.com/docs/reference/javascript/rpc)

3. **Experiment** (20 minutes): Open your Supabase dashboard's SQL editor and run:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM books WHERE genre = 'Fiction';
   ```
   Compare with and without an index.

**Total**: ~80 minutes

---

## 11. Key Takeaways

1. **Supabase uses PostgREST** - Understanding the filter syntax is crucial.

2. **Embedded resources prevent N+1** - Use `select('*, relation:table!fk_col (...)'))`.

3. **RPC bypasses RLS** - Use for cross-user operations.

4. **Realtime needs filters** - Always filter subscriptions by user.

5. **Count queries are cheap** - `{ count: 'exact', head: true }` doesn't fetch data.

6. **Promise.all for parallel queries** - Don't await sequentially.

---

## Next: Day 4

Tomorrow we'll analyze the internal architecture of each module - responsibilities, dependencies, and patterns.
