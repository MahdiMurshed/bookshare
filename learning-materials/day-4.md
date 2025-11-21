# Day 4: Internal Architecture & Abstractions

## Learning Objectives

By the end of today, you will:
- Understand the responsibility of each module
- Recognize architectural patterns (implicit and explicit)
- Identify dependencies and coupling between modules
- Spot weak points and anti-patterns
- Know how to improve each module's architecture

---

## 1. Architecture Overview: Module Responsibilities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INFRASTRUCTURE LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  supabaseClient.ts    Creates the single Supabase client instance           │
│  types.ts             Defines all shared TypeScript interfaces              │
│  index.ts             Barrel export - defines public API surface            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            DOMAIN LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  auth.ts              Authentication operations                              │
│  books.ts             Book CRUD and queries                                  │
│  users.ts             User profile management                                │
│  userSearch.ts        User discovery                                         │
│  reviews.ts           Book review management                                 │
│  borrowRequests.ts    Borrow workflow state machine                         │
│  messages.ts          Chat messaging                                         │
│  notifications.ts     User notifications                                     │
│  communities.ts       Community management                                   │
│  admin.ts             Admin dashboard operations                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  bookSearch.ts        Google Books API integration                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Per-Module Analysis

### Module 1: supabaseClient.ts

**Lines**: 36
**Responsibility**: Single point of backend connection

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL...');
if (!supabaseAnonKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

#### Architectural Assessment

| Aspect | Assessment |
|--------|------------|
| **Single Responsibility** | Yes - only creates the client |
| **Dependencies** | External: `@supabase/supabase-js` |
| **Coupling** | None - pure infrastructure |
| **Testability** | Hard - singleton pattern |

#### Pattern: Singleton Module

This uses JavaScript's module system as a singleton. The `supabase` client is created once when the module loads and reused everywhere.

#### Weak Point: Testing

You can't easily mock this for tests. The client is created at import time.

#### Improvement: Factory Pattern

```typescript
// supabaseClient.ts
let client: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {...});
  }
  return client;
}

// For testing
export function setSupabaseClient(mockClient: SupabaseClient) {
  client = mockClient;
}
```

---

### Module 2: types.ts

**Lines**: 282
**Responsibility**: Type definitions

#### Architectural Assessment

| Aspect | Assessment |
|--------|------------|
| **Single Responsibility** | Yes - only defines types |
| **Dependencies** | None |
| **Coupling** | Every module imports from here |
| **Testability** | N/A - types only |

#### Pattern: Centralized Type Definitions

All entity types live here. This ensures consistency across modules.

#### Organization Within the File

```typescript
// Database schema type (not actually used due to comment)
export type Database = {...}

// Core entities
export interface User {...}
export interface Book {...}
export interface BookWithOwner extends Book {...}
export interface BorrowRequest {...}
export interface BorrowRequestWithDetails extends BorrowRequest {...}
export interface Review {...}
export interface Notification {...}
export interface Message {...}
export interface MessageWithSender extends Message {...}

// Auth types
export interface AuthUser {...}
export interface Session {...}
export interface SignUpCredentials {...}
export interface SignInCredentials {...}

// API types
export interface ApiError {...}
export interface ApiResponse<T> {...}
```

#### Weak Point: Input Types Not Here

Input types like `CreateBookInput` are defined in their respective modules, not in `types.ts`.

This creates inconsistency:
- Entity types: `types.ts`
- Input types: scattered in domain modules

#### Improvement: Consistent Location

Either:
1. Move all input types to `types.ts`, OR
2. Define them in domain modules but re-export from `types.ts`

---

### Module 3: auth.ts

**Lines**: 197
**Responsibility**: Authentication operations

```typescript
// Exports
signUp(credentials: SignUpCredentials)
signIn(credentials: SignInCredentials)
signOut()
getSession(): Promise<Session | null>
getCurrentUser(): Promise<AuthUser | null>
onAuthStateChange(callback)
resetPassword(email: string)
updatePassword(newPassword: string)
```

#### Architectural Assessment

| Aspect | Assessment |
|--------|------------|
| **Single Responsibility** | Yes - only auth operations |
| **Dependencies** | supabaseClient, types |
| **Coupling** | Low - standalone module |
| **Testability** | Medium - depends on Supabase auth |

#### Pattern: Adapter Pattern

This module **adapts** Supabase's auth API to your application's types:

```typescript
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getUser();
  // ...
  // Map Supabase user to our AuthUser type
  return {
    id: data.user.id,
    email: data.user.email ?? '',
    user_metadata: data.user.user_metadata,
  };
}
```

#### Design Decision: No User Profile Here

Note that `getCurrentUser()` returns `AuthUser` (from Supabase Auth), not `User` (from your profiles table). Profile fetching is in `users.ts`.

This separation is intentional:
- `auth.ts`: Authentication state
- `users.ts`: Profile data

---

### Module 4: books.ts

**Lines**: 307
**Responsibility**: Book CRUD and queries

```typescript
// Types
export interface CreateBookInput {...}
export interface UpdateBookInput {...}
export interface BookFilters {...}

// Functions
getBooks(filters?: BookFilters): Promise<Book[]>
getBook(id: string): Promise<Book | null>
createBook(input: CreateBookInput): Promise<Book>
updateBook(id: string, input: UpdateBookInput): Promise<Book>
deleteBook(id: string): Promise<void>
getUserBooks(userId: string): Promise<Book[]>
getAvailableBooks(filters?): Promise<Book[]>
getBooksWithOwners(filters?: BookFilters): Promise<BookWithOwner[]>
getAvailableBooksWithOwners(filters?): Promise<BookWithOwner[]>
getBookWithOwner(id: string): Promise<BookWithOwner | null>
uploadBookCover(bookId: string, file: File): Promise<string>
```

#### Architectural Assessment

| Aspect | Assessment |
|--------|------------|
| **Single Responsibility** | Yes - book domain only |
| **Dependencies** | supabaseClient, types |
| **Coupling** | Low - no domain module imports |
| **Testability** | Good - pure data operations |

#### Pattern: Repository Pattern (Implicit)

Although not explicitly named, this is a **Repository**:
- Encapsulates data access
- Returns domain objects (not raw DB rows)
- Has query methods (getBooks, getUserBooks, etc.)

#### Pattern: Convenience Functions

```typescript
// Core function
export async function getBooks(filters?: BookFilters): Promise<Book[]> {...}

// Convenience wrappers
export async function getUserBooks(userId: string): Promise<Book[]> {
  return getBooks({ owner_id: userId });
}

export async function getAvailableBooks(filters?): Promise<Book[]> {
  return getBooks({ ...filters, borrowable: true });
}
```

This pattern reduces code in consumers and centralizes filter logic.

#### Weak Point: Storage Coupling

`uploadBookCover` mixes concerns:
1. Upload to Supabase Storage
2. Update book record

```typescript
export async function uploadBookCover(bookId: string, file: File): Promise<string> {
  // Upload to storage
  await supabase.storage.from('books').upload(filePath, file, {...});

  // Get URL
  const { publicUrl } = supabase.storage.from('books').getPublicUrl(filePath);

  // Update book record
  await updateBook(bookId, { cover_image_url: publicUrl });

  return publicUrl;
}
```

#### Improvement: Separate Storage Module

```typescript
// storage.ts
export async function uploadFile(bucket: string, path: string, file: File): Promise<string>
export function getPublicUrl(bucket: string, path: string): string

// books.ts
import { uploadFile, getPublicUrl } from './storage';

export async function uploadBookCover(bookId: string, file: File): Promise<string> {
  const path = `book-covers/${bookId}-${Date.now()}.${ext}`;
  await uploadFile('books', path, file);
  const url = getPublicUrl('books', path);
  await updateBook(bookId, { cover_image_url: url });
  return url;
}
```

---

### Module 5: borrowRequests.ts

**Lines**: 492
**Responsibility**: Borrow workflow state machine

```typescript
// Types
export interface CreateBorrowRequestInput {...}
export interface UpdateBorrowRequestInput {...}
export interface HandoverDetails {...}
export interface ReturnDetails {...}
export interface BorrowRequestFilters {...}

// Core CRUD
getBorrowRequests(filters?): Promise<BorrowRequest[]>
getBorrowRequest(id): Promise<BorrowRequest | null>
createBorrowRequest(input): Promise<BorrowRequest>
updateBorrowRequest(id, input): Promise<BorrowRequest>
deleteBorrowRequest(id): Promise<void>

// State transitions
approveBorrowRequest(id, dueDate, handoverDetails, message?)
denyBorrowRequest(id, message?)
markBookReturned(id)
markHandoverComplete(id)
initiateReturn(id, returnDetails)

// Current user queries
getMyBorrowRequests(status?)
getIncomingBorrowRequests(status?)
getMyBorrowRequestsWithDetails(status?)
getIncomingBorrowRequestsWithDetails(status?)
getActiveChats()

// Tracking
updateHandoverTracking(id, tracking)
updateReturnTracking(id, tracking)
```

#### Architectural Assessment

| Aspect | Assessment |
|--------|------------|
| **Single Responsibility** | Borderline - does state management + data access |
| **Dependencies** | supabaseClient, types |
| **Coupling** | Medium - updates `books.borrowable` |
| **Testability** | Medium - state machine logic mixed with DB calls |

#### Pattern: State Machine (Implicit)

The status field transitions are encoded in functions:

```
pending ─── approveBorrowRequest() ──► approved
        └── denyBorrowRequest() ─────► denied

approved ── markHandoverComplete() ──► borrowed

borrowed ── initiateReturn() ────────► return_initiated

return_initiated ── markBookReturned() ──► returned
```

#### Weak Point: Cross-Domain Mutation

```typescript
export async function approveBorrowRequest(...) {
  // Update ANOTHER domain's data
  await supabase.from('books').update({ borrowable: false }).eq('id', bookId);
  // ...
}
```

This creates hidden coupling. If someone changes `books.ts`, they might not know `borrowRequests.ts` depends on `borrowable`.

#### Weak Point: Large File

At 492 lines, this is getting unwieldy. It handles:
- CRUD operations
- State transitions
- User-scoped queries
- Tracking updates

#### Improvement: Split by Concern

```
borrowRequests/
  index.ts           - Re-exports everything
  types.ts           - Input types, filters
  crud.ts            - Basic CRUD operations
  workflow.ts        - State transitions (approve, deny, return)
  queries.ts         - User-scoped queries
  tracking.ts        - Handover/return tracking
```

---

### Module 6: messages.ts

**Lines**: 298
**Responsibility**: Chat messaging within borrow requests

```typescript
getMessagesByRequest(requestId): Promise<MessageWithSender[]>
sendMessage(requestId, content): Promise<Message>
subscribeToMessages(requestId, callback): () => void
markMessagesAsRead(requestId): Promise<void>
getUnreadMessageCount(requestId): Promise<number>
getTotalUnreadCount(): Promise<number>
```

#### Architectural Assessment

| Aspect | Assessment |
|--------|------------|
| **Single Responsibility** | Yes |
| **Dependencies** | supabaseClient, types, borrowRequests, notifications |
| **Coupling** | High - imports from 2 domain modules |
| **Testability** | Hard - multiple dependencies |

#### Pattern: Cross-Cutting Concern

Messages span multiple domains:
- Tied to borrow requests
- Create notifications
- Realtime subscriptions

```typescript
import { getBorrowRequest } from './borrowRequests.js';
import { createNotification } from './notifications.js';

export async function sendMessage(requestId: string, content: string) {
  const request = await getBorrowRequest(requestId);  // Dependency
  // ...
  await createNotification({...});  // Dependency
  // ...
}
```

#### Weak Point: Hidden Side Effects

`sendMessage()` creates a notification. The caller doesn't know this from the function signature.

#### Improvement: Make Side Effects Explicit

Option A: Return created entities
```typescript
interface SendMessageResult {
  message: Message;
  notification: Notification | null;
}

export async function sendMessage(...): Promise<SendMessageResult>
```

Option B: Events/hooks
```typescript
export async function sendMessage(requestId, content, { onNotificationCreated }?) {
  // ...
  const notification = await createNotification({...});
  onNotificationCreated?.(notification);
  // ...
}
```

---

### Module 7: notifications.ts

**Lines**: 270
**Responsibility**: User notifications

```typescript
// Core operations
getNotifications(filters?): Promise<Notification[]>
getMyNotifications(filters?): Promise<Notification[]>
getUnreadNotifications(): Promise<Notification[]>
getUnreadCount(): Promise<number>
markNotificationAsRead(id): Promise<Notification>
markAllAsRead(): Promise<void>
createNotification(input): Promise<Notification>
deleteNotification(id): Promise<void>

// Realtime
subscribeToNotifications(callback): () => void

// Helpers
notifyBorrowRequest(ownerId, bookId, borrowerName)
notifyRequestApproved(borrowerId, bookId, bookTitle)
notifyRequestDenied(borrowerId, bookId, bookTitle)
```

#### Architectural Assessment

| Aspect | Assessment |
|--------|------------|
| **Single Responsibility** | Yes |
| **Dependencies** | supabaseClient, types |
| **Coupling** | Low |
| **Testability** | Good |

#### Pattern: Notification Helpers

Domain-specific notification creators:

```typescript
export async function notifyBorrowRequest(ownerId, bookId, borrowerName) {
  return createNotification({
    user_id: ownerId,
    type: 'borrow_request',
    title: 'New Borrow Request',
    message: `${borrowerName} wants to borrow your book`,
    payload: { book_id: bookId },
  });
}
```

These encode the "template" for each notification type.

#### Observation: RPC Usage

```typescript
const { data, error } = await supabase.rpc('create_notification_secure', {...});
```

This is the only module using RPC for a standard operation. It indicates RLS considerations.

---

### Module 8: communities.ts

**Lines**: 762
**Responsibility**: Community management

```typescript
// Community CRUD
getCommunities(filters?), getMyCommunities(userId), getCommunityById(id, userId?)
createCommunity(input), updateCommunity(id, input), deleteCommunity(id)

// Member management
getCommunityMembers(communityId), getPendingJoinRequests(communityId)
joinCommunity(communityId, userId), approveMember(communityId, userId)
updateMemberRole(communityId, userId, role), removeMember(communityId, userId)
leaveCommunity(communityId, userId), transferOwnership(communityId, currentOwnerId, newOwnerId)

// Book-community association
addBookToCommunity(bookId, communityId), removeBookFromCommunity(bookId, communityId)
getCommunityBooks(communityId), getBookCommunities(bookId)

// Activity feed
getCommunityActivity(communityId, limit?), createActivity(input)

// Invitations
inviteUserToCommunity(input), getCommunityInvitations(communityId)
getMyInvitations(userId), acceptInvitation(invitationId)
rejectInvitation(invitationId), cancelInvitation(invitationId)
```

#### Architectural Assessment

| Aspect | Assessment |
|--------|------------|
| **Single Responsibility** | Borderline - community is complex domain |
| **Dependencies** | supabaseClient, types |
| **Coupling** | Low |
| **Testability** | Good |

#### Pattern: Aggregate Root

Community acts as an "aggregate root" in DDD terms. Most operations go through the community:
- `getCommunityMembers(communityId)` - not `getMembersByCommunity()`
- `addBookToCommunity(bookId, communityId)` - community-centric

#### Weak Point: File Size

762 lines is too large. The module handles 5 distinct concerns:
1. Community CRUD
2. Member management
3. Book associations
4. Activity feed
5. Invitations

#### Improvement: Split by Sub-domain

```
communities/
  index.ts
  types.ts
  communities.ts      - Community CRUD
  members.ts          - Member management
  books.ts            - Book-community association
  activity.ts         - Activity feed
  invitations.ts      - Invitation system
```

---

### Module 9: admin.ts

**Lines**: 1573
**Responsibility**: Admin dashboard operations

This is the largest module. It contains:

```typescript
// Dashboard stats
getAdminStats(), getRecentActivity(limit), getGenreDistribution()
getBorrowActivityData(), getUserGrowthData(), checkIsAdmin()

// User management
getAllUsers(filters?), updateUserAdminStatus(userId, isAdmin)
suspendUser(userId, reason), unsuspendUser(userId)
updateUserProfile(userId, data), getUserActivityHistory(userId, limit)
deleteUser(userId)

// Content moderation
getAllBooks(filters?), deleteBook(bookId), updateBook(bookId, data)
flagBook(bookId, reason), unflagBook(bookId)
getAllReviews(bookId?), deleteReview(reviewId)

// Request overrides
getAllBorrowRequests(filters?)
adminApproveRequest(requestId, dueDate, message?)
adminDenyRequest(requestId, reason)
adminCancelRequest(requestId), adminMarkAsReturned(requestId)

// System notifications
sendBroadcastNotification(input), sendGroupNotification(input)
sendUserNotification(input)

// Advanced analytics
getMostActiveUsers(limit), getMostBorrowedBooks(limit)
getAverageBorrowDuration(), getUserRetentionMetrics(), getPlatformKPIs()

// Community management
getAllCommunities(filters?), adminDeleteCommunity(communityId)
adminUpdateCommunity(communityId, data)
```

#### Architectural Assessment

| Aspect | Assessment |
|--------|------------|
| **Single Responsibility** | No - "admin" is too broad |
| **Dependencies** | supabaseClient, types, communities (type import) |
| **Coupling** | Low (surprisingly) |
| **Testability** | Medium - many functions to test |

#### Anti-Pattern: God Module

This module violates single responsibility. "Admin operations" isn't a coherent domain - it's an access level.

#### Improvement: Domain-Based Split

```
admin/
  index.ts              - Re-exports everything
  types.ts              - Admin-specific types
  stats.ts              - Dashboard statistics
  userManagement.ts     - User CRUD and suspension
  contentModeration.ts  - Book/review moderation
  requestOverrides.ts   - Borrow request admin actions
  notifications.ts      - System notifications
  analytics.ts          - Advanced analytics
  communities.ts        - Community admin operations
```

Each file would be ~150-200 lines and have a clear responsibility.

---

### Module 10: bookSearch.ts

**Lines**: 133
**Responsibility**: Google Books API integration

```typescript
export interface BookSearchResult {...}

searchBooks(query): Promise<BookSearchResult[]>
getBookDetails(bookId): Promise<BookSearchResult | null>
mapCategoryToGenre(categories): string | undefined
```

#### Architectural Assessment

| Aspect | Assessment |
|--------|------------|
| **Single Responsibility** | Yes |
| **Dependencies** | None (uses fetch) |
| **Coupling** | None |
| **Testability** | Easy - can mock fetch |

#### Pattern: External Service Adapter

This adapts an external API to your domain:

```typescript
// External API response
const data = await response.json();

// Map to your types
return data.items.map((item: any) => ({
  id: item.id,
  title: volumeInfo.title || '',
  authors: volumeInfo.authors || [],
  // ...
}));
```

#### Observation: No Supabase

This is the only domain module that doesn't import `supabaseClient`. It's pure external API integration.

---

## 3. Global Architecture Patterns

### Pattern 1: Throw on Error

Every module follows this:

```typescript
const { data, error } = await supabase.from('table')...
if (error) throw error;
return data;
```

**Implication**: Callers must use try/catch.

### Pattern 2: Filter Objects

Instead of many parameters:

```typescript
// Not this
getBooks(genre?: string, borrowable?: boolean, ownerId?: string)

// This
getBooks(filters?: BookFilters)
```

### Pattern 3: Input/Output Type Separation

```typescript
// Input (what you provide)
interface CreateBookInput {
  title: string;
  author: string;
  // No id, no timestamps
}

// Output (what you get back)
interface Book {
  id: string;
  title: string;
  author: string;
  created_at: string;
  // All fields
}
```

### Pattern 4: Convenience Functions

Core function + wrappers:

```typescript
export async function getBooks(filters?: BookFilters): Promise<Book[]>

export async function getUserBooks(userId: string): Promise<Book[]> {
  return getBooks({ owner_id: userId });
}
```

---

## 4. Dependency Graph Analysis

```
                    ┌────────────────────┐
                    │   supabaseClient   │
                    └─────────┬──────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐          ┌─────────┐         ┌─────────────┐
    │  types  │◄─────────│ All Modules      │    admin    │
    └─────────┘          └─────────┘         └──────┬──────┘
                                                    │
                                                    │ (type import only)
                                                    ▼
                                             ┌─────────────┐
                                             │ communities │
                                             │   (types)   │
                                             └─────────────┘

    Cross-module dependencies:

    messages.ts ────► borrowRequests.ts
         │
         └─────────► notifications.ts
```

### Coupling Analysis

| Module | Imports From | Imported By |
|--------|--------------|-------------|
| supabaseClient | (external) | all domain modules |
| types | (none) | all domain modules |
| auth | supabaseClient, types | (none) |
| books | supabaseClient, types | (none) |
| borrowRequests | supabaseClient, types | messages |
| messages | supabaseClient, types, borrowRequests, notifications | (none) |
| notifications | supabaseClient, types | messages |
| communities | supabaseClient, types | admin (type only) |
| admin | supabaseClient, types, communities (type) | (none) |
| bookSearch | (none - uses fetch) | (none) |

**Cleanest modules**: auth, books, reviews, notifications, communities
**Most coupled module**: messages (2 domain dependencies)

---

## 5. Recommendations Summary

### Immediate Improvements

1. **Split `admin.ts`** into 7-8 focused files
2. **Split `communities.ts`** into 4-5 focused files
3. **Split `borrowRequests.ts`** into 4 focused files
4. **Create `storage.ts`** module for file uploads

### Architectural Improvements

1. **Make side effects explicit** in function signatures
2. **Consider event-driven notifications** instead of direct calls
3. **Add factory pattern** to supabaseClient for testability
4. **Centralize input types** in types.ts

---

## 6. Reflection Questions

1. **Why is `messages.ts` the most coupled module?**
   - Could it be decoupled? How?

2. **The `admin.ts` module is 1573 lines. What principle does this violate?**
   - What's the right granularity for splitting?

3. **`bookSearch.ts` doesn't use Supabase. Should it be in api-client?**
   - Where else could it live?

4. **`borrowRequests.ts` modifies `books.borrowable`. Is this good or bad?**
   - What's the alternative?

5. **Input types are defined in domain modules, not `types.ts`. Is this consistent?**
   - What's your preference and why?

---

## 7. Reading Plan for Day 4

1. **Read `admin.ts`** (30 minutes) - Identify where you'd split it.

2. **Trace a flow** (20 minutes):
   - Start at `sendMessage()` in messages.ts
   - Follow every function call
   - Draw the dependency chain

3. **Compare modules** (15 minutes):
   - Read `auth.ts` (clean, standalone)
   - Read `messages.ts` (coupled)
   - What makes the difference?

**Total**: ~65 minutes

---

## 8. Key Takeaways

1. **Single responsibility is often violated** - especially in admin.ts and communities.ts

2. **Coupling is mostly low** - only messages.ts imports from other domain modules

3. **Patterns are consistent** - throw on error, filter objects, input/output types

4. **Large files need splitting** - 500+ lines is a code smell

5. **Cross-domain mutations create hidden coupling** - borrowRequests modifying books

---

## Next: Day 5

Tomorrow we'll analyze failure modes, security implications (RLS), and scalability concerns for each module.
