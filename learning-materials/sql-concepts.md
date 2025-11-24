# SQL Concepts in BookShare

This document maps every SQL concept used in the BookShare codebase, showing both the Supabase JavaScript client syntax and the equivalent raw SQL. Use this to understand what's happening "under the hood."

---

## Table of Contents

1. [SELECT Queries](#1-select-queries)
2. [INSERT Queries](#2-insert-queries)
3. [UPDATE Queries](#3-update-queries)
4. [DELETE Queries](#4-delete-queries)
5. [WHERE Clauses & Filters](#5-where-clauses--filters)
6. [JOINs (Embedded Resources)](#6-joins-embedded-resources)
7. [Sorting & Pagination](#7-sorting--pagination)
8. [Aggregations & Counting](#8-aggregations--counting)
9. [Transactions](#9-transactions)
10. [Stored Procedures (RPC)](#10-stored-procedures-rpc)
11. [Real-time Subscriptions](#11-real-time-subscriptions)
12. [Row Level Security (RLS)](#12-row-level-security-rls)
13. [Indexes & Performance](#13-indexes--performance)
14. [Quick Reference Card](#14-quick-reference-card)

---

## 1. SELECT Queries

### Basic SELECT All

**Supabase:**
```typescript
// books.ts - getBooks()
const { data, error } = await supabase
  .from('books')
  .select('*');
```

**SQL Equivalent:**
```sql
SELECT * FROM books;
```

### SELECT with Single Row

**Supabase:**
```typescript
// books.ts - getBook()
const { data, error } = await supabase
  .from('books')
  .select('*')
  .eq('id', id)
  .single();
```

**SQL Equivalent:**
```sql
SELECT * FROM books WHERE id = 'uuid-here' LIMIT 1;
-- .single() throws error if 0 or >1 rows returned
```

### SELECT with Optional Result

**Supabase:**
```typescript
// borrowRequests.ts - checking for existing request
const { data } = await supabase
  .from('borrow_requests')
  .select('id, status')
  .eq('book_id', bookId)
  .eq('borrower_id', borrowerId)
  .maybeSingle();
```

**SQL Equivalent:**
```sql
SELECT id, status
FROM borrow_requests
WHERE book_id = 'uuid' AND borrower_id = 'uuid'
LIMIT 1;
-- .maybeSingle() returns NULL if no row (doesn't throw)
```

### SELECT Specific Columns

**Supabase:**
```typescript
const { data } = await supabase
  .from('users')
  .select('id, name, email');
```

**SQL Equivalent:**
```sql
SELECT id, name, email FROM users;
```

---

## 2. INSERT Queries

### Basic INSERT with RETURNING

**Supabase:**
```typescript
// books.ts - createBook()
const { data, error } = await supabase
  .from('books')
  .insert({
    owner_id: userId,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    borrowable: true,
  })
  .select()
  .single();
```

**SQL Equivalent:**
```sql
INSERT INTO books (owner_id, title, author, borrowable)
VALUES ('user-uuid', 'The Great Gatsby', 'F. Scott Fitzgerald', true)
RETURNING *;
```

**Key Insight:** The `.select()` after `.insert()` triggers `RETURNING *` in PostgreSQL, giving you the created row (including auto-generated `id` and `created_at`).

### Bulk INSERT

**Supabase:**
```typescript
// admin.ts - sendBroadcastNotification()
const notifications = users.map(user => ({
  user_id: user.id,
  type: 'announcement',
  title: 'System Update',
  message: 'New features available!',
}));

const { error } = await supabase
  .from('notifications')
  .insert(notifications);
```

**SQL Equivalent:**
```sql
INSERT INTO notifications (user_id, type, title, message)
VALUES
  ('user1-uuid', 'announcement', 'System Update', 'New features available!'),
  ('user2-uuid', 'announcement', 'System Update', 'New features available!'),
  ('user3-uuid', 'announcement', 'System Update', 'New features available!');
```

---

## 3. UPDATE Queries

### Basic UPDATE

**Supabase:**
```typescript
// books.ts - updateBook()
const { data, error } = await supabase
  .from('books')
  .update({ title: 'New Title', borrowable: false })
  .eq('id', bookId)
  .select()
  .single();
```

**SQL Equivalent:**
```sql
UPDATE books
SET title = 'New Title', borrowable = false, updated_at = NOW()
WHERE id = 'book-uuid'
RETURNING *;
```

### UPDATE with Multiple Conditions

**Supabase:**
```typescript
// communities.ts - updateMemberRole()
const { data, error } = await supabase
  .from('community_members')
  .update({ role: 'admin' })
  .eq('community_id', communityId)
  .eq('user_id', userId)
  .select()
  .single();
```

**SQL Equivalent:**
```sql
UPDATE community_members
SET role = 'admin'
WHERE community_id = 'comm-uuid' AND user_id = 'user-uuid'
RETURNING *;
```

### UPDATE without RETURNING

**Supabase:**
```typescript
// notifications.ts - markAllAsRead()
const { error } = await supabase
  .from('notifications')
  .update({ read: true })
  .eq('user_id', userId)
  .eq('read', false);
```

**SQL Equivalent:**
```sql
UPDATE notifications
SET read = true
WHERE user_id = 'user-uuid' AND read = false;
-- No RETURNING clause (no .select())
```

---

## 4. DELETE Queries

### Basic DELETE

**Supabase:**
```typescript
// books.ts - deleteBook()
const { error } = await supabase
  .from('books')
  .delete()
  .eq('id', bookId);
```

**SQL Equivalent:**
```sql
DELETE FROM books WHERE id = 'book-uuid';
```

### DELETE with Multiple Conditions

**Supabase:**
```typescript
// communities.ts - removeBookFromCommunity()
const { error } = await supabase
  .from('book_communities')
  .delete()
  .eq('book_id', bookId)
  .eq('community_id', communityId);
```

**SQL Equivalent:**
```sql
DELETE FROM book_communities
WHERE book_id = 'book-uuid' AND community_id = 'comm-uuid';
```

---

## 5. WHERE Clauses & Filters

### Equality: .eq()

**Supabase:**
```typescript
.eq('status', 'pending')
.eq('borrowable', true)
.eq('owner_id', userId)
```

**SQL Equivalent:**
```sql
WHERE status = 'pending'
WHERE borrowable = true
WHERE owner_id = 'user-uuid'
```

### Not Equal: .neq()

**Supabase:**
```typescript
// messages.ts - exclude own messages
.neq('sender_id', currentUserId)
```

**SQL Equivalent:**
```sql
WHERE sender_id != 'current-user-uuid'
-- or: WHERE sender_id <> 'current-user-uuid'
```

### IN Clause: .in()

**Supabase:**
```typescript
// borrowRequests.ts - check existing active requests
.in('status', ['pending', 'approved', 'borrowed'])
```

**SQL Equivalent:**
```sql
WHERE status IN ('pending', 'approved', 'borrowed')
```

### LIKE (Case-Insensitive): .ilike()

**Supabase:**
```typescript
// books.ts - search
query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
```

**SQL Equivalent:**
```sql
WHERE title ILIKE '%search-term%' OR author ILIKE '%search-term%'
-- ILIKE is PostgreSQL's case-insensitive LIKE
```

**Standard SQL (case-insensitive alternative):**
```sql
WHERE LOWER(title) LIKE LOWER('%search-term%')
   OR LOWER(author) LIKE LOWER('%search-term%')
```

### OR Logic: .or()

**Supabase:**
```typescript
// borrowRequests.ts - get user's requests (as owner or borrower)
.or(`owner_id.eq.${userId},borrower_id.eq.${userId}`)
```

**SQL Equivalent:**
```sql
WHERE owner_id = 'user-uuid' OR borrower_id = 'user-uuid'
```

### Comparison Operators: .gte(), .lte(), .gt(), .lt()

**Supabase:**
```typescript
// reviews.ts - minimum rating
.gte('rating', 4)

// admin.ts - date range
.gte('created_at', thirtyDaysAgo.toISOString())
.lt('created_at', sevenDaysAgo.toISOString())
```

**SQL Equivalent:**
```sql
WHERE rating >= 4

WHERE created_at >= '2024-01-01T00:00:00Z'
  AND created_at < '2024-01-08T00:00:00Z'
```

| Supabase | SQL | Meaning |
|----------|-----|---------|
| `.gte()` | `>=` | Greater than or equal |
| `.gt()` | `>` | Greater than |
| `.lte()` | `<=` | Less than or equal |
| `.lt()` | `<` | Less than |

### IS NULL / IS NOT NULL: .is() and .not()

**Supabase:**
```typescript
// admin.ts - get users with borrowed history
.not('borrower_id', 'is', null)
```

**SQL Equivalent:**
```sql
WHERE borrower_id IS NOT NULL
```

**For IS NULL:**
```typescript
.is('deleted_at', null)
```
```sql
WHERE deleted_at IS NULL
```

### Combined Filters (AND)

**Supabase:**
```typescript
// Multiple .eq() calls are implicitly AND
const { data } = await supabase
  .from('books')
  .select('*')
  .eq('genre', 'Fiction')
  .eq('borrowable', true)
  .gte('rating', 4);
```

**SQL Equivalent:**
```sql
SELECT * FROM books
WHERE genre = 'Fiction'
  AND borrowable = true
  AND rating >= 4;
```

---

## 6. JOINs (Embedded Resources)

Supabase uses **PostgREST's embedded resources** syntax for JOINs. The foreign key relationships are defined in the database schema.

### Basic JOIN (One-to-One / Many-to-One)

**Supabase:**
```typescript
// books.ts - getBooksWithOwners()
const { data } = await supabase
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

**SQL Equivalent:**
```sql
SELECT
  books.*,
  users.id AS owner_id,
  users.name AS owner_name,
  users.email AS owner_email,
  users.avatar_url AS owner_avatar_url
FROM books
INNER JOIN users ON books.owner_id = users.id;
```

**Result Shape:**
```json
{
  "id": "book-uuid",
  "title": "The Great Gatsby",
  "owner": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "..."
  }
}
```

### Multiple JOINs to Same Table

**Supabase:**
```typescript
// borrowRequests.ts - getActiveChats()
const { data } = await supabase
  .from('borrow_requests')
  .select(`
    *,
    book:books!book_id (id, title, author, cover_image_url),
    borrower:users!borrower_id (id, name, email, avatar_url),
    owner:users!owner_id (id, name, email, avatar_url)
  `);
```

**SQL Equivalent:**
```sql
SELECT
  br.*,
  b.id AS book_id, b.title, b.author, b.cover_image_url,
  borrower.id AS borrower_id, borrower.name AS borrower_name,
    borrower.email AS borrower_email, borrower.avatar_url AS borrower_avatar,
  owner.id AS owner_id, owner.name AS owner_name,
    owner.email AS owner_email, owner.avatar_url AS owner_avatar
FROM borrow_requests br
INNER JOIN books b ON br.book_id = b.id
INNER JOIN users borrower ON br.borrower_id = borrower.id
INNER JOIN users owner ON br.owner_id = owner.id;
```

### Nested JOINs (Three Levels Deep)

**Supabase:**
```typescript
// communities.ts - getCommunityBooks()
const { data } = await supabase
  .from('book_communities')
  .select(`
    books (
      *,
      owner:users!owner_id (id, name, email, avatar_url)
    )
  `)
  .eq('community_id', communityId);
```

**SQL Equivalent:**
```sql
SELECT
  b.*,
  u.id AS owner_id, u.name AS owner_name,
  u.email AS owner_email, u.avatar_url AS owner_avatar
FROM book_communities bc
INNER JOIN books b ON bc.book_id = b.id
INNER JOIN users u ON b.owner_id = u.id
WHERE bc.community_id = 'comm-uuid';
```

### Syntax Deep Dive

| Supabase Syntax | Meaning |
|----------------|---------|
| `table(*)` | JOIN and select all columns |
| `alias:table!foreign_key(columns)` | Aliased JOIN via specific FK |
| `table(col1, col2)` | JOIN and select specific columns |

**The `!foreign_key` syntax:**
```typescript
// When table has multiple FKs to same table, specify which one:
owner:users!owner_id (...)    // Use owner_id FK
borrower:users!borrower_id (...)  // Use borrower_id FK
```

---

## 7. Sorting & Pagination

### ORDER BY

**Supabase:**
```typescript
// books.ts - getBooks()
.order('created_at', { ascending: false })

// userSearch.ts - default ascending
.order('name')
```

**SQL Equivalent:**
```sql
ORDER BY created_at DESC

ORDER BY name ASC  -- ascending is default
```

### Multiple Sort Columns

**Supabase:**
```typescript
.order('status', { ascending: true })
.order('created_at', { ascending: false })
```

**SQL Equivalent:**
```sql
ORDER BY status ASC, created_at DESC
```

### LIMIT

**Supabase:**
```typescript
// userSearch.ts
.limit(20)
```

**SQL Equivalent:**
```sql
LIMIT 20
```

### OFFSET (Pagination)

**Supabase:**
```typescript
.range(20, 39)  // Skip first 20, get next 20
```

**SQL Equivalent:**
```sql
LIMIT 20 OFFSET 20
-- or: LIMIT 20, 20 (MySQL syntax)
```

### Complete Pagination Example

**Supabase:**
```typescript
const page = 2;
const pageSize = 10;
const from = (page - 1) * pageSize;  // 10
const to = from + pageSize - 1;       // 19

const { data, count } = await supabase
  .from('books')
  .select('*', { count: 'exact' })
  .order('created_at', { ascending: false })
  .range(from, to);
```

**SQL Equivalent:**
```sql
SELECT *, COUNT(*) OVER() AS total_count
FROM books
ORDER BY created_at DESC
LIMIT 10 OFFSET 10;
```

---

## 8. Aggregations & Counting

### COUNT

**Supabase:**
```typescript
// users.ts - getUserStats()
const { count } = await supabase
  .from('books')
  .select('*', { count: 'exact', head: true })
  .eq('owner_id', userId);
```

**SQL Equivalent:**
```sql
SELECT COUNT(*) FROM books WHERE owner_id = 'user-uuid';
```

**Options:**
- `count: 'exact'` - Exact count (slower for large tables)
- `count: 'planned'` - Estimated count (faster, uses EXPLAIN)
- `count: 'estimated'` - Uses `pg_class` statistics
- `head: true` - Don't return actual rows, just count

### COUNT with Conditions

**Supabase:**
```typescript
// admin.ts - getAdminStats()
const { count: pendingCount } = await supabase
  .from('borrow_requests')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'pending');

const { count: activeCount } = await supabase
  .from('borrow_requests')
  .select('*', { count: 'exact', head: true })
  .in('status', ['approved', 'borrowed']);
```

**SQL Equivalent:**
```sql
SELECT COUNT(*) FROM borrow_requests WHERE status = 'pending';

SELECT COUNT(*) FROM borrow_requests WHERE status IN ('approved', 'borrowed');
```

### Parallel Count Queries

**Supabase (actual pattern from admin.ts):**
```typescript
const [users, books, pending, active] = await Promise.all([
  supabase.from('users').select('*', { count: 'exact', head: true }),
  supabase.from('books').select('*', { count: 'exact', head: true }),
  supabase.from('borrow_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  supabase.from('borrow_requests').select('*', { count: 'exact', head: true }).in('status', ['approved', 'borrowed']),
]);
```

**SQL (single query alternative):**
```sql
SELECT
  (SELECT COUNT(*) FROM users) AS total_users,
  (SELECT COUNT(*) FROM books) AS total_books,
  (SELECT COUNT(*) FROM borrow_requests WHERE status = 'pending') AS pending_requests,
  (SELECT COUNT(*) FROM borrow_requests WHERE status IN ('approved', 'borrowed')) AS active_requests;
```

### AVG, SUM (via RPC)

Supabase client doesn't have built-in AVG/SUM. Use RPC:

**SQL Function:**
```sql
CREATE FUNCTION get_book_average_rating(book_uuid UUID)
RETURNS NUMERIC AS $$
  SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE book_id = book_uuid;
$$ LANGUAGE SQL;
```

**Supabase:**
```typescript
const { data } = await supabase.rpc('get_book_average_rating', {
  book_uuid: bookId
});
```

---

## 9. Transactions

Supabase client doesn't support multi-statement transactions directly. You have two options:

### Option A: Sequential Operations (Current Approach)

**Supabase (borrowRequests.ts - approveBorrowRequest):**
```typescript
// Step 1: Update book
const { error: bookError } = await supabase
  .from('books')
  .update({ borrowable: false })
  .eq('id', bookId);

if (bookError) throw bookError;

// Step 2: Update borrow request
const { data, error } = await supabase
  .from('borrow_requests')
  .update({
    status: 'approved',
    approved_at: new Date().toISOString(),
    due_date: dueDate,
  })
  .eq('id', requestId)
  .select()
  .single();
```

**Risk:** If Step 2 fails, Step 1 isn't rolled back!

### Option B: Database Transaction (RPC)

**SQL Function:**
```sql
CREATE OR REPLACE FUNCTION approve_borrow_request(
  p_request_id UUID,
  p_due_date TIMESTAMPTZ,
  p_handover_method TEXT,
  p_response_message TEXT DEFAULT NULL
)
RETURNS borrow_requests
LANGUAGE plpgsql
AS $$
DECLARE
  v_book_id UUID;
  v_request borrow_requests;
BEGIN
  -- Get book ID from request
  SELECT book_id INTO v_book_id
  FROM borrow_requests
  WHERE id = p_request_id;

  -- Update book (within transaction)
  UPDATE books
  SET borrowable = false
  WHERE id = v_book_id;

  -- Update request (within transaction)
  UPDATE borrow_requests
  SET
    status = 'approved',
    approved_at = NOW(),
    due_date = p_due_date,
    handover_method = p_handover_method,
    response_message = p_response_message
  WHERE id = p_request_id
  RETURNING * INTO v_request;

  RETURN v_request;
END;
$$;
```

**Supabase:**
```typescript
const { data, error } = await supabase.rpc('approve_borrow_request', {
  p_request_id: requestId,
  p_due_date: dueDate,
  p_handover_method: 'pickup',
  p_response_message: 'Approved!',
});
```

**Benefit:** Both operations succeed or both fail (atomicity).

---

## 10. Stored Procedures (RPC)

### Creating Notifications (SECURITY DEFINER)

**Problem:** Users shouldn't be able to INSERT notifications for other users (RLS would block it).

**Solution:** Use a SECURITY DEFINER function:

**SQL:**
```sql
CREATE OR REPLACE FUNCTION create_notification_secure(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_payload JSONB DEFAULT NULL
)
RETURNS notifications
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with function owner's privileges
AS $$
DECLARE
  v_notification notifications;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, payload)
  VALUES (p_user_id, p_type, p_title, p_message, p_payload)
  RETURNING * INTO v_notification;

  RETURN v_notification;
END;
$$;
```

**Supabase:**
```typescript
// notifications.ts - createNotification()
const { data, error } = await supabase.rpc('create_notification_secure', {
  p_user_id: targetUserId,
  p_type: 'borrow_request',
  p_title: 'New Borrow Request',
  p_message: 'Someone wants to borrow your book!',
  p_payload: { book_id: bookId },
});
```

### Admin Check Function

**SQL:**
```sql
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT is_admin FROM users WHERE id = user_id;
$$;
```

**Supabase:**
```typescript
const { data: isAdmin } = await supabase.rpc('is_user_admin', {
  user_id: userId,
});
```

---

## 11. Real-time Subscriptions

### How It Works

PostgreSQL has a feature called **LISTEN/NOTIFY**. Supabase builds on this with **Realtime** - a WebSocket service that broadcasts database changes.

### Subscribing to INSERT Events

**Supabase:**
```typescript
// messages.ts - subscribeToMessages()
const subscription = supabase
  .channel(`messages:${requestId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `borrow_request_id=eq.${requestId}`,
    },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();

// Cleanup
return () => {
  subscription.unsubscribe();
};
```

**What's Happening in PostgreSQL:**

1. Supabase creates a publication:
```sql
CREATE PUBLICATION supabase_realtime FOR TABLE messages;
```

2. When you INSERT:
```sql
INSERT INTO messages (borrow_request_id, sender_id, content)
VALUES ('req-uuid', 'user-uuid', 'Hello!');
```

3. PostgreSQL broadcasts the change via WAL (Write-Ahead Log)

4. Supabase Realtime server filters and sends to subscribed clients

### Event Types

| Event | Triggers On |
|-------|-------------|
| `INSERT` | New row created |
| `UPDATE` | Row modified |
| `DELETE` | Row removed |
| `*` | All changes |

### Filter Syntax

```typescript
filter: `column=eq.value`     // Equality
filter: `status=in.(a,b,c)`   // IN clause
filter: `amount=gt.100`       // Greater than
```

---

## 12. Row Level Security (RLS)

### What is RLS?

Row Level Security restricts which rows a user can see/modify based on policies. It's PostgreSQL's built-in authorization.

### Enabling RLS

```sql
-- Enable RLS on table
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner (recommended)
ALTER TABLE books FORCE ROW LEVEL SECURITY;
```

### Policy Examples

**1. Users can read all books:**
```sql
CREATE POLICY "Books are viewable by everyone"
ON books FOR SELECT
USING (true);
```

**2. Users can only update their own books:**
```sql
CREATE POLICY "Users can update own books"
ON books FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());
```

**3. Users can only see their own notifications:**
```sql
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());
```

**4. Admin can see all users:**
```sql
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

### auth.uid() Function

`auth.uid()` returns the current authenticated user's ID from the JWT token.

```sql
-- This is roughly what auth.uid() does:
CREATE FUNCTION auth.uid() RETURNS UUID AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::UUID;
$$ LANGUAGE SQL STABLE;
```

### RLS and Supabase Client

When you make queries via Supabase client, RLS automatically filters results:

```typescript
// This query automatically filters to only show
// books the current user can see (based on RLS policies)
const { data } = await supabase.from('books').select('*');
```

---

## 13. Indexes & Performance

### Common Index Types Used

**1. Primary Key Index (automatic):**
```sql
-- Created automatically when you define PRIMARY KEY
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
```

**2. Foreign Key Index (recommended):**
```sql
CREATE INDEX idx_books_owner_id ON books(owner_id);
CREATE INDEX idx_borrow_requests_book_id ON borrow_requests(book_id);
CREATE INDEX idx_borrow_requests_borrower_id ON borrow_requests(borrower_id);
```

**3. Composite Index for common queries:**
```sql
-- For: WHERE borrower_id = ? AND status = ?
CREATE INDEX idx_borrow_requests_borrower_status
ON borrow_requests(borrower_id, status);
```

**4. Full-Text Search Index:**
```sql
-- For: title ILIKE '%search%' OR author ILIKE '%search%'
CREATE INDEX idx_books_search ON books
USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(author, '')));
```

### Analyzing Query Performance

```sql
-- See query execution plan
EXPLAIN ANALYZE
SELECT * FROM books
WHERE owner_id = 'uuid' AND borrowable = true
ORDER BY created_at DESC;
```

**Output shows:**
- Sequential Scan vs Index Scan
- Estimated vs Actual rows
- Execution time

### N+1 Query Problem

**Bad (current pattern in admin.ts):**
```typescript
// This creates N+1 queries!
const userStats = await Promise.all(
  users.map(async (user) => {
    const { count: borrows } = await supabase
      .from('borrow_requests')
      .select('*', { count: 'exact', head: true })
      .eq('borrower_id', user.id);
    // ... more queries per user
  })
);
```

**Good (single query with aggregation):**
```sql
SELECT
  u.id,
  u.name,
  COUNT(DISTINCT br_borrow.id) as total_borrows,
  COUNT(DISTINCT br_lend.id) as total_lends
FROM users u
LEFT JOIN borrow_requests br_borrow ON br_borrow.borrower_id = u.id
LEFT JOIN borrow_requests br_lend ON br_lend.owner_id = u.id
GROUP BY u.id, u.name
ORDER BY (COUNT(DISTINCT br_borrow.id) + COUNT(DISTINCT br_lend.id)) DESC
LIMIT 10;
```

---

## 14. Quick Reference Card

### Supabase → SQL Mapping

| Supabase | SQL |
|----------|-----|
| `.from('table')` | `FROM table` |
| `.select('*')` | `SELECT *` |
| `.select('col1, col2')` | `SELECT col1, col2` |
| `.insert({...})` | `INSERT INTO ... VALUES` |
| `.update({...})` | `UPDATE ... SET` |
| `.delete()` | `DELETE FROM` |
| `.eq('col', val)` | `WHERE col = val` |
| `.neq('col', val)` | `WHERE col != val` |
| `.gt('col', val)` | `WHERE col > val` |
| `.gte('col', val)` | `WHERE col >= val` |
| `.lt('col', val)` | `WHERE col < val` |
| `.lte('col', val)` | `WHERE col <= val` |
| `.in('col', [a,b])` | `WHERE col IN (a, b)` |
| `.is('col', null)` | `WHERE col IS NULL` |
| `.not('col', 'is', null)` | `WHERE col IS NOT NULL` |
| `.ilike('col', '%x%')` | `WHERE col ILIKE '%x%'` |
| `.or('a.eq.1,b.eq.2')` | `WHERE a = 1 OR b = 2` |
| `.order('col', {ascending: false})` | `ORDER BY col DESC` |
| `.limit(n)` | `LIMIT n` |
| `.range(a, b)` | `LIMIT (b-a+1) OFFSET a` |
| `.single()` | `LIMIT 1` (throws if !=1) |
| `.maybeSingle()` | `LIMIT 1` (returns null if 0) |
| `.select().single()` after INSERT/UPDATE | `RETURNING *` |
| `{ count: 'exact', head: true }` | `SELECT COUNT(*)` |

### JOIN Syntax

| Supabase | Meaning |
|----------|---------|
| `table(*)` | INNER JOIN, all columns |
| `alias:table!fk(cols)` | INNER JOIN via FK, aliased |
| `table(col1, col2)` | INNER JOIN, specific columns |

### RPC Pattern

```typescript
// Call: supabase.rpc('function_name', { p_param: value })
// Maps to: SELECT function_name(p_param := value)
```

---

## Further Reading

### PostgreSQL Documentation
- [SELECT](https://www.postgresql.org/docs/current/sql-select.html)
- [INSERT](https://www.postgresql.org/docs/current/sql-insert.html)
- [UPDATE](https://www.postgresql.org/docs/current/sql-update.html)
- [DELETE](https://www.postgresql.org/docs/current/sql-delete.html)
- [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html)

### Supabase Documentation
- [Querying Data](https://supabase.com/docs/reference/javascript/select)
- [Realtime](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

### Practice Resources
- [SQLBolt](https://sqlbolt.com/) - Interactive SQL tutorials
- [PostgreSQL Exercises](https://pgexercises.com/) - PostgreSQL-specific practice
- [Use The Index, Luke](https://use-the-index-luke.com/) - Index optimization guide

---

## Summary

The BookShare codebase uses these SQL concepts:

1. **Basic CRUD** - SELECT, INSERT, UPDATE, DELETE with various filters
2. **JOINs** - Via Supabase's embedded resource syntax (PostgREST)
3. **Aggregations** - COUNT with exact counts
4. **Pagination** - LIMIT/OFFSET via `.range()`
5. **Full-text Search** - ILIKE patterns (could be optimized with GIN indexes)
6. **RLS** - PostgreSQL's row-level security for authorization
7. **RPC** - Stored procedures for transactions and elevated privileges
8. **Realtime** - PostgreSQL's LISTEN/NOTIFY for live updates

Understanding these patterns gives you the foundation to:
- Debug performance issues
- Write more efficient queries
- Migrate to other databases
- Implement complex features with confidence
