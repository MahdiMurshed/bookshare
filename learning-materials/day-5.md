# Day 5: Failure Modes, Security, RLS & Scalability

## Learning Objectives

By the end of today, you will:
- Identify failure cases in each module
- Understand error handling strengths and blind spots
- Know Row Level Security (RLS) implications
- Recognize Supabase auth security considerations
- Identify transactional integrity issues
- Spot scalability bottlenecks
- Know how to harden the client for production

---

## 1. Error Handling Analysis

### The Standard Pattern

Every module follows this pattern:

```typescript
const { data, error } = await supabase.from('table')...;
if (error) throw error;
return data;
```

**Strengths**:
- Consistent across codebase
- Caller can use try/catch
- Errors bubble up to UI layer

**Weaknesses**:
- No error transformation
- No retry logic
- No distinction between "not found" and "server error"

### Error Types in Supabase

| Code | Meaning | Should You Retry? |
|------|---------|-------------------|
| `PGRST116` | Row not found (`.single()` with 0 rows) | No |
| `23505` | Unique constraint violation | No |
| `23503` | Foreign key violation | No |
| `42501` | RLS policy violation | No |
| `PGRST301` | Request timeout | Yes |
| Network errors | Connection failed | Yes |

**Documentation**: [Supabase Error Handling](https://supabase.com/docs/reference/javascript/error-handling)

### Current Handling Example

```typescript
// books.ts
export async function getBook(id: string): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found - graceful
    throw error;  // Everything else - throw
  }

  return data as Book;
}
```

This is good - it distinguishes "not found" from other errors.

### Missing: Error Wrapping

The codebase throws raw Supabase errors. Consumers see implementation details:

```typescript
// What consumers currently see
try {
  await createBook(input);
} catch (error) {
  // error is a raw PostgreSQL/Supabase error
  // error.code might be '23505' (unique violation)
  // Not user-friendly
}
```

### Improvement: Custom Error Types

```typescript
// errors.ts
export class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// books.ts
export async function getBook(id: string): Promise<Book> {
  const { data, error } = await supabase...;

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Book', id);
    }
    if (error.code === '42501') {
      throw new AuthorizationError('You do not have access to this book');
    }
    throw error;
  }

  return data as Book;
}
```

---

## 2. Per-Module Failure Analysis

### auth.ts Failure Modes

| Function | Failure Case | Current Handling | Risk |
|----------|--------------|------------------|------|
| `signUp` | Email already exists | Throws Supabase error | Low - clear error |
| `signUp` | Weak password | Throws Supabase error | Low |
| `signIn` | Wrong credentials | Throws error | Low |
| `signIn` | Account suspended | **No check!** | **High** |
| `getSession` | No session | Returns null | Good |
| `onAuthStateChange` | Subscription fails | Silent | Medium |

#### Critical Issue: Suspended Users Can Sign In

```typescript
export async function signIn(credentials: SignInCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({...});
  if (error) throw error;
  return data;
  // No check if user is suspended!
}
```

**Fix**:
```typescript
export async function signIn(credentials: SignInCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({...});
  if (error) throw error;

  // Check if user is suspended
  const { data: profile } = await supabase
    .from('users')
    .select('suspended, suspended_reason')
    .eq('id', data.user.id)
    .single();

  if (profile?.suspended) {
    await supabase.auth.signOut();
    throw new Error(`Account suspended: ${profile.suspended_reason}`);
  }

  return data;
}
```

---

### borrowRequests.ts Failure Modes

| Function | Failure Case | Current Handling | Risk |
|----------|--------------|------------------|------|
| `createBorrowRequest` | Own book | No check | **Medium** |
| `createBorrowRequest` | Duplicate request | Check exists but race condition | **High** |
| `approveBorrowRequest` | Book update fails | Partial state | **Critical** |
| `markBookReturned` | Book update fails | Partial state | **Critical** |

#### Critical Issue: Non-Atomic State Updates

```typescript
export async function approveBorrowRequest(...) {
  // Step 1: Update book to not borrowable
  const { error: bookError } = await supabase
    .from('books')
    .update({ borrowable: false })
    .eq('id', borrowRequest.book_id);

  if (bookError) throw bookError;

  // Step 2: Update borrow request
  return updateBorrowRequest(id, {
    status: 'approved',
    // ...
  });
  // If this fails, book is marked not borrowable but request isn't approved!
}
```

**The Problem**: If Step 2 fails, the book is marked unavailable but the request isn't approved. Inconsistent state!

**Fix**: Use a database transaction via RPC:

```sql
CREATE FUNCTION approve_borrow_request(
  p_request_id UUID,
  p_due_date TIMESTAMPTZ,
  p_handover_method TEXT,
  p_handover_address TEXT,
  p_handover_datetime TIMESTAMPTZ,
  p_handover_instructions TEXT,
  p_response_message TEXT
)
RETURNS borrow_requests
LANGUAGE plpgsql
AS $$
DECLARE
  v_book_id UUID;
  v_request borrow_requests;
BEGIN
  -- Get book ID
  SELECT book_id INTO v_book_id FROM borrow_requests WHERE id = p_request_id;

  -- Update book (within transaction)
  UPDATE books SET borrowable = false WHERE id = v_book_id;

  -- Update request (within transaction)
  UPDATE borrow_requests
  SET status = 'approved',
      approved_at = NOW(),
      due_date = p_due_date,
      handover_method = p_handover_method,
      handover_address = p_handover_address,
      handover_datetime = p_handover_datetime,
      handover_instructions = p_handover_instructions,
      response_message = p_response_message
  WHERE id = p_request_id
  RETURNING * INTO v_request;

  RETURN v_request;
END;
$$;
```

**Documentation**: [Supabase Transactions](https://supabase.com/docs/guides/database/transactions)

---

### messages.ts Failure Modes

| Function | Failure Case | Current Handling | Risk |
|----------|--------------|------------------|------|
| `sendMessage` | Notification fails | Swallowed (console.error) | **Good!** |
| `sendMessage` | Request not found | Throws | Good |
| `subscribeToMessages` | Subscription drops | Silent | Medium |
| `getTotalUnreadCount` | N requests fail | Throws on first | Medium |

#### Good Pattern: Non-Critical Failure Handling

```typescript
// Create notification for recipient
try {
  await createNotification({...});
} catch (notifError) {
  // Don't fail the message send if notification fails
  console.error('Failed to create notification:', notifError);
}
```

This is correct! The message is the primary operation; notification is secondary.

---

## 3. Row Level Security (RLS) Analysis

### What is RLS?

Row Level Security restricts which rows users can access. Policies are defined per table:

```sql
-- Users can only see their own notifications
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());
```

**Documentation**: [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### RLS Implications Per Module

#### books.ts

**Expected Policies**:
```sql
-- Anyone can read books
CREATE POLICY "Books are viewable by everyone" ON books
FOR SELECT USING (true);

-- Only owner can update/delete
CREATE POLICY "Users can update own books" ON books
FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own books" ON books
FOR DELETE USING (owner_id = auth.uid());

-- Any authenticated user can create
CREATE POLICY "Authenticated users can create books" ON books
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

**Client Code Assumption**:
```typescript
export async function updateBook(id: string, input: UpdateBookInput) {
  const { data, error } = await supabase.from('books').update(input).eq('id', id)...;
  // Assumes RLS will block if not owner
}
```

**Risk**: If RLS isn't properly configured, any user could update any book.

---

#### notifications.ts

**The RLS Problem**:
```typescript
export async function createNotification(input: CreateNotificationInput) {
  // This tries to insert a notification for ANY user
  // RLS would normally block this!
}
```

**Solution Used**: `SECURITY DEFINER` function:
```typescript
const { data, error } = await supabase.rpc('create_notification_secure', {...});
```

This bypasses RLS because the function runs with elevated privileges.

**Documentation**: [Security Definer Functions](https://supabase.com/docs/guides/database/functions#security-definer-vs-invoker)

---

#### admin.ts

**Critical Question**: How are admin functions protected?

The code has a comment:
```typescript
/**
 * IMPORTANT: These functions should only be called by admin users.
 * Authorization is enforced at the application level by checking the
 * is_admin flag on the user.
 */
```

**This is dangerous!** Application-level checks can be bypassed. Admin functions should use:

1. **RLS with admin check**:
```sql
CREATE POLICY "Only admins can see all users" ON users
FOR SELECT USING (
  auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
);
```

2. **Or SECURITY DEFINER functions that verify admin status**:
```sql
CREATE FUNCTION admin_get_all_users()
RETURNS SETOF users
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY SELECT * FROM users;
END;
$$ LANGUAGE plpgsql;
```

---

### RLS Best Practices

1. **Enable RLS on all tables**:
   ```sql
   ALTER TABLE books ENABLE ROW LEVEL SECURITY;
   ```

2. **Default deny**: With RLS enabled and no policies, all access is denied.

3. **Test RLS policies**: Use Supabase's SQL editor with different user JWTs.

4. **Use `auth.uid()`**: This is the authenticated user's ID.

5. **Avoid client-side auth checks for sensitive operations**.

**Documentation**: [Testing RLS Policies](https://supabase.com/docs/guides/auth/row-level-security#testing-policies)

---

## 4. Authentication Security Considerations

### JWT Token Handling

Supabase uses JWT tokens. The client handles this automatically, but be aware:

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,    // Stores in localStorage
    autoRefreshToken: true,  // Refreshes before expiry
    detectSessionInUrl: true, // For OAuth callbacks
  },
});
```

**Risks**:
- `localStorage` is vulnerable to XSS attacks
- Tokens persist until explicitly cleared

**Mitigations**:
- Use `httpOnly` cookies (requires server component)
- Implement CSRF protection
- Set short token expiry with refresh tokens

**Documentation**: [Supabase Auth Configuration](https://supabase.com/docs/reference/javascript/initializing#with-additional-parameters)

---

### The Anon Key

```typescript
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

**What is this?**
- The "anon" (anonymous) key is **public**
- It's safe to expose in client-side code
- It only grants access that RLS policies allow

**What you should NOT expose**:
- The `service_role` key (bypasses all RLS)
- Database connection strings

**Documentation**: [Supabase API Keys](https://supabase.com/docs/guides/api#api-keys)

---

### Session State Inconsistencies

```typescript
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getUser();
  // ...
}
```

**Potential Issue**: `getUser()` makes a network request. In poor network conditions:
- Multiple components calling this could get inconsistent results
- Race conditions between auth state and data fetching

**Better Pattern**: Use `onAuthStateChange` for reactive auth state:
```typescript
// In a React context
const [user, setUser] = useState<AuthUser | null>(null);

useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

---

## 5. Transactional Integrity Issues

### Issue 1: Race Condition in Duplicate Prevention

```typescript
// borrowRequests.ts
const { data: existingRequest } = await supabase
  .from('borrow_requests')
  .select('id, status')
  .eq('book_id', input.book_id)
  .eq('borrower_id', user.id)
  .in('status', ['pending', 'approved'])
  .maybeSingle();

if (existingRequest) {
  throw new Error('You already have a pending request');
}

// RACE WINDOW: Another request could be created here!

const { data, error } = await supabase
  .from('borrow_requests')
  .insert({...});
```

**Fix**: Database constraint:
```sql
CREATE UNIQUE INDEX unique_active_request
ON borrow_requests (book_id, borrower_id)
WHERE status IN ('pending', 'approved');
```

---

### Issue 2: Denormalized Data Inconsistency

`borrowable` in books and `status` in borrow_requests can become out of sync:

```
Scenario:
1. approveBorrowRequest() updates books.borrowable = false
2. Network timeout before borrow_requests.status = 'approved'
3. Book shows unavailable, but no approved request exists
```

**Fix Options**:
1. **Database transactions** (shown earlier)
2. **Event sourcing**: Derive `borrowable` from borrow_requests
3. **Eventual consistency**: Background job to reconcile

---

### Issue 3: `last_message_at` Staleness

```typescript
// messages table trigger should update this, but if it doesn't:
// BorrowRequest.last_message_at could be stale
```

**Best Practice**: Use database triggers for denormalized fields:
```sql
CREATE FUNCTION update_last_message_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE borrow_requests
  SET last_message_at = NEW.created_at,
      last_message_content = NEW.content
  WHERE id = NEW.borrow_request_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_inserted
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_last_message_timestamp();
```

---

## 6. Scalability Bottlenecks

### Bottleneck 1: N+1 Queries in Admin

```typescript
// admin.ts - getMostActiveUsers()
const userStats = await Promise.all(
  users.map(async (user) => {
    const { count: totalBorrows } = await supabase...;
    const { count: totalLends } = await supabase...;
    const { count: activeRequests } = await supabase...;
    // 3 queries per user!
  })
);
```

**At 1000 users**: 3000 database round trips

**Fix**: Use SQL aggregation (see Day 3)

---

### Bottleneck 2: Unindexed Text Search

```typescript
query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
```

**At 100k books**: Full table scan on every search

**Fix**: PostgreSQL full-text search with GIN index:
```sql
CREATE INDEX books_search_idx ON books
USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(author, '')));
```

---

### Bottleneck 3: Unbounded Notifications

```typescript
export async function getMyNotifications(): Promise<Notification[]> {
  // Returns ALL notifications, no limit!
}
```

**At 10k notifications per user**: Huge payload, slow query

**Fix**: Add pagination:
```typescript
export async function getMyNotifications(
  filters?: NotificationFilters & { page?: number; pageSize?: number }
): Promise<{ data: Notification[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: data ?? [], total: count ?? 0 };
}
```

---

### Bottleneck 4: Realtime Channel Proliferation

```typescript
// Each chat creates a channel
subscribeToMessages(requestId, callback);
// User with 50 active chats = 50 WebSocket channels
```

**Fix**: Single channel with client-side filtering:
```typescript
// Subscribe to all user's messages
const subscription = supabase
  .channel(`user_messages:${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    },
    (payload) => {
      // Client filters by request ID
      const handlers = messageHandlers.get(payload.new.borrow_request_id);
      handlers?.forEach(h => h(payload.new));
    }
  )
  .subscribe();
```

---

## 7. Hardening Checklist for Production

### Security

- [ ] **Enable RLS on all tables**
- [ ] **Test RLS policies with different user roles**
- [ ] **Use SECURITY DEFINER functions for cross-user operations**
- [ ] **Validate admin status server-side, not just client-side**
- [ ] **Never expose service_role key**
- [ ] **Add rate limiting to auth endpoints** (Supabase has built-in)

### Reliability

- [ ] **Add retry logic for transient failures**
- [ ] **Use database transactions for multi-step operations**
- [ ] **Handle WebSocket disconnections gracefully**
- [ ] **Add circuit breakers for external APIs** (Google Books)

### Scalability

- [ ] **Add indexes based on query patterns**
- [ ] **Implement pagination for all list endpoints**
- [ ] **Replace N+1 queries with aggregations**
- [ ] **Use full-text search instead of ILIKE**
- [ ] **Consider connection pooling** (Supabase provides this)

### Monitoring

- [ ] **Log errors with context** (user ID, operation, params)
- [ ] **Track slow queries**
- [ ] **Monitor realtime connection count**
- [ ] **Set up alerts for error rate spikes**

**Documentation**: [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

---

## 8. Reflection Questions

1. **Why does `createNotification()` use an RPC instead of direct insert?**
   - What would fail without the RPC?

2. **The admin functions rely on application-level auth checks. Is this secure?**
   - How would you improve it?

3. **What happens if a user has 100,000 notifications and calls `getMyNotifications()`?**
   - How would you fix this?

4. **`approveBorrowRequest()` updates two tables. What could go wrong?**
   - How would you make it atomic?

5. **The anon key is in client-side code. Is this a security issue?**
   - What protects sensitive data?

---

## 9. Reading Plan for Day 5

1. **Supabase Security Docs** (30 minutes):
   - [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
   - [Security Best Practices](https://supabase.com/docs/guides/auth/managing-user-data#security)

2. **Review your RLS policies** (20 minutes):
   - Go to Supabase Dashboard → Authentication → Policies
   - Check each table has appropriate policies

3. **Find a race condition** (15 minutes):
   - Look for check-then-act patterns in the code
   - Consider what happens with concurrent requests

**Total**: ~65 minutes

---

## 10. Key Takeaways

1. **RLS is your security foundation** - Never trust client-side auth checks alone

2. **Transactions prevent inconsistent state** - Multi-table updates need atomicity

3. **Race conditions are subtle** - Check-then-act patterns are vulnerable

4. **Admin operations need server-side verification** - RLS policies or SECURITY DEFINER

5. **Pagination is required at scale** - Unbounded queries will fail

6. **Error handling should be semantic** - Wrap raw database errors

---

## Next: Day 6

Tomorrow we'll focus on refactoring opportunities and system redesign recommendations for each module.
