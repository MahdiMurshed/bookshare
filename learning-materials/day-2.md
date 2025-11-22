# Day 2: Schema, Data Modeling & Alternatives

## Learning Objectives

By the end of today, you will:
- Deeply understand each data model in `types.ts`
- Know why each schema is designed the way it is
- Recognize alternative designs and their trade-offs
- Understand normalization vs denormalization decisions
- Identify potential scalability issues and migration risks

---

## 1. Schema Overview: The Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CORE ENTITIES                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│    ┌─────────┐         ┌─────────┐         ┌──────────────────┐             │
│    │  User   │────────►│  Book   │◄────────│  BorrowRequest   │             │
│    └────┬────┘         └────┬────┘         └────────┬─────────┘             │
│         │                   │                        │                        │
│         │                   │                        │                        │
│         ▼                   ▼                        ▼                        │
│    ┌─────────┐         ┌─────────┐         ┌──────────────────┐             │
│    │ Review  │         │ Message │         │   Notification   │             │
│    └─────────┘         └─────────┘         └──────────────────┘             │
│                                                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                           COMMUNITY ENTITIES                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│    ┌───────────────┐      ┌──────────────────┐      ┌───────────────────┐   │
│    │   Community   │◄────►│ CommunityMember  │      │ CommunityActivity │   │
│    └───────┬───────┘      └──────────────────┘      └───────────────────┘   │
│            │                                                                  │
│            ▼                                                                  │
│    ┌───────────────┐      ┌──────────────────────┐                          │
│    │ BookCommunity │      │ CommunityInvitation  │                          │
│    └───────────────┘      └──────────────────────┘                          │
│                                                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                           AUDIT ENTITIES                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│    ┌───────────────────┐                                                     │
│    │  UserActivityLog  │                                                     │
│    └───────────────────┘                                                     │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Per-Schema Deep Dive

### Schema 1: User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  suspended: boolean;
  suspended_at: string | null;
  suspended_reason: string | null;
  created_at: string;
  updated_at: string;
}
```

#### What This Schema Models

A user account in the system. Note that this is **separate from Supabase Auth** - you have both an auth user (in `auth.users`) and a profile user (in `public.users`).

#### Why This Design?

1. **Separation from Auth**: Supabase Auth handles email/password. This table handles profile data.
2. **Soft Admin Flag**: `is_admin` is a simple boolean, not a roles table.
3. **Soft Suspension**: `suspended` flag allows disabling accounts without deleting them.

#### Alternative Designs

**Alternative A: Roles Table**
```sql
CREATE TABLE roles (id, name);  -- 'admin', 'moderator', 'user'
CREATE TABLE user_roles (user_id, role_id);
```
*Trade-off*: More flexible (multiple roles) but more complex queries. Current design assumes only two states: admin or not.

**Alternative B: No Separate Profile Table**
Use Supabase Auth's `user_metadata` for all profile data.
*Trade-off*: Simpler, but you can't query profiles directly with SQL. You'd need to call the Auth API.

**Alternative C: Soft Delete Instead of Suspension**
```typescript
deleted_at: string | null;
```
*Trade-off*: Suspension is reversible and communicates intent better than soft delete.

#### Normalization Analysis

- **Normalized**: Each user has one row. No redundant data.
- **Potential Denormalization**: Could add `book_count`, `borrow_count` for faster queries, but would require triggers to maintain.

#### Scalability Considerations

- **Index Needed**: `email` should have a unique index.
- **At Scale**: `is_admin` queries are fine. For complex RBAC, consider a roles table.

#### Supabase Documentation

- [User Management](https://supabase.com/docs/guides/auth/managing-user-data)
- [Row Level Security for User Tables](https://supabase.com/docs/guides/auth/row-level-security)

---

### Schema 2: Book

```typescript
interface Book {
  id: string;
  owner_id: string;
  title: string;
  author: string;
  isbn: string | null;
  genre: string | null;
  description: string | null;
  cover_image_url: string | null;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  borrowable: boolean;
  flagged: boolean;
  flagged_at: string | null;
  flagged_reason: string | null;
  created_at: string;
  updated_at: string;
}
```

#### What This Schema Models

A physical book that a user owns and may lend out.

#### Why This Design?

1. **`owner_id`**: Foreign key to users. One owner per book.
2. **`condition` enum**: Limited set of valid values.
3. **`borrowable` boolean**: Quick check for availability without querying borrow_requests.
4. **`flagged` fields**: Admin moderation without deletion.

#### Alternative Designs

**Alternative A: Separate Authors Table**
```sql
CREATE TABLE authors (id, name);
CREATE TABLE book_authors (book_id, author_id, position);
```
*Trade-off*: Handles multiple authors, but your current app doesn't need it. YAGNI applies.

**Alternative B: Genre as Foreign Key**
```sql
CREATE TABLE genres (id, name, description);
-- book.genre_id instead of book.genre
```
*Trade-off*: Enforces valid genres, enables genre metadata. Current string is simpler but allows typos.

**Alternative C: Availability as Computed**
Instead of `borrowable` boolean, compute from borrow_requests:
```sql
SELECT * FROM books WHERE id NOT IN (
  SELECT book_id FROM borrow_requests WHERE status IN ('approved', 'borrowed')
);
```
*Trade-off*: Always accurate but slower. Current design requires maintaining `borrowable` in sync with borrow_requests (done in `approveBorrowRequest` and `markBookReturned`).

#### Why `borrowable` Is Denormalized

This is **intentional denormalization** for performance:

```typescript
// In borrowRequests.ts
export async function approveBorrowRequest(...) {
  // Update the book to mark it as not borrowable
  await supabase.from('books').update({ borrowable: false }).eq('id', bookId);
  // ...
}

export async function markBookReturned(...) {
  // Update the book to mark it as borrowable again
  await supabase.from('books').update({ borrowable: true }).eq('id', bookId);
  // ...
}
```

**Risk**: If these updates fail or are forgotten, `borrowable` becomes stale.

#### Supabase Documentation

- [Database Enums](https://supabase.com/docs/guides/database/enums) - For the `condition` field
- [Foreign Key Constraints](https://supabase.com/docs/guides/database/tables#foreign-key-constraints)
- [Storage for Images](https://supabase.com/docs/guides/storage) - For `cover_image_url`

---

### Schema 3: BorrowRequest

```typescript
interface BorrowRequest {
  id: string;
  book_id: string;
  borrower_id: string;
  owner_id: string;
  status: 'pending' | 'approved' | 'borrowed' | 'return_initiated' | 'returned' | 'denied';
  request_message: string | null;
  response_message: string | null;
  requested_at: string;
  approved_at: string | null;
  due_date: string | null;
  returned_at: string | null;

  // Handover fields (denormalized)
  handover_method: 'ship' | 'meetup' | 'pickup' | null;
  handover_address: string | null;
  handover_datetime: string | null;
  handover_instructions: string | null;
  handover_tracking: string | null;
  handover_completed_at: string | null;

  // Return fields (denormalized)
  return_method: 'ship' | 'meetup' | 'dropoff' | null;
  return_address: string | null;
  return_datetime: string | null;
  return_instructions: string | null;
  return_tracking: string | null;
  return_initiated_at: string | null;

  // Chat optimization (denormalized)
  last_message_at: string | null;
  last_message_content: string | null;

  created_at: string;
  updated_at: string;
}
```

#### What This Schema Models

A borrow request is a **state machine** tracking a book's journey from request to return.

```
                    ┌────────┐
                    │pending │
                    └───┬────┘
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
       ┌────────┐              ┌────────┐
       │approved│              │ denied │ (terminal)
       └───┬────┘              └────────┘
           │
           ▼
       ┌────────┐
       │borrowed│
       └───┬────┘
           │
           ▼
    ┌───────────────┐
    │return_initiated│
    └───────┬───────┘
            │
            ▼
       ┌────────┐
       │returned│ (terminal)
       └────────┘
```

#### Why This Design?

1. **`owner_id` redundancy**: Denormalized from `books.owner_id` for faster queries. You can filter "incoming requests" without joining books.

2. **Handover/Return fields inline**: All logistics data is on the same row.

3. **`last_message_at/content`**: Denormalized from messages for chat list sorting without joining.

#### Alternative Designs

**Alternative A: Separate Handover Table**
```sql
CREATE TABLE handovers (
  id, borrow_request_id, type ('initial'|'return'),
  method, address, datetime, instructions, tracking, completed_at
);
```
*Trade-off*: Cleaner schema, but requires join for every request detail view. Current design has all data in one row.

**Alternative B: Event Sourcing**
```sql
CREATE TABLE borrow_events (
  id, request_id, event_type, payload JSONB, created_at
);
```
Events: `requested`, `approved`, `denied`, `handover_scheduled`, `picked_up`, `return_initiated`, `returned`
*Trade-off*: Full history, but complex to query current state.

**Alternative C: Normalize owner_id**
Remove `owner_id` from borrow_requests, always join books.
*Trade-off*: Single source of truth, but slower queries and more complex code.

#### Scalability Considerations

- **Indexes Needed**: `(book_id)`, `(borrower_id)`, `(owner_id)`, `(status)`, `(last_message_at)`
- **Archival**: Old `returned` requests could be moved to a history table.
- **Hot Fields**: `status`, `last_message_at` update frequently. Consider if this causes lock contention.

#### Supabase Documentation

- [Working with Arrays and JSON](https://supabase.com/docs/guides/database/json) - Could use JSONB for handover/return instead

---

### Schema 4: Review

```typescript
interface Review {
  id: string;
  book_id: string;
  user_id: string;
  rating: number; // 1-5
  comment: string | null;
  created_at: string;
  updated_at: string;
}
```

#### What This Schema Models

A user's review of a book after borrowing it.

#### Why This Design?

Simple and clean. One review per (book, user) pair.

#### Alternative Designs

**Alternative A: Composite Primary Key**
```sql
PRIMARY KEY (book_id, user_id)
```
Instead of a separate `id` column.
*Trade-off*: Enforces uniqueness at DB level, but some ORMs expect `id`.

**Alternative B: Rating as Enum**
```typescript
rating: '1_star' | '2_star' | '3_star' | '4_star' | '5_star'
```
*Trade-off*: More explicit, but harder to compute averages.

**Alternative C: Denormalized Average on Book**
```typescript
// In Book schema
average_rating: number | null;
review_count: number;
```
*Trade-off*: Faster reads, but requires trigger to maintain.

#### Current Implementation Note

`getBookAverageRating()` computes the average on every call:
```typescript
const sum = data.reduce((acc, review) => acc + review.rating, 0);
return sum / data.length;
```
This is fine for low volume. At scale, consider a materialized view or denormalized field.

---

### Schema 5: Notification

```typescript
interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  payload: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
  updated_at: string;
}

type NotificationType =
  | 'borrow_request' | 'request_approved' | 'request_denied'
  | 'book_returned' | 'due_soon' | 'overdue' | 'new_message'
  | 'community_join_request' | 'community_invitation'
  | 'announcement' | 'alert' | 'info';
```

#### What This Schema Models

User notifications - both system-generated and admin-sent.

#### Why This Design?

1. **`type` union**: Enables filtering by notification category.
2. **`payload` JSONB**: Flexible structured data without schema changes.
3. **`read` boolean**: Simple read tracking.

#### Alternative Designs

**Alternative A: Separate Tables per Type**
```sql
CREATE TABLE borrow_notifications (...);
CREATE TABLE community_notifications (...);
```
*Trade-off*: Type-specific fields, but scattered queries.

**Alternative B: Read Receipts Table**
```sql
CREATE TABLE notification_reads (notification_id, user_id, read_at);
```
For multi-recipient notifications.
*Trade-off*: Supports broadcasts without duplicating rows.

#### Scalability Considerations

- **Growth**: Notifications grow unbounded. Consider TTL or archival.
- **Index**: `(user_id, read, created_at)` for unread queries.

#### Supabase Documentation

- [Realtime](https://supabase.com/docs/guides/realtime) - Notifications use postgres_changes
- [JSON Columns](https://supabase.com/docs/guides/database/json) - For `payload`

---

### Schema 6: Message

```typescript
interface Message {
  id: string;
  borrow_request_id: string;
  sender_id: string;
  content: string;
  read_by_owner: boolean;
  read_by_borrower: boolean;
  created_at: string;
  updated_at: string;
}
```

#### What This Schema Models

Chat messages within a borrow request context.

#### Why This Design?

1. **Tied to borrow_request**: Messages are scoped to a transaction.
2. **Dual read flags**: Each party tracks their own read state.

#### Alternative Designs

**Alternative A: Generic Chat System**
```sql
CREATE TABLE conversations (id, ...);
CREATE TABLE conversation_participants (conversation_id, user_id);
CREATE TABLE messages (id, conversation_id, sender_id, content, ...);
CREATE TABLE message_reads (message_id, user_id, read_at);
```
*Trade-off*: Supports group chats and multiple conversations per user pair. Overkill for current needs.

**Alternative B: Single `read_by` Array**
```typescript
read_by: string[];  // Array of user IDs who have read
```
*Trade-off*: Flexible for N participants, but PostgreSQL array queries are slower.

#### Why Dual Read Flags Work Here

In a borrow request, there are exactly **two** participants: owner and borrower. The schema encodes this directly:

```typescript
// In messages.ts
const isOwner = request.owner_id === user.id;
await supabase
  .from('messages')
  .update(isOwner ? { read_by_owner: true } : { read_by_borrower: true })
```

---

### Schema 7: Community

```typescript
interface Community {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  location: string | null;
  is_private: boolean;
  requires_approval: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Computed (not in DB)
  memberCount?: number;
  bookCount?: number;
  userRole?: 'owner' | 'admin' | 'member';
  userStatus?: 'approved' | 'pending';
}
```

#### What This Schema Models

A group where users can share books.

#### Why This Design?

1. **`is_private` + `requires_approval`**: Two toggles for access control.
2. **Computed fields**: `memberCount`, `bookCount` are added at query time, not stored.

#### Alternative Designs

**Alternative A: Single Access Mode**
```typescript
access: 'public' | 'private_open' | 'private_approval'
```
*Trade-off*: Single field but less flexible. Current design allows 4 combinations.

**Alternative B: Denormalized Counts**
```typescript
// In DB
member_count: number;
book_count: number;
```
*Trade-off*: Faster queries but requires triggers.

---

### Schema 8: CommunityMember

```typescript
interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'approved' | 'pending';
  joined_at: string;
  user?: User;
}
```

#### What This Schema Models

The many-to-many relationship between users and communities.

#### Why This Design?

Classic **junction table** with role and status.

#### Key Insight: Owner is a Role

The community owner is stored as a `role: 'owner'` in the members table, AND as `created_by` in the community. This is **intentional redundancy**:

- `created_by`: Who originally created it (historical)
- `role: 'owner'`: Who currently owns it (can change via `transferOwnership`)

---

### Schema 9: UserActivityLog

```typescript
interface UserActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
```

#### What This Schema Models

An audit trail of user actions.

#### Why This Design?

1. **Flexible `action_type`**: String allows new actions without schema changes.
2. **`entity_type` + `entity_id`**: Generic pattern for linking to any entity.
3. **`metadata` JSONB**: Extra context per action.

#### Alternative Designs

**Alternative A: Typed Entity References**
```sql
book_id UUID REFERENCES books(id),
borrow_request_id UUID REFERENCES borrow_requests(id),
-- etc.
```
*Trade-off*: Type-safe foreign keys, but requires column per entity type.

**Alternative B: Event Sourcing**
Make this the **source of truth** and derive current state.
*Trade-off*: Powerful but complex. Current design is audit-only.

---

## 3. Global Schema Patterns

### Pattern 1: Timestamps Everywhere

Every table has:
```typescript
created_at: string;
updated_at: string;
```

**Best Practice**: Use Supabase defaults:
```sql
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
```
Plus a trigger for `updated_at`:
```sql
CREATE TRIGGER update_timestamp BEFORE UPDATE ON table_name
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

See: [Supabase Timestamps](https://supabase.com/docs/guides/database/timestamps)

### Pattern 2: UUID Primary Keys

All `id` fields are strings (UUIDs).

**Why UUIDs**:
- Generated client-side (no round-trip)
- No sequential exposure (security)
- Globally unique (merge-friendly)

**Trade-off**: Larger than integers, worse index locality.

See: [Supabase UUIDs](https://supabase.com/docs/guides/database/tables#primary-keys)

### Pattern 3: Nullable Foreign Keys

```typescript
owner_id: string;       // Required - book must have owner
isbn: string | null;    // Optional - book might not have ISBN
```

**Principle**: Required relationships are NOT NULL. Optional data is nullable.

### Pattern 4: JSONB for Flexibility

```typescript
payload: Record<string, unknown> | null;
metadata: Record<string, unknown> | null;
```

**When to use JSONB**:
- Variable structure per row
- Don't need to query deeply into the JSON
- Schema flexibility more important than query performance

See: [Supabase JSON](https://supabase.com/docs/guides/database/json)

---

## 4. Suggested Improvements

### Improvement 1: Add Composite Unique Constraints

```sql
-- Prevent duplicate reviews
ALTER TABLE reviews ADD CONSTRAINT unique_user_book_review
  UNIQUE (user_id, book_id);

-- Prevent duplicate community membership
ALTER TABLE community_members ADD CONSTRAINT unique_community_user
  UNIQUE (community_id, user_id);
```

### Improvement 2: Consider Enum Types

Instead of string unions, use PostgreSQL enums:

```sql
CREATE TYPE book_condition AS ENUM ('excellent', 'good', 'fair', 'poor');
CREATE TYPE borrow_status AS ENUM ('pending', 'approved', 'borrowed', ...);
```

See: [Supabase Enums](https://supabase.com/docs/guides/database/enums)

### Improvement 3: Add Check Constraints

```sql
ALTER TABLE reviews ADD CONSTRAINT rating_range
  CHECK (rating >= 1 AND rating <= 5);
```

---

## 5. Reflection Questions

1. **Why is `owner_id` duplicated in `borrow_requests` when it exists in `books`?**
   - What queries does this optimize?
   - What's the risk?

2. **The `Message` schema uses two boolean fields for read status. What would you do for a group chat with 10 people?**

3. **`Notification.payload` is JSONB. When would you promote a payload field to a proper column?**

4. **Why doesn't `Review` have `borrow_request_id` to link to the specific borrow?**
   - Should it? What would that enable?

5. **Community has computed fields (`memberCount`, `bookCount`). What are the pros and cons of storing these in the database vs computing them?**

---

## 6. Reading Plan for Day 2

1. **`types.ts`** (30 minutes) - Read every interface again, this time with today's analysis in mind.

2. **Supabase Docs** (30 minutes):
   - [Database Enums](https://supabase.com/docs/guides/database/enums)
   - [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
   - [Foreign Keys](https://supabase.com/docs/guides/database/tables#foreign-key-constraints)

3. **Sketch your own ER diagram** (20 minutes) - Draw the relationships without looking at this document.

**Total**: ~80 minutes

---

## 7. Key Takeaways

1. **Denormalization is intentional** - `owner_id` in borrow_requests, `borrowable` in books, `last_message_*` in borrow_requests.

2. **State machines need careful design** - BorrowRequest's 6 statuses model a real-world workflow.

3. **JSONB provides flexibility** - `payload` and `metadata` avoid schema changes.

4. **Computed fields stay computed** - Community counts are calculated, not stored.

5. **Two-party assumptions are encoded** - Message read flags assume exactly owner + borrower.

---

## Next: Day 3

Tomorrow we'll analyze every query in the codebase - understanding why each is structured the way it is, whether it's optimal, and how to improve performance.
