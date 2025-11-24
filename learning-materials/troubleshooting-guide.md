# Troubleshooting Guide: BookShare

Common errors, debugging tips, and solutions for the BookShare application.

---

## Table of Contents

1. [Error Code Reference](#1-error-code-reference)
2. [Authentication Errors](#2-authentication-errors)
3. [Database Errors](#3-database-errors)
4. [Storage Errors](#4-storage-errors)
5. [Realtime Errors](#5-realtime-errors)
6. [React Query Errors](#6-react-query-errors)
7. [Build & Development Errors](#7-build--development-errors)
8. [Debugging Techniques](#8-debugging-techniques)

---

## 1. Error Code Reference

### Supabase/PostgreSQL Error Codes

| Code | Name | Meaning | Common Cause |
|------|------|---------|--------------|
| `PGRST116` | Not Found | `.single()` returned 0 rows | Record doesn't exist or RLS blocked it |
| `PGRST301` | Timeout | Request took too long | Slow query, missing index |
| `23505` | Unique Violation | Duplicate key | Inserting duplicate record |
| `23503` | Foreign Key Violation | Referenced row missing | Invalid foreign key reference |
| `42501` | Permission Denied | RLS policy blocked | User lacks permission |
| `42P01` | Undefined Table | Table doesn't exist | Migration not run, typo |
| `22P02` | Invalid Text | Can't parse value | Wrong data type |
| `PGRST200` | JWT Expired | Token no longer valid | Session timed out |

### HTTP Status Codes

| Code | Meaning | Supabase Context |
|------|---------|------------------|
| `400` | Bad Request | Invalid query parameters |
| `401` | Unauthorized | Missing or invalid JWT |
| `403` | Forbidden | RLS denied access |
| `404` | Not Found | Resource doesn't exist |
| `406` | Not Acceptable | Accept header mismatch |
| `409` | Conflict | Unique constraint violation |
| `500` | Server Error | Database or function error |

---

## 2. Authentication Errors

### "User must be authenticated"

**Error:**
```
Error: User must be authenticated to create a book
```

**Cause:** Calling a function that requires auth without being logged in.

**Where it happens:**
- `books.ts:109` - `createBook()`
- `borrowRequests.ts:115` - `createBorrowRequest()`
- `messages.ts:35` - `sendMessage()`

**Solution:**
```typescript
// Check auth before calling
const { user } = useAuth();
if (!user) {
  navigate('/login');
  return;
}
await createBook(bookData);
```

### "Invalid login credentials"

**Error:**
```
AuthApiError: Invalid login credentials
```

**Cause:** Wrong email/password combination.

**Solution:**
1. Check email is correct
2. Check password (case-sensitive)
3. Check if user exists
4. Check if account is verified (if email confirmation enabled)

**Code Location:** `auth.ts:62-82` - `signIn()`

### "Email not confirmed"

**Error:**
```
AuthApiError: Email not confirmed
```

**Cause:** User hasn't clicked verification link.

**Solution:**
```typescript
// Resend verification email
await supabase.auth.resend({
  type: 'signup',
  email: userEmail,
});
```

### Session Expired / Token Refresh Failed

**Error:**
```
AuthSessionMissingError: Auth session missing!
```

**Cause:**
- Session expired and couldn't refresh
- localStorage was cleared
- Cookies blocked

**Solution:**
```typescript
// In AuthContext, handle session loss
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      // Session refreshed successfully
    }
    if (event === 'SIGNED_OUT') {
      // Redirect to login
      navigate('/login');
    }
  }
);
```

### "User already registered"

**Error:**
```
AuthApiError: User already registered
```

**Cause:** Email already has an account.

**Solution:** Direct user to login or password reset.

---

## 3. Database Errors

### PGRST116 - Record Not Found

**Error:**
```
PostgrestError: JSON object requested, multiple (or no) rows returned
```

**Cause:** `.single()` used but 0 or 2+ rows returned.

**Where it happens:**
- `books.ts:92` - `getBook()`
- `users.ts:50` - `getUserProfile()`

**Current handling:**
```typescript
// books.ts:91-94
if (error) {
  if (error.code === 'PGRST116') return null;  // Graceful null return
  throw error;
}
```

**Solution:** Use `.maybeSingle()` for optional results:
```typescript
const { data, error } = await supabase
  .from('books')
  .select('*')
  .eq('id', id)
  .maybeSingle();  // Returns null if not found, no error
```

### 42501 - Permission Denied (RLS)

**Error:**
```
PostgrestError: new row violates row-level security policy for table "books"
```

**Cause:** RLS policy blocked the operation.

**Common scenarios:**
1. Updating someone else's book
2. Deleting someone else's review
3. Inserting with wrong `owner_id`

**Debugging:**
```sql
-- In Supabase SQL editor, test as specific user
SET request.jwt.claims = '{"sub": "user-uuid-here"}';
SELECT * FROM books WHERE id = 'book-id';
```

**Solution:**
```typescript
// communities.ts:291-298 - Example handling
if (error.code === '42501') {
  throw new Error('Permission denied: You do not have access to modify this resource');
}
```

### 23505 - Unique Constraint Violation

**Error:**
```
PostgrestError: duplicate key value violates unique constraint "books_isbn_key"
```

**Cause:** Inserting duplicate value in unique column.

**Common in BookShare:**
- Duplicate borrow request (same user + book + status)
- Duplicate community membership
- Duplicate book ISBN

**Current handling:**
```typescript
// borrowRequests.ts:125-140
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

### 23503 - Foreign Key Violation

**Error:**
```
PostgrestError: insert or update on table "borrow_requests" violates foreign key constraint "borrow_requests_book_id_fkey"
```

**Cause:** Referenced record doesn't exist.

**Scenarios:**
- Creating request for deleted book
- Joining non-existent community

**Solution:** Check existence first or handle gracefully:
```typescript
const book = await getBook(bookId);
if (!book) {
  throw new Error('Book not found or has been deleted');
}
```

### Slow Queries / Timeout

**Error:**
```
PostgrestError: canceling statement due to statement timeout
```

**Cause:** Query took too long (default 8 seconds in Supabase).

**Common causes in BookShare:**
1. `ILIKE` search without index (`books.ts:68-69`)
2. N+1 queries in admin stats (`admin.ts:800-900`)
3. Missing foreign key indexes

**Debugging:**
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- Analyze specific query
EXPLAIN ANALYZE
SELECT * FROM books WHERE title ILIKE '%search%';
```

**Solution:**
```sql
-- Add GIN index for text search
CREATE INDEX idx_books_title_trgm ON books USING gin(title gin_trgm_ops);
```

---

## 4. Storage Errors

### "The resource already exists"

**Error:**
```
StorageError: The resource already exists
```

**Cause:** Uploading to existing path without `upsert: true`.

**Current handling:**
```typescript
// books.ts:285-290
const { error: uploadError } = await supabase.storage
  .from('books')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,  // This prevents the error
  });
```

### "Bucket not found"

**Error:**
```
StorageError: Bucket not found
```

**Cause:** Bucket doesn't exist in Supabase project.

**Solution:** Create bucket in Supabase dashboard or via migration:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('books', 'books', true);
```

### "Invalid mime type"

**Error:**
```
StorageError: mime type image/webp is not supported
```

**Cause:** Uploading unsupported file type.

**Solution:** Validate before upload:
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error(`File type ${file.type} is not supported`);
}
```

### File Upload Fails Silently

**Symptom:** No error, but file doesn't appear.

**Causes:**
1. Storage RLS policy blocking
2. File path too long (max 1024 chars)
3. File too large

**Debugging:**
```typescript
const { data, error } = await supabase.storage
  .from('books')
  .upload(filePath, file);

console.log('Upload result:', { data, error });
// If data is null and no error, check RLS policies
```

---

## 5. Realtime Errors

### "Subscription failed"

**Error:**
```
RealtimeError: Subscription failed
```

**Causes:**
1. Table not in realtime publication
2. Invalid filter syntax
3. Network issues

**Solution:**
```sql
-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### Messages Not Appearing in Real-time

**Symptom:** New messages don't appear until page refresh.

**Debugging steps:**
1. Check subscription is active:
```typescript
const subscription = supabase
  .channel('debug-messages')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' },
    (payload) => console.log('Realtime payload:', payload)
  )
  .subscribe((status) => console.log('Subscription status:', status));
```

2. Check filter syntax:
```typescript
// Wrong: filter is case-sensitive
filter: `borrow_request_id=EQ.${id}`  // Wrong!

// Correct:
filter: `borrow_request_id=eq.${id}`
```

3. Verify RLS allows the query:
```sql
-- Test if user can see the message
SET request.jwt.claims = '{"sub": "user-id"}';
SELECT * FROM messages WHERE borrow_request_id = 'request-id';
```

### Memory Leak Warning

**Error:**
```
Warning: Can't perform a React state update on an unmounted component
```

**Cause:** Realtime callback updates state after unmount.

**Solution:**
```typescript
// useMessageSubscription.ts:59-89
useEffect(() => {
  if (!requestId) return;

  let isMounted = true;  // Track mount state

  const unsubscribe = subscribeToMessages(requestId, (message) => {
    if (!isMounted) return;  // Don't update if unmounted
    // Update state...
  });

  return () => {
    isMounted = false;
    unsubscribe();
  };
}, [requestId]);
```

---

## 6. React Query Errors

### "No QueryClient set"

**Error:**
```
Error: No QueryClient set, use QueryClientProvider to set one
```

**Cause:** Using `useQuery` outside of `QueryClientProvider`.

**Solution:** Wrap app in provider:
```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Stale Data After Mutation

**Symptom:** UI doesn't update after creating/updating data.

**Cause:** Query cache not invalidated.

**Solution:**
```typescript
// useBooks.ts - proper invalidation
export function useCreateBook(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      // Invalidate and refetch
      if (userId) {
        queryClient.invalidateQueries({ queryKey: bookKeys.list(userId) });
      }
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
    },
  });
}
```

### Infinite Loading State

**Symptom:** `isLoading` stays true forever.

**Causes:**
1. Query function throws before Supabase call
2. `enabled: false` and never becomes true
3. Network request hanging

**Debugging:**
```typescript
const { data, isLoading, error, status, fetchStatus } = useQuery({
  queryKey: ['books'],
  queryFn: getBooks,
});

console.log({ isLoading, status, fetchStatus, error });
// status: 'loading' | 'error' | 'success'
// fetchStatus: 'fetching' | 'paused' | 'idle'
```

### Query Key Mismatch

**Symptom:** Invalidation doesn't trigger refetch.

**Cause:** Query keys don't match exactly.

**Solution:** Use query key factories:
```typescript
// hooks/useBooks.ts
export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (userId: string) => [...bookKeys.lists(), userId] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
};

// Then use consistently:
useQuery({ queryKey: bookKeys.list(userId), ... });
queryClient.invalidateQueries({ queryKey: bookKeys.list(userId) });
```

---

## 7. Build & Development Errors

### "Module not found"

**Error:**
```
Error: Cannot find module '@repo/api-client'
```

**Cause:** Package not built or not linked.

**Solution:**
```bash
# Build all packages
pnpm build

# Or build specific package
pnpm --filter @repo/api-client build
```

### TypeScript Errors in api-client

**Error:**
```
error TS2307: Cannot find module './types.js'
```

**Cause:** TypeScript expects `.js` extensions for ESM.

**Solution:** Ensure imports use `.js` extension:
```typescript
// Wrong
import { Book } from './types';

// Correct (for ESM)
import { Book } from './types.js';
```

### Vite HMR Not Working

**Symptom:** Changes don't reflect without full refresh.

**Causes:**
1. Circular dependencies
2. Non-exported components
3. Side effects in modules

**Debugging:**
```bash
# Check for circular deps
npx madge --circular src/
```

### Environment Variables Not Loading

**Error:**
```
Error: Missing VITE_SUPABASE_URL environment variable
```

**Solution:**
1. Check `.env.local` exists in `apps/web/`
2. Prefix with `VITE_`:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
3. Restart Vite dev server

### Turbo Cache Issues

**Symptom:** Changes not appearing, old errors persisting.

**Solution:**
```bash
# Clear turbo cache
pnpm turbo clean

# Or manually
rm -rf .turbo node_modules/.cache
```

---

## 8. Debugging Techniques

### Supabase Query Debugging

```typescript
// Add to any query to see the generated SQL
const { data, error, status, statusText } = await supabase
  .from('books')
  .select('*')
  .eq('id', id);

// Log full response
console.log('Query response:', {
  data,
  error,
  status,      // HTTP status code
  statusText,  // HTTP status text
});
```

### Network Request Inspection

1. Open Browser DevTools → Network tab
2. Filter by "supabase" or your project URL
3. Check request/response headers and body

### RLS Policy Testing

```sql
-- In Supabase SQL Editor

-- 1. Set the user context
SET request.jwt.claims = '{"sub": "user-uuid-here"}';

-- 2. Run your query
SELECT * FROM books WHERE owner_id = 'some-id';

-- 3. Check if RLS is blocking
-- If fewer rows than expected, RLS is filtering
```

### React Query DevTools

```tsx
// Add to your app for visual debugging
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Error Boundary Setup

```tsx
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 text-red-800 rounded">
          <h2>Something went wrong</h2>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### Logging Best Practices

```typescript
// lib/utils/errors.ts

export function logError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) {
    console.error(`[${context || 'Error'}]:`, error);

    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
  // In production, send to error tracking service
}

// Usage
try {
  await someOperation();
} catch (error) {
  logError(error, 'createBook');
  throw error;
}
```

### Common Debug Checklist

1. **Check the browser console** for errors
2. **Check the Network tab** for failed requests
3. **Check Supabase logs** in dashboard → Logs
4. **Check RLS policies** are correct
5. **Check query keys** match for invalidation
6. **Check auth state** with `supabase.auth.getUser()`
7. **Clear caches** (Turbo, browser, React Query)
8. **Check environment variables** are set

---

## Quick Fixes Reference

| Problem | Quick Fix |
|---------|-----------|
| "User must be authenticated" | Check `useAuth()` returns user before calling |
| PGRST116 | Use `.maybeSingle()` instead of `.single()` |
| 42501 Permission Denied | Check RLS policies, verify user owns resource |
| Stale data after mutation | Add `queryClient.invalidateQueries()` in `onSuccess` |
| Realtime not working | Verify table in publication, check filter syntax |
| File upload fails | Check bucket exists, RLS allows, file type valid |
| Query loading forever | Check `enabled` condition, add error handling |
| Build fails | Run `pnpm build` from root, clear turbo cache |

---

## Getting Help

1. **Supabase Docs**: https://supabase.com/docs
2. **Supabase Discord**: https://discord.supabase.com
3. **React Query Docs**: https://tanstack.com/query/latest/docs
4. **Project Issues**: Check existing issues or create new one
