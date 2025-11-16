# Communities Feature - Technical Documentation

Complete technical documentation for the BookShare Communities feature implementation.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Layer](#api-layer)
5. [Frontend Implementation](#frontend-implementation)
6. [Security & Permissions](#security--permissions)
7. [Activity Tracking](#activity-tracking)
8. [Testing](#testing)
9. [Performance Considerations](#performance-considerations)
10. [Future Enhancements](#future-enhancements)

---

## Overview

The Communities feature enables users to create and join groups for sharing books within specific communities. This feature supports both public and private communities, role-based access control, and activity tracking.

### Key Features

- ✅ Create public/private communities
- ✅ Join/leave communities with approval workflows
- ✅ Role-based access (owner, admin, member)
- ✅ Share books across communities
- ✅ Member management (approve, promote, remove)
- ✅ Ownership transfer
- ✅ Activity feed tracking
- ✅ Browse books by community
- ✅ Full dark mode support

### Technology Stack

- **Backend**: Supabase (PostgreSQL, RLS, Realtime)
- **API Abstraction**: `@repo/api-client` package
- **Frontend**: React 19 + TypeScript
- **State Management**: TanStack Query (React Query)
- **Forms**: react-hook-form + Zod validation
- **UI Components**: shadcn/ui + TailwindCSS 4

---

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (React)                    │
├─────────────────────────────────────────────────────────────┤
│  Pages:          │  Components:        │  Hooks:             │
│  - Communities   │  - CommunityCard    │  - useCommunities   │
│  - CommunityDet  │  - CreateModal      │  - useMembers       │
│  - Browse        │  - Settings         │  - useActivity      │
│                  │  - ActivityFeed     │                     │
├─────────────────────────────────────────────────────────────┤
│              API Client Abstraction Layer                    │
│          (@repo/api-client/src/communities.ts)               │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Backend                          │
│  - PostgreSQL Database (4 new tables)                        │
│  - Row Level Security (RLS) Policies                         │
│  - Triggers & Functions (Activity Tracking)                  │
└─────────────────────────────────────────────────────────────┘
```

### Backend Abstraction Pattern

All backend operations go through the API client layer to enable future migration from Supabase to NestJS:

```typescript
// ✅ Correct - Backend agnostic
import { getCommunities, createCommunity } from '@repo/api-client';

// ❌ Wrong - Directly coupled to Supabase
import { supabase } from '@repo/api-client/supabaseClient';
```

---

## Database Schema

### Tables Overview

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `communities` | Core community data | → users (created_by) |
| `community_members` | Membership & roles | → communities, users |
| `book_communities` | Book-community association | → books, communities |
| `community_activity` | Activity feed | → communities, users |

### Entity Relationship Diagram

```
┌──────────────┐       ┌─────────────────┐       ┌──────────┐
│    users     │◄──────│   communities   │──────►│  books   │
│              │       │                 │       │          │
│  id (PK)     │       │  id (PK)        │       │  id (PK) │
└──────────────┘       │  created_by (FK)│       └──────────┘
       ▲               │  name           │              ▲
       │               │  is_private     │              │
       │               │  requires_appr. │              │
       │               └─────────────────┘              │
       │                       ▲                        │
       │                       │                        │
       │               ┌───────┴──────────┐             │
       │               │                  │             │
       │       ┌───────┴────────┐  ┌──────┴──────────┐ │
       │       │ community_memb.│  │ book_communities│ │
       └───────│                │  │                 │─┘
               │  community_id  │  │  community_id   │
               │  user_id       │  │  book_id        │
               │  role          │  │  added_by       │
               │  status        │  └─────────────────┘
               └────────────────┘
```

### Table: `communities`

```sql
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `communities_created_by_idx` - Fast lookup by creator
- `communities_is_private_idx` - Filter public/private
- `communities_name_search_idx` - Full-text search on name/description

### Table: `community_members`

```sql
CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  status TEXT NOT NULL CHECK (status IN ('approved', 'pending')) DEFAULT 'pending',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);
```

**Roles:**
- `owner` - Full control, can delete community, transfer ownership
- `admin` - Manage members, edit settings, cannot delete
- `member` - View and participate, no management rights

**Statuses:**
- `approved` - Active member with full access
- `pending` - Awaiting approval (for private communities)

**Indexes:**
- `community_members_community_id_idx` - Fast member lookups
- `community_members_user_id_idx` - Fast user's communities lookup
- `community_members_status_idx` - Filter pending/approved

### Table: `book_communities`

```sql
CREATE TABLE public.book_communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(book_id, community_id)
);
```

**Purpose:** Many-to-many relationship allowing books to be shared in multiple communities.

**Indexes:**
- `book_communities_book_id_idx` - Fast book-to-communities lookup
- `book_communities_community_id_idx` - Fast community-to-books lookup

### Table: `community_activity`

```sql
CREATE TABLE public.community_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('member_joined', 'book_added', 'borrow_created', 'borrow_returned', 'review_posted')),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Activity Types:**
- `member_joined` - User joined/approved
- `book_added` - Book shared to community
- `borrow_created` - Borrow request created
- `borrow_returned` - Book returned
- `review_posted` - Review submitted

**Metadata Examples:**
```typescript
// member_joined
{ member_id: string, role: string }

// book_added
{ book_id: string, added_by: string }

// borrow_created
{ book_id: string, borrower_id: string, book_title: string }

// borrow_returned
{ book_id: string, borrower_id: string, book_title: string, duration_days: number }

// review_posted
{ book_id: string, review_id: string, rating: number }
```

**Indexes:**
- `community_activity_community_id_idx` - Fast activity lookups
- `community_activity_type_idx` - Filter by activity type
- `community_activity_created_at_idx` - Ordered by recency (DESC)

---

## API Layer

All API functions are located in `packages/api-client/src/communities.ts` and exported through `packages/api-client/src/index.ts`.

### Community Management

#### `getCommunities(filters?: CommunityFilters): Promise<Community[]>`

Get all communities with optional filters.

```typescript
interface CommunityFilters {
  isPrivate?: boolean;
  search?: string;
}

// Usage
const allCommunities = await getCommunities();
const publicOnly = await getCommunities({ isPrivate: false });
const searchResults = await getCommunities({ search: 'book club' });
```

#### `getMyCommunities(userId: string): Promise<Community[]>`

Get communities the user is an approved member of.

```typescript
const myCommunities = await getMyCommunities(user.id);
// Returns communities with userRole and userStatus populated
```

#### `getCommunityById(id: string, userId?: string): Promise<Community | null>`

Get single community with computed fields (member count, book count, user role).

```typescript
const community = await getCommunityById(communityId, userId);
console.log(community.memberCount); // Total approved members
console.log(community.bookCount);   // Total books shared
console.log(community.userRole);    // 'owner' | 'admin' | 'member' | undefined
```

#### `createCommunity(input: CreateCommunityInput): Promise<Community>`

Create a new community. Current user automatically becomes owner.

```typescript
interface CreateCommunityInput {
  name: string;
  description?: string;
  avatar_url?: string;
  is_private: boolean;
  requires_approval: boolean;
}

const community = await createCommunity({
  name: 'Book Club',
  description: 'Monthly book discussions',
  is_private: true,
  requires_approval: true,
});
```

**Auto-trigger:** Creator is automatically added as owner via database trigger.

#### `updateCommunity(id: string, input: UpdateCommunityInput): Promise<Community>`

Update community details (owner/admin only).

```typescript
const updated = await updateCommunity(communityId, {
  name: 'New Name',
  description: 'Updated description',
});
```

#### `deleteCommunity(id: string): Promise<void>`

Delete community (owner only). Cascades to members, books, activity.

```typescript
await deleteCommunity(communityId);
```

### Member Management

#### `getCommunityMembers(communityId: string): Promise<CommunityMember[]>`

Get all members of a community with user details.

```typescript
const members = await getCommunityMembers(communityId);
// Returns members with user object populated
```

#### `getPendingJoinRequests(communityId: string): Promise<CommunityMember[]>`

Get pending join requests (owner/admin only).

```typescript
const pending = await getPendingJoinRequests(communityId);
```

#### `joinCommunity(communityId: string, userId: string): Promise<void>`

Join a community or request to join.

```typescript
await joinCommunity(communityId, user.id);
// Status: 'approved' for public, 'pending' for private
```

**Auto-determines status:**
- Public communities → `approved`
- Private with `requires_approval: true` → `pending`
- Private with `requires_approval: false` → `approved`

#### `approveMember(communityId: string, userId: string): Promise<void>`

Approve pending member (owner/admin only).

```typescript
await approveMember(communityId, userId);
```

**Auto-trigger:** Creates `member_joined` activity.

#### `updateMemberRole(communityId: string, userId: string, role: 'admin' | 'member'): Promise<void>`

Promote/demote member (owner/admin only).

```typescript
await updateMemberRole(communityId, userId, 'admin'); // Promote
await updateMemberRole(communityId, userId, 'member'); // Demote
```

**Constraints:**
- Cannot change owner role (use `transferOwnership`)
- Only owner/admin can update roles

#### `removeMember(communityId: string, userId: string): Promise<void>`

Remove member from community (owner/admin only).

```typescript
await removeMember(communityId, userId);
```

**Constraints:**
- Cannot remove community owner
- Owner/admin can remove anyone except owner

#### `leaveCommunity(communityId: string, userId: string): Promise<void>`

Leave a community.

```typescript
await leaveCommunity(communityId, user.id);
```

**Protection:** Throws error if user is owner. Must transfer ownership first.

#### `transferOwnership(communityId: string, newOwnerId: string): Promise<void>`

Transfer ownership to another member (owner only).

```typescript
await transferOwnership(communityId, newOwnerId);
```

**Transaction-safe:**
1. Validates current owner
2. Verifies new owner is approved member
3. Updates current owner to 'admin'
4. Updates new owner to 'owner'
5. Rolls back on any error

### Book-Community Association

#### `getCommunityBooks(communityId: string, filters?: BookFilters): Promise<Book[]>`

Get all books in a community.

```typescript
const books = await getCommunityBooks(communityId);
const availableBooks = await getCommunityBooks(communityId, { borrowable: true });
```

#### `getBookCommunities(bookId: string): Promise<Community[]>`

Get all communities a book is shared in.

```typescript
const communities = await getBookCommunities(bookId);
```

#### `addBookToCommunity(bookId: string, communityId: string): Promise<void>`

Share a book in a community.

```typescript
await addBookToCommunity(bookId, communityId);
```

**Requirements:**
- User must own the book
- User must be approved member of community

**Auto-trigger:** Creates `book_added` activity.

#### `removeBookFromCommunity(bookId: string, communityId: string): Promise<void>`

Remove book from community.

```typescript
await removeBookFromCommunity(bookId, communityId);
```

**Allowed for:**
- Book owner
- Community owner/admin

### Activity Tracking

#### `getCommunityActivity(communityId: string, limit?: number): Promise<CommunityActivity[]>`

Get community activity feed.

```typescript
const recentActivity = await getCommunityActivity(communityId, 50);
// Returns activities with user details, sorted by created_at DESC
```

#### `createActivity(input: CreateActivityInput): Promise<void>`

Manually create activity record.

```typescript
await createActivity({
  community_id: communityId,
  type: 'review_posted',
  user_id: userId,
  metadata: { book_id, review_id, rating },
});
```

**Note:** Most activities are auto-created via triggers or mutation hooks.

---

## Frontend Implementation

### Pages

#### `/communities` - Communities.tsx

Main communities page with discovery and management.

**Features:**
- Tab navigation (Discover / My Communities)
- Search with 300ms debounce
- Community cards grid
- Create community button/modal
- Join functionality
- Loading and empty states

**Key Hooks:**
```typescript
const { data: allCommunities } = useCommunities({ search: debouncedSearch });
const { data: myCommunities } = useMyCommunities(user?.id);
const joinMutation = useJoinCommunity(user?.id);
```

#### `/communities/:id` - CommunityDetail.tsx

Detailed community view with tabs.

**Tabs:**
- Books - Grid of shared books
- Members - Member list with management
- Activity - Activity timeline
- Settings - Edit/delete (owner/admin only)

**Key Features:**
- Role-based UI (show/hide based on permissions)
- Pending requests section (owner/admin)
- Leave/Join toggle
- Member actions (promote, remove)
- Activity feed with icons

### Components

#### `CommunityCard.tsx`

Beautiful card component for community display.

**Props:**
```typescript
interface CommunityCardProps {
  community: Community;
  onJoin?: (communityId: string) => void;
  onView: (community: Community) => void;
  isJoining?: boolean;
}
```

**Features:**
- Gradient header with avatar
- Privacy badge (public/private)
- Member and book counts
- Join button or status badge
- Hover effects and transitions

#### `CreateCommunityModal.tsx`

Modal for creating new communities.

**Form Fields:**
- Name (required, min 3 chars)
- Description (optional, max 500 chars)
- Avatar URL (optional, validated URL)
- Is Private (checkbox)
- Requires Approval (checkbox, disabled if not private)

**Validation:** Zod schema from `lib/validations/community.ts`

#### `CommunitySettings.tsx`

Settings page for community management.

**Sections:**
1. Edit Community - Update details
2. Transfer Ownership - Member dropdown + confirmation
3. Danger Zone - Delete community

**Permissions:**
- Edit: Owner/Admin
- Transfer: Owner only
- Delete: Owner only

#### `BookCommunitySelector.tsx`

Multi-select component for book-community association.

**Props:**
```typescript
interface BookCommunitySelectorProps {
  userId: string | undefined;
  selectedCommunityIds: string[];
  onSelectionChange: (ids: string[]) => void;
  bookId?: string; // For edit mode
}
```

**Features:**
- Checkbox list of user's communities
- Shows current associations (edit mode)
- Loading states
- Empty state when no communities

#### `CommunityActivityFeed.tsx`

Timeline-style activity feed.

**Activity Types Rendered:**
- Member joined with user avatar
- Book added with book title
- Borrow created/returned
- Review posted with rating

**Features:**
- Relative timestamps ("2 hours ago")
- Type-specific icons and colors
- User avatars and names
- Metadata display
- Infinite scroll ready (with limit parameter)

### Hooks

All hooks use TanStack Query with proper cache management.

#### Query Hooks

```typescript
// Fetch communities
useCommunities(filters?: CommunityFilters)
useMyCommunities(userId: string | undefined)
useCommunity(id: string, userId?: string)

// Fetch members
useCommunityMembers(communityId: string)
usePendingJoinRequests(communityId: string)

// Fetch books
useCommunityBooks(communityId: string)

// Fetch activity
useCommunityActivity(communityId: string, limit?: number)
```

#### Mutation Hooks

```typescript
// Community mutations
useCreateCommunity(userId: string | undefined)
useUpdateCommunity()
useDeleteCommunity(userId: string | undefined)

// Member mutations
useJoinCommunity(userId: string | undefined)
useApproveMember()
useRemoveMember()
useLeaveCommunity()
useUpdateMemberRole()
useTransferOwnership()

// Book mutations
useAddBookToCommunity()
useRemoveBookFromCommunity()

// Activity mutations
useCreateActivity()
```

#### Query Key Factory

```typescript
export const communityKeys = {
  all: ['communities'] as const,
  lists: () => [...communityKeys.all, 'list'] as const,
  list: (filters?: CommunityFilters) => [...communityKeys.lists(), filters] as const,
  myCommunities: (userId: string) => [...communityKeys.all, 'my', userId] as const,
  details: () => [...communityKeys.all, 'detail'] as const,
  detail: (id: string) => [...communityKeys.details(), id] as const,
  members: (id: string) => [...communityKeys.detail(id), 'members'] as const,
  activity: (id: string) => [...communityKeys.detail(id), 'activity'] as const,
  books: (id: string) => [...communityKeys.detail(id), 'books'] as const,
};
```

**Cache Invalidation Strategy:**
- Mutations invalidate related queries
- List queries invalidated on create/delete
- Detail queries invalidated on update
- Aggressive invalidation for consistency

### Validation

Zod schemas in `lib/validations/community.ts`:

```typescript
export const createCommunitySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  is_private: z.boolean(),
  requires_approval: z.boolean(),
});

export const editCommunitySchema = createCommunitySchema.partial().required({
  name: true,
});
```

### Integration Points

#### Browse Page Filter

```typescript
// In Browse.tsx
const [selectedCommunityId, setSelectedCommunityId] = useState<string>('all');

// Filter dropdown in BookFilters.tsx
<Select value={communityFilter} onValueChange={setCommunityFilter}>
  <SelectItem value="all">All Books</SelectItem>
  <SelectItem value="my-communities">My Communities</SelectItem>
  {myCommunities.map(c => (
    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
  ))}
</Select>
```

#### AddBookForm Integration

```typescript
// State for selected communities
const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);

// After book creation
if (selectedCommunityIds.length > 0) {
  await Promise.all(
    selectedCommunityIds.map(communityId =>
      addBookToCommunityMutation.mutateAsync({
        bookId: newBook.id,
        communityId,
      })
    )
  );
}
```

---

## Security & Permissions

### Row Level Security (RLS)

All tables have RLS enabled with comprehensive policies.

#### Communities Table Policies

```sql
-- View: Public communities OR member of private community
CREATE POLICY "Anyone can view public communities"
  ON communities FOR SELECT
  USING (
    is_private = false
    OR EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = id
      AND cm.user_id = auth.uid()
      AND cm.status = 'approved'
    )
  );

-- Create: Authenticated users
CREATE POLICY "Authenticated users can create communities"
  ON communities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Update: Owners and admins only
CREATE POLICY "Owners and admins can update communities"
  ON communities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'approved'
    )
  );

-- Delete: Owners only
CREATE POLICY "Owners can delete communities"
  ON communities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = id
      AND cm.user_id = auth.uid()
      AND cm.role = 'owner'
      AND cm.status = 'approved'
    )
  );
```

#### Community Members Table Policies

```sql
-- View: Members of the community OR viewing own membership
CREATE POLICY "Members can view members in their communities"
  ON community_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'approved'
    )
    OR user_id = auth.uid()
  );

-- Insert: Users can join (status determined by community settings)
CREATE POLICY "Users can join communities"
  ON community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update: Owners and admins can manage members
CREATE POLICY "Owners and admins can update members"
  ON community_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'approved'
    )
  );

-- Delete: Members can leave OR owners/admins can remove
CREATE POLICY "Members can leave communities"
  ON community_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'approved'
    )
  );
```

### Permission Checks

#### Frontend Permission Guards

```typescript
// In components
const canManageMembers = community.userRole === 'owner' || community.userRole === 'admin';
const canDelete = community.userRole === 'owner';
const canTransfer = community.userRole === 'owner';

// Conditional rendering
{canManageMembers && <MemberManagementUI />}
{canDelete && <DeleteButton />}
```

#### Backend Validation

```typescript
// In API functions
export async function deleteCommunity(id: string): Promise<void> {
  // RLS policy ensures only owner can delete
  const { error } = await supabase
    .from('communities')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
```

### Database Triggers for Security

```sql
-- Auto-add creator as owner (prevents orphaned communities)
CREATE TRIGGER add_creator_as_owner
  AFTER INSERT ON communities
  FOR EACH ROW
  EXECUTE FUNCTION add_community_creator_as_owner();

-- Function
CREATE OR REPLACE FUNCTION add_community_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO community_members (community_id, user_id, role, status)
  VALUES (NEW.id, NEW.created_by, 'owner', 'approved');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Activity Tracking

### Auto-Tracked Activities

#### 1. Member Joined

**Trigger:** When member status changes to 'approved'

```sql
CREATE TRIGGER create_member_joined_activity_trigger
  AFTER INSERT OR UPDATE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION create_member_joined_activity();
```

#### 2. Book Added

**Trigger:** When book is added to community

```sql
CREATE TRIGGER create_book_added_activity_trigger
  AFTER INSERT ON book_communities
  FOR EACH ROW
  EXECUTE FUNCTION create_book_added_activity();
```

### Manually Tracked Activities

#### 3. Borrow Created

**Location:** `apps/web/src/hooks/useBorrowRequests.ts`

```typescript
export function useCreateBorrowRequest(userId: string | undefined) {
  const createActivityMutation = useCreateActivity();

  return useMutation({
    mutationFn: createBorrowRequest,
    onSuccess: async (newRequest, input) => {
      // Get book communities
      const communities = await getBookCommunities(input.book_id);

      // Create activity for each community
      await Promise.all(
        communities.map(community =>
          createActivityMutation.mutateAsync({
            community_id: community.id,
            type: 'borrow_created',
            user_id: userId!,
            metadata: {
              book_id: input.book_id,
              borrower_id: userId,
              book_title: input.book_title,
            },
          })
        )
      );
    },
  });
}
```

#### 4. Borrow Returned

**Location:** `apps/web/src/hooks/useBorrowRequests.ts`

```typescript
export function useReturnBook() {
  const createActivityMutation = useCreateActivity();

  return useMutation({
    mutationFn: async ({ requestId, userId }: { requestId: string; userId: string }) => {
      // Get request details
      const request = await getBorrowRequestById(requestId);

      // Calculate duration
      const borrowedDate = new Date(request.approved_at!);
      const returnedDate = new Date();
      const duration = Math.ceil((returnedDate.getTime() - borrowedDate.getTime()) / (1000 * 60 * 60 * 24));

      // Mark as returned
      await returnBook(requestId);

      return { request, duration };
    },
    onSuccess: async ({ request, duration }, variables) => {
      // Get book communities
      const communities = await getBookCommunities(request.book_id);

      // Create activity
      await Promise.all(
        communities.map(community =>
          createActivityMutation.mutateAsync({
            community_id: community.id,
            type: 'borrow_returned',
            user_id: variables.userId,
            metadata: {
              book_id: request.book_id,
              borrower_id: variables.userId,
              book_title: request.book?.title,
              duration_days: duration,
            },
          })
        )
      );
    },
  });
}
```

#### 5. Review Posted

**Location:** `apps/web/src/hooks/useReviews.ts`

```typescript
export function useCreateReview() {
  const createActivityMutation = useCreateActivity();

  return useMutation({
    mutationFn: createReview,
    onSuccess: async (newReview, input) => {
      // Get book communities
      const communities = await getBookCommunities(input.book_id);

      // Create activity
      await Promise.all(
        communities.map(community =>
          createActivityMutation.mutateAsync({
            community_id: community.id,
            type: 'review_posted',
            user_id: input.user_id,
            metadata: {
              book_id: input.book_id,
              review_id: newReview.id,
              rating: input.rating,
            },
          })
        )
      );
    },
  });
}
```

---

## Testing

### Unit Tests

Test API functions in isolation:

```typescript
// __tests__/communities.test.ts
describe('getCommunities', () => {
  it('should return all public communities', async () => {
    const communities = await getCommunities();
    expect(communities).toBeDefined();
    expect(Array.isArray(communities)).toBe(true);
  });

  it('should filter by search term', async () => {
    const communities = await getCommunities({ search: 'book' });
    expect(communities.every(c =>
      c.name.toLowerCase().includes('book') ||
      c.description?.toLowerCase().includes('book')
    )).toBe(true);
  });
});
```

### Integration Tests

Test full workflows:

```typescript
describe('Community Workflow', () => {
  it('should create community and add creator as owner', async () => {
    // Create community
    const community = await createCommunity({
      name: 'Test Community',
      is_private: false,
      requires_approval: false,
    });

    // Verify creator is owner
    const members = await getCommunityMembers(community.id);
    const owner = members.find(m => m.role === 'owner');

    expect(owner).toBeDefined();
    expect(owner!.user_id).toBe(currentUser.id);
    expect(owner!.status).toBe('approved');
  });
});
```

### E2E Tests (Playwright)

Test user flows:

```typescript
test('User can create and join communities', async ({ page }) => {
  // Navigate to communities
  await page.goto('/communities');

  // Create community
  await page.click('text=Create Community');
  await page.fill('[name="name"]', 'Test Community');
  await page.click('text=Create');

  // Verify in "My Communities"
  await page.click('text=My Communities');
  await expect(page.locator('text=Test Community')).toBeVisible();
});
```

---

## Performance Considerations

### Database Optimization

1. **Indexes**: All foreign keys and frequently queried columns indexed
2. **Full-Text Search**: GIN index on community name/description
3. **Query Optimization**: Use `select(*)` with specific fields for large tables
4. **Cascade Deletes**: Foreign keys with ON DELETE CASCADE reduce orphaned records

### Frontend Optimization

1. **Query Caching**: TanStack Query caches responses, reduces API calls
2. **Debounced Search**: 300ms debounce on search input
3. **Pagination Ready**: Activity feed supports limit parameter
4. **Optimistic Updates**: UI updates immediately, rollback on error
5. **Code Splitting**: Lazy load community pages

### API Optimization

1. **Batch Operations**: `Promise.all()` for parallel requests
2. **Selective Queries**: Only fetch needed fields
3. **Computed Fields**: Member/book counts calculated at query time
4. **N+1 Prevention**: Use joins to fetch related data

---

## Future Enhancements

### Near-Term (< 1 month)

- [ ] Community invitations via email/link
- [ ] Community search improvements (tags, categories)
- [ ] Real-time activity updates (Supabase Realtime)
- [ ] Community avatars with image upload
- [ ] Member notifications for community events

### Mid-Term (1-3 months)

- [ ] Community discovery algorithm (recommendations)
- [ ] Community analytics (growth, engagement metrics)
- [ ] Featured communities section
- [ ] Community moderators role (between admin and member)
- [ ] Rich activity feed (images, previews)

### Long-Term (3+ months)

- [ ] Sub-communities / nested communities
- [ ] Community events and calendar
- [ ] Community-specific discussions/forums
- [ ] Community badges and achievements
- [ ] Export community data
- [ ] Community migration/merger tools

---

## Migration Guide

### Running the Migration

**Location:** `packages/api-client/migrations/014_create_communities_tables.sql`

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy migration SQL
3. Paste and execute
4. Verify 4 tables created
5. Test RLS policies work

**Rollback (if needed):**
```sql
DROP TABLE IF EXISTS community_activity CASCADE;
DROP TABLE IF EXISTS book_communities CASCADE;
DROP TABLE IF EXISTS community_members CASCADE;
DROP TABLE IF EXISTS communities CASCADE;

DROP FUNCTION IF EXISTS add_community_creator_as_owner CASCADE;
DROP FUNCTION IF EXISTS create_member_joined_activity CASCADE;
DROP FUNCTION IF EXISTS create_book_added_activity CASCADE;
```

### Data Migration

If migrating existing data:

```sql
-- Example: Migrate legacy groups to communities
INSERT INTO communities (id, name, description, created_by, is_private)
SELECT id, group_name, group_desc, owner_id, is_private
FROM legacy_groups;

-- Migrate group members
INSERT INTO community_members (community_id, user_id, role, status)
SELECT group_id, user_id,
  CASE
    WHEN is_admin THEN 'admin'::text
    ELSE 'member'::text
  END,
  'approved'::text
FROM legacy_group_members;
```

---

## Troubleshooting

### Common Issues

**Issue:** "relation public.community_members does not exist"
- **Cause:** Migration not run or failed partway through
- **Solution:** Run fixed migration (creates tables before policies)

**Issue:** User can't see private community they're member of
- **Cause:** Member status is 'pending', not 'approved'
- **Solution:** Community owner must approve the member

**Issue:** Activity feed not showing borrow/return events
- **Cause:** Activity hooks not integrated in mutation hooks
- **Solution:** Verify `useCreateActivity` is called in mutation `onSuccess`

**Issue:** Book not appearing in community
- **Cause:** User not approved member or book not associated
- **Solution:** Check `book_communities` table for association

### Debugging Tools

```typescript
// Log query cache state
console.log(queryClient.getQueryData(communityKeys.list()));

// Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'communities';

// Verify user role
SELECT * FROM community_members
WHERE community_id = '<id>' AND user_id = auth.uid();
```

---

## Support & Resources

- **GitHub Repository:** [BookShare Repo](https://github.com/MahdiMurshed/bookshare)
- **Branch:** `claude/communities-01K9V1XHuo14R2J2r2CxrBYC`
- **Migration File:** `packages/api-client/migrations/014_create_communities_tables.sql`
- **User Guide:** `docs/communities_user_guide.md`

---

**Last Updated:** November 2025
**Version:** 1.0.0
**Author:** MahdiMurshed
