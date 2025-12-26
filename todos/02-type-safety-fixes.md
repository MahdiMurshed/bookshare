# Type Safety Fixes

Fix all `any` types and improve type safety across the codebase.

**Current Score:** 7/10
**Target Score:** 9/10

---

## HIGH Severity (API Client)

### Task 1: Type recentBooks in admin.ts (Line 420)

**File:** `packages/api-client/src/admin.ts:420`
**Current:**
```typescript
...recentBooks.map((book: any) => {
```

**Fix:**
```typescript
interface RecentBookQuery {
  id: string;
  title: string;
  owner_id: string;
  created_at: string;
  owner: { name: string; email: string } | null;
}

...recentBooks.map((book: RecentBookQuery) => {
```

---

### Task 2: Type book mapping in admin.ts (Line 1225)

**File:** `packages/api-client/src/admin.ts:1225`
**Current:**
```typescript
books.map(async (book: any)
```

**Fix:** Define proper Supabase response type with joins.

---

### Task 3: Type community mapping in admin.ts (Line 1514)

**File:** `packages/api-client/src/admin.ts:1514`
**Current:**
```typescript
(communities || []).map(async (community: any)
```

**Fix:** Define `CommunityWithMembers` type.

---

### Task 4: Type recentRequests in admin.ts (Line 458)

**File:** `packages/api-client/src/admin.ts:458`
**Current:**
```typescript
for (const request of recentRequests as any[]) {
```

**Fix:**
```typescript
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

## MEDIUM Severity (Communities/External APIs)

### Task 5: Type CommunityActivity metadata (Line 78)

**File:** `packages/api-client/src/communities.ts:78`
**Current:**
```typescript
metadata: any;
```

**Fix:**
```typescript
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
  [key: string]: unknown; // Allow extension
}

metadata: CommunityActivityMetadata;
```

---

### Task 6: Type optional metadata (Line 119)

**File:** `packages/api-client/src/communities.ts:119`
**Current:**
```typescript
metadata?: any;
```

**Fix:** Use same `CommunityActivityMetadata` type.

---

### Task 7: Type membership mapping (Line 185)

**File:** `packages/api-client/src/communities.ts:185`
**Current:**
```typescript
.map((item: any) => ({
```

**Fix:**
```typescript
interface MembershipWithCommunity {
  role: 'owner' | 'admin' | 'member';
  status: 'approved' | 'pending';
  communities: Community;
}

const typedData = data as MembershipWithCommunity[] | null;
return (typedData || []).map((item) => ({
```

---

### Task 8: Type books mapping (Line 603)

**File:** `packages/api-client/src/communities.ts:603`
**Current:**
```typescript
.map((item: any) => item.books)
```

**Fix:** Define proper join result type.

---

### Task 9: Type communities mapping (Line 620)

**File:** `packages/api-client/src/communities.ts:620`
**Current:**
```typescript
.map((item: any) => item.communities)
```

**Fix:** Define proper join result type.

---

### Task 10: Type Google Books API response (Line 44)

**File:** `packages/api-client/src/bookSearch.ts:44`
**Current:**
```typescript
data.items.map((item: any) => {
```

**Fix:**
```typescript
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

interface GoogleBooksResponse {
  items?: GoogleBooksItem[];
  totalItems: number;
}

return (data as GoogleBooksResponse).items?.map((item) => {
```

---

## LOW Severity (Charts)

### Task 11: Type Recharts data (Line 94)

**File:** `apps/web/src/components/Admin/AdminCharts.tsx:94`
**Current:**
```typescript
data={data as any}
```

**Fix:**
```typescript
interface ChartDataEntry {
  name: string;
  value: number;
  fill?: string;
}

data={data as ChartDataEntry[]}
```

---

### Task 12: Type Recharts label function (Line 98)

**File:** `apps/web/src/components/Admin/AdminCharts.tsx:98`
**Current:**
```typescript
label={(entry: any) =>
```

**Fix:**
```typescript
label={(entry: { name: string; percent?: number }) =>
```

---

## New Types to Create

### File: `packages/api-client/src/supabase-types.ts`

```typescript
/**
 * Supabase query result types for joined queries
 * These types represent the shape of data returned from Supabase
 * when using .select() with related table joins.
 */

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

export interface SupabaseRelatedCommunity {
  id: string;
  name: string;
  description: string | null;
}
```

### File: `apps/web/src/types/charts.ts`

```typescript
/**
 * Chart component types for Recharts
 */

export interface ChartDataEntry {
  name: string;
  value: number;
  fill?: string;
}

export interface GenreDistributionEntry extends ChartDataEntry {
  genre: string;
  percent?: number;
}
```

---

## Summary

| Severity | Count | Files |
|----------|-------|-------|
| HIGH | 4 | admin.ts |
| MEDIUM | 6 | communities.ts, bookSearch.ts |
| LOW | 2 | AdminCharts.tsx |
| **Total** | **12** | |

**Estimated Effort:** 2-3 hours

## Verification Checklist

After completing all tasks:
- [ ] Run `pnpm type-check` - no errors
- [ ] Run `pnpm lint` - no new warnings
- [ ] Search for `as any` - should return 0 results
- [ ] Search for `: any` - should return 0 results in src/
