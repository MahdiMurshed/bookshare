# Type Safety Audit

## CRITICAL - `any` Type Usage

### Occurrences Found

| File | Line | Code | Severity |
|------|------|------|----------|
| `packages/api-client/src/admin.ts` | 420 | `recentBooks.map((book: any)` | HIGH |
| `packages/api-client/src/admin.ts` | 1225 | `books.map(async (book: any)` | HIGH |
| `packages/api-client/src/admin.ts` | 1514 | `(communities \|\| []).map(async (community: any)` | HIGH |
| `packages/api-client/src/admin.ts` | 458 | `for (const request of recentRequests as any[])` | HIGH |
| `packages/api-client/src/communities.ts` | 78 | `metadata: any;` | MEDIUM |
| `packages/api-client/src/communities.ts` | 119 | `metadata?: any;` | MEDIUM |
| `packages/api-client/src/communities.ts` | 185 | `.map((item: any) => ({` | MEDIUM |
| `packages/api-client/src/communities.ts` | 603 | `.map((item: any) => item.books)` | MEDIUM |
| `packages/api-client/src/communities.ts` | 620 | `.map((item: any) => item.communities)` | MEDIUM |
| `packages/api-client/src/bookSearch.ts` | 44 | `data.items.map((item: any) => {` | MEDIUM |
| `apps/web/src/components/Admin/AdminCharts.tsx` | 98 | `label={(entry: any) =>` | LOW |
| `apps/web/src/components/Admin/AdminCharts.tsx` | 94 | `data={data as any}` | LOW |

---

## Detailed Fixes

### 1. admin.ts - Book Mapping (Line 420)
```typescript
// Current
...recentBooks.map((book: any) => {

// Fix: Define proper type
interface RecentBookQuery {
  id: string;
  title: string;
  owner_id: string;
  created_at: string;
  owner: { name: string; email: string } | null;
}

...recentBooks.map((book: RecentBookQuery) => {
```

### 2. communities.ts - Metadata Type (Lines 78, 119)
```typescript
// Current
metadata: any;

// Fix: Define structured metadata type
interface CommunityActivityMetadata {
  book_id?: string;
  book_title?: string;
  user_id?: string;
  user_name?: string;
  borrower_id?: string;
  duration_days?: number;
  role?: 'admin' | 'member';
  old_role?: string;
  new_role?: string;
  [key: string]: unknown;  // Allow extension but typed
}

metadata: CommunityActivityMetadata;
```

### 3. communities.ts - Supabase Response Mapping (Lines 185, 603, 620)
```typescript
// Current
return (data || []).map((item: any) => ({

// Fix: Type the Supabase response
interface MembershipWithCommunity {
  role: 'owner' | 'admin' | 'member';
  status: 'approved' | 'pending';
  communities: Community;
}

const typedData = data as MembershipWithCommunity[] | null;
return (typedData || []).map((item) => ({
  ...item.communities,
  userRole: item.role,
  userStatus: item.status,
}));
```

### 4. bookSearch.ts - Google Books API Response (Line 44)
```typescript
// Current
return data.items.map((item: any) => {

// Fix: Define Google Books API types
interface GoogleBooksVolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  categories?: string[];
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
}

interface GoogleBooksItem {
  id: string;
  volumeInfo: GoogleBooksVolumeInfo;
}

return data.items.map((item: GoogleBooksItem) => {
```

### 5. AdminCharts.tsx - Recharts Label (Lines 94, 98)
```typescript
// Current
data={data as any}
label={(entry: any) =>

// Fix: Import proper types from recharts
import type { PieProps } from 'recharts';

interface ChartEntry {
  name: string;
  value: number;
}

data={data as ChartEntry[]}
label={(entry: ChartEntry) =>
```

---

## Type Assertions (`as`) Usage

### Occurrences Found

| File | Line | Usage | Risk |
|------|------|-------|------|
| `packages/api-client/src/books.ts` | 75 | `// const params = new URLSearchParams(filters as any);` | Commented - OK |
| `packages/api-client/src/admin.ts` | 458 | `for (const request of recentRequests as any[])` | HIGH |

### Fix for admin.ts Line 458
```typescript
// Current
for (const request of recentRequests as any[]) {

// Fix: Define the expected type
interface RecentRequestWithRelations {
  id: string;
  book_id: string;
  borrower_id: string;
  owner_id: string;
  status: BorrowRequestStatus;
  created_at: string;
  borrower: { name: string; email: string } | null;
  owner: { name: string; email: string } | null;
  book: { title: string } | null;
}

for (const request of recentRequests as RecentRequestWithRelations[]) {
```

---

## Missing Return Types

### Files Without Explicit Return Types on Exported Functions

Most functions properly return typed Promises. No significant issues found.

**Good Pattern Example:**
```typescript
// packages/api-client/src/communities.ts:147
export async function getCommunities(filters?: CommunityFilters): Promise<Community[]>
```

---

## Loose Types Found

### `Record<string, unknown>` Usage

| File | Line | Usage |
|------|------|-------|
| `packages/api-client/src/types.ts` | 206 | `payload: Record<string, unknown> \| null` |
| `packages/api-client/src/types.ts` | 255 | `metadata: Record<string, unknown> \| null` |

**Assessment:** These are acceptable for JSON data columns that can contain varying structures. Consider creating specific types for known payload shapes.

---

## Recommendations

### Priority 1: Fix `any` Types in API Client
1. Create proper types for Supabase query results
2. Type Google Books API responses
3. Define metadata structure types

### Priority 2: Create Shared Response Types
```typescript
// packages/api-client/src/supabase-types.ts
export interface SupabaseRelatedBook {
  id: string;
  title: string;
  author: string;
  cover_image_url: string | null;
}

export interface SupabaseRelatedUser {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
}
```

### Priority 3: Add Recharts Type Definitions
```typescript
// apps/web/src/types/charts.ts
export interface ChartDataEntry {
  name: string;
  value: number;
  fill?: string;
}
```

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| `any` types | 12 | 4 HIGH, 5 MEDIUM, 3 LOW |
| `as any` assertions | 7 | 1 HIGH (rest commented) |
| Missing return types | 0 | N/A |
| Loose `Record` types | 2 | LOW |

**Overall Type Safety Score: 7/10**

The codebase is generally well-typed. Main issues are in the API client where Supabase query results aren't properly typed after `.select()` with joins.
