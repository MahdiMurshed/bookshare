# Supabase Deep Dive: BookShare Database Architecture

This document covers Supabase-specific concepts used in BookShare: Row Level Security (RLS), database triggers, stored procedures, and real-time subscriptions.

---

## Table of Contents

1. [Row Level Security (RLS)](#1-row-level-security-rls)
2. [Database Functions (RPC)](#2-database-functions-rpc)
3. [Database Triggers](#3-database-triggers)
4. [Storage Policies](#4-storage-policies)
5. [Realtime Subscriptions](#5-realtime-subscriptions)
6. [Auth Configuration](#6-auth-configuration)
7. [Security Checklist](#7-security-checklist)

---

## 1. Row Level Security (RLS)

### What is RLS?

Row Level Security restricts which rows a user can see or modify at the **database level**. Even if someone bypasses your frontend, they can't access data they shouldn't.

```sql
-- Enable RLS on a table
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner
ALTER TABLE books FORCE ROW LEVEL SECURITY;
```

### The `auth.uid()` Function

Supabase provides `auth.uid()` which returns the current user's ID from their JWT token:

```sql
-- This is what auth.uid() does under the hood
SELECT NULLIF(
  current_setting('request.jwt.claims', true)::json->>'sub',
  ''
)::UUID;
```

### BookShare RLS Policies

#### Books Table

```sql
-- 1. Anyone can read books (public catalog)
CREATE POLICY "Books are viewable by everyone"
  ON books FOR SELECT
  USING (true);

-- 2. Authenticated users can create books (as themselves)
CREATE POLICY "Users can create own books"
  ON books FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND owner_id = auth.uid()
  );

-- 3. Only owners can update their books
CREATE POLICY "Users can update own books"
  ON books FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- 4. Only owners can delete their books
CREATE POLICY "Users can delete own books"
  ON books FOR DELETE
  USING (owner_id = auth.uid());
```

**Code Reference:** `books.ts:107-131` - `createBook()` relies on RLS to enforce ownership

#### Borrow Requests Table

Borrow requests are complex because they involve TWO users (owner and borrower) with different permissions:

```sql
-- 1. Participants can view their requests
CREATE POLICY "Participants can view requests"
  ON borrow_requests FOR SELECT
  USING (
    owner_id = auth.uid() OR borrower_id = auth.uid()
  );

-- 2. Authenticated users can create requests
CREATE POLICY "Users can create borrow requests"
  ON borrow_requests FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND borrower_id = auth.uid()
    AND owner_id != auth.uid()  -- Can't borrow own book
  );

-- 3. Owners can approve/deny PENDING requests
CREATE POLICY "Owners can approve pending requests"
  ON borrow_requests FOR UPDATE
  USING (
    owner_id = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    status IN ('approved', 'denied')
  );

-- 4. Borrowers can mark handover complete (approved → borrowed)
CREATE POLICY "Borrowers confirm handover"
  ON borrow_requests FOR UPDATE
  USING (
    borrower_id = auth.uid()
    AND status = 'approved'
  )
  WITH CHECK (
    status = 'borrowed'
  );

-- 5. Borrowers can initiate return (borrowed → return_initiated)
CREATE POLICY "Borrowers initiate return"
  ON borrow_requests FOR UPDATE
  USING (
    borrower_id = auth.uid()
    AND status = 'borrowed'
  )
  WITH CHECK (
    status = 'return_initiated'
  );

-- 6. Owners can mark returned
CREATE POLICY "Owners confirm return"
  ON borrow_requests FOR UPDATE
  USING (
    owner_id = auth.uid()
    AND status = 'return_initiated'
  )
  WITH CHECK (
    status = 'returned'
  );
```

**Code Reference:** `borrowRequests.ts:200-270` - State machine transitions rely on these policies

#### Messages Table

```sql
-- 1. Participants can view messages
CREATE POLICY "Request participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM borrow_requests br
      WHERE br.id = messages.borrow_request_id
      AND (br.owner_id = auth.uid() OR br.borrower_id = auth.uid())
    )
  );

-- 2. Participants can send messages
CREATE POLICY "Request participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM borrow_requests br
      WHERE br.id = borrow_request_id
      AND (br.owner_id = auth.uid() OR br.borrower_id = auth.uid())
    )
  );

-- 3. Participants can update read status
CREATE POLICY "Participants can mark messages read"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM borrow_requests br
      WHERE br.id = messages.borrow_request_id
      AND (br.owner_id = auth.uid() OR br.borrower_id = auth.uid())
    )
  )
  WITH CHECK (
    -- Can only update read flags, not content
    content = content
    AND sender_id = sender_id
  );
```

**Code Reference:** `messages.ts:58` - Recipient calculation relies on RLS protecting access

#### Notifications Table

```sql
-- 1. Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- 2. Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. No direct INSERT (use RPC function instead)
-- This prevents users from creating notifications for others
```

**Code Reference:** `notifications.ts:145-151` - Uses `create_notification_secure` RPC to bypass this restriction

#### Communities Table

```sql
-- 1. Anyone can view public communities
CREATE POLICY "Public communities are viewable"
  ON communities FOR SELECT
  USING (
    is_private = false
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = communities.id
      AND cm.user_id = auth.uid()
      AND cm.status = 'approved'
    )
  );

-- 2. Authenticated users can create communities
CREATE POLICY "Users can create communities"
  ON communities FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

-- 3. Only owners can update communities
CREATE POLICY "Owners can update communities"
  ON communities FOR UPDATE
  USING (created_by = auth.uid());

-- 4. Only owners can delete communities
CREATE POLICY "Owners can delete communities"
  ON communities FOR DELETE
  USING (created_by = auth.uid());
```

#### Admin Policies

```sql
-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    id = auth.uid()  -- Users can see themselves
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_admin = true
    )
  );

-- Admins can update any user
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (
    id = auth.uid()  -- Users can update themselves
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_admin = true
    )
  );
```

**Code Reference:** `admin.ts:646-656` - `checkIsAdmin()` uses RPC to verify status

---

## 2. Database Functions (RPC)

### Why Use RPC?

1. **Bypass RLS selectively** - SECURITY DEFINER runs with elevated privileges
2. **Atomic transactions** - Multiple operations in one transaction
3. **Complex logic** - Business rules that don't fit in simple queries

### Admin Check Function

```sql
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs as function owner, bypasses RLS
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id AND is_admin = true
  );
END;
$$;

-- Grant to authenticated users
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;
```

**Supabase Call:**
```typescript
// admin.ts:650
const { data: isAdmin } = await supabase.rpc('is_user_admin', {
  user_id: userId
});
```

### Secure Notification Creation

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
SECURITY DEFINER
AS $$
DECLARE
  v_notification notifications;
BEGIN
  -- Validate notification type
  IF p_type NOT IN ('borrow_request', 'request_approved', 'request_denied',
                    'new_message', 'book_returned', 'system') THEN
    RAISE EXCEPTION 'Invalid notification type: %', p_type;
  END IF;

  INSERT INTO notifications (user_id, type, title, message, payload)
  VALUES (p_user_id, p_type, p_title, p_message, p_payload)
  RETURNING * INTO v_notification;

  RETURN v_notification;
END;
$$;

GRANT EXECUTE ON FUNCTION create_notification_secure TO authenticated;
```

**Supabase Call:**
```typescript
// notifications.ts:145-151
const { data } = await supabase.rpc('create_notification_secure', {
  p_user_id: targetUserId,
  p_type: 'borrow_request',
  p_title: 'New Request',
  p_message: 'Someone wants to borrow your book!',
  p_payload: { book_id: bookId }
});
```

### Atomic Borrow Approval

```sql
CREATE OR REPLACE FUNCTION approve_borrow_request(
  p_request_id UUID,
  p_due_date TIMESTAMPTZ,
  p_handover_method TEXT,
  p_handover_address TEXT DEFAULT NULL,
  p_handover_datetime TIMESTAMPTZ DEFAULT NULL,
  p_response_message TEXT DEFAULT NULL
)
RETURNS borrow_requests
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request borrow_requests;
  v_book_id UUID;
BEGIN
  -- Get request and verify ownership
  SELECT * INTO v_request
  FROM borrow_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF v_request.owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to approve this request';
  END IF;

  IF v_request.status != 'pending' THEN
    RAISE EXCEPTION 'Request is not pending';
  END IF;

  -- Update book (ATOMIC - both succeed or both fail)
  UPDATE books
  SET borrowable = false
  WHERE id = v_request.book_id;

  -- Update request
  UPDATE borrow_requests
  SET
    status = 'approved',
    approved_at = NOW(),
    due_date = p_due_date,
    handover_method = p_handover_method,
    handover_address = p_handover_address,
    handover_datetime = p_handover_datetime,
    response_message = p_response_message
  WHERE id = p_request_id
  RETURNING * INTO v_request;

  RETURN v_request;
END;
$$;
```

**Why This Matters:** In the current code (`borrowRequests.ts:200-270`), the book update and request update are separate queries. If the second fails, the database is left in an inconsistent state.

### Book Search with Full-Text

```sql
-- Create search index
CREATE INDEX idx_books_search ON books
USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(author, '')));

-- Search function
CREATE OR REPLACE FUNCTION search_books(
  p_query TEXT,
  p_genre TEXT DEFAULT NULL,
  p_borrowable BOOLEAN DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS SETOF books
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM books
  WHERE
    (p_query IS NULL OR p_query = '' OR
     to_tsvector('english', coalesce(title, '') || ' ' || coalesce(author, ''))
     @@ plainto_tsquery('english', p_query))
    AND (p_genre IS NULL OR genre = p_genre)
    AND (p_borrowable IS NULL OR borrowable = p_borrowable)
  ORDER BY
    CASE WHEN p_query IS NOT NULL AND p_query != '' THEN
      ts_rank(
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(author, '')),
        plainto_tsquery('english', p_query)
      )
    ELSE 0 END DESC,
    created_at DESC
  LIMIT p_limit;
END;
$$;
```

**Current Code Uses ILIKE (slow):**
```typescript
// books.ts:68-69
query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
```

**Better with RPC:**
```typescript
const { data } = await supabase.rpc('search_books', {
  p_query: searchTerm,
  p_genre: genre,
  p_borrowable: true
});
```

---

## 3. Database Triggers

### Auto-Update Timestamps

```sql
-- Generic updated_at trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();
```

### Last Message Timestamp

```sql
-- Update borrow_request.last_message_at when message inserted
CREATE OR REPLACE FUNCTION update_last_message_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE borrow_requests
  SET
    last_message_at = NEW.created_at,
    last_message_content = LEFT(NEW.content, 100)
  WHERE id = NEW.borrow_request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_inserted
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_message_timestamp();
```

**Code Reference:** `borrowRequests.ts:439` - Sorts by `last_message_at` which relies on this trigger

### Book Borrowable Status Sync

```sql
-- Reset borrowable when borrow_request returns to 'returned'
CREATE OR REPLACE FUNCTION sync_book_borrowable_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When request is returned, make book borrowable again
  IF NEW.status = 'returned' AND OLD.status = 'return_initiated' THEN
    UPDATE books SET borrowable = true WHERE id = NEW.book_id;
  END IF;

  -- When request is approved, make book not borrowable
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE books SET borrowable = false WHERE id = NEW.book_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER borrow_request_status_changed
  AFTER UPDATE OF status ON borrow_requests
  FOR EACH ROW
  EXECUTE FUNCTION sync_book_borrowable_status();
```

### Create User Profile on Signup

```sql
-- Auto-create user profile when auth.users row is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## 4. Storage Policies

### Bucket Configuration

```sql
-- Create buckets (run in Supabase dashboard or migration)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('books', 'books', true),      -- Public read access
  ('avatars', 'avatars', true);  -- Public read access
```

### Storage RLS Policies

```sql
-- Books bucket: Public read, owner write
CREATE POLICY "Public book covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'books');

CREATE POLICY "Users can upload book covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'books'
    AND auth.uid() IS NOT NULL
    -- File path: book-covers/{bookId}-{timestamp}.{ext}
    -- Validate that user owns the book (optional, complex)
  );

CREATE POLICY "Users can update their book covers"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'books'
    AND auth.uid() IS NOT NULL
  );

-- Avatars bucket: Public read, owner write
CREATE POLICY "Public avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    -- Path starts with user's ID: avatars/{userId}-{timestamp}.{ext}
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

**Code Reference:**
- `books.ts:273-306` - `uploadBookCover()`
- `users.ts:84-123` - `uploadAvatar()`

---

## 5. Realtime Subscriptions

### How Supabase Realtime Works

1. **PostgreSQL Publications**: Tables are "published" for replication
2. **WAL (Write-Ahead Log)**: Changes are captured from the WAL
3. **WebSocket**: Clients connect and receive filtered events

### Enable Realtime on Tables

```sql
-- In Supabase dashboard or migration
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### Message Subscription

```typescript
// messages.ts:121-170
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
    async (payload) => {
      // Fetch full message with sender details
      const { data } = await supabase
        .from('messages')
        .select(`*, sender:users!sender_id (*)`)
        .eq('id', payload.new.id)
        .single();

      if (data) callback(data);
    }
  )
  .subscribe();
```

**Security Note:** The `filter` is applied client-side by Supabase Realtime. RLS still applies when the follow-up query runs.

### Notification Subscription

```typescript
// notifications.ts:190-218
const subscription = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      // No filter - relies on RLS to filter by user_id
    },
    (payload) => {
      callback(payload.new as Notification);
    }
  )
  .subscribe();
```

**Security Concern:** Without a filter, the client receives ALL notification INSERTs. You should add a filter:

```typescript
// Better approach
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'notifications',
  filter: `user_id=eq.${currentUserId}`,  // Add user filter
}, callback)
```

### Cleanup Pattern

```typescript
// Always unsubscribe to prevent memory leaks
useEffect(() => {
  let isMounted = true;

  const unsubscribe = subscribeToMessages(requestId, (message) => {
    if (!isMounted) return;
    // Handle message
  });

  return () => {
    isMounted = false;
    unsubscribe();
  };
}, [requestId]);
```

---

## 6. Auth Configuration

### Supabase Client Setup

```typescript
// supabaseClient.ts
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // Store session in localStorage
    autoRefreshToken: true,    // Auto-refresh before expiry
    detectSessionInUrl: true,  // Handle OAuth redirects
  },
});
```

### Session Persistence

Sessions are stored in `localStorage` by default:

```
Key: sb-{project-ref}-auth-token
Value: {
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "abc123...",
  "expires_at": 1234567890,
  "user": { "id": "...", "email": "..." }
}
```

### Auth State Change Listener

```typescript
// auth.ts:131-158
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }
      callback({
        id: session.user.id,
        email: session.user.email ?? '',
        user_metadata: session.user.user_metadata,
      });
    }
  );
  return () => subscription.unsubscribe();
}
```

### Auth Events

| Event | When |
|-------|------|
| `INITIAL_SESSION` | Initial load with existing session |
| `SIGNED_IN` | User signs in |
| `SIGNED_OUT` | User signs out |
| `TOKEN_REFRESHED` | Access token refreshed |
| `USER_UPDATED` | User metadata changed |
| `PASSWORD_RECOVERY` | Password reset initiated |

---

## 7. Security Checklist

### RLS

- [ ] Enable RLS on ALL tables: `ALTER TABLE x ENABLE ROW LEVEL SECURITY`
- [ ] Add `FORCE ROW LEVEL SECURITY` to prevent bypassing
- [ ] Test policies with different user roles
- [ ] Use `auth.uid()` instead of passing user IDs from client

### Storage

- [ ] Configure bucket-level RLS policies
- [ ] Validate file paths match expected patterns
- [ ] Set appropriate MIME type restrictions
- [ ] Consider file size limits

### Functions (RPC)

- [ ] Use `SECURITY DEFINER` sparingly
- [ ] Always validate inputs in functions
- [ ] Grant only to `authenticated` role (not `anon`)
- [ ] Log sensitive operations

### Realtime

- [ ] Add user-specific filters to subscriptions
- [ ] Don't trust client-provided filters for authorization
- [ ] Unsubscribe on component unmount

### Auth

- [ ] Never expose the `service_role` key
- [ ] Handle session expiration gracefully
- [ ] Validate `is_admin` server-side, not just client-side

### General

- [ ] Use transactions for multi-step operations
- [ ] Add database constraints (UNIQUE, CHECK, NOT NULL)
- [ ] Create indexes for frequently queried columns
- [ ] Monitor slow queries with `pg_stat_statements`

---

## Further Reading

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/plpgsql.html)
