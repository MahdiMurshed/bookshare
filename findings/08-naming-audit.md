# Naming Audit

## Files Naming Convention Check

### Component Files (PascalCase.tsx) ✓

All component files follow PascalCase convention:
- `AdminAnalyticsTab.tsx` ✓
- `BookCard.tsx` ✓
- `AddBookForm.tsx` ✓
- `CommunitySettings.tsx` ✓

### Page Files (PascalCase.tsx) ✓

All page files follow PascalCase convention:
- `Home.tsx` ✓
- `Browse.tsx` ✓
- `MyLibrary.tsx` ✓
- `CommunityDetail.tsx` ✓

### Hook Files (camelCase with use prefix) ✓

All hook files follow convention:
- `useBooks.ts` ✓
- `useBorrowRequests.ts` ✓
- `useNotifications.ts` ✓
- `useCommunities.ts` ✓

### Utility Files (camelCase.ts) ✓

- `errors.ts` ✓

### Constant Files (lowercase.ts) ✓

- `book.ts` ✓
- `notification.ts` ✓
- `status.ts` ✓
- `ui.ts` ✓

---

## Code Naming Convention Check

### Components (PascalCase) ✓

```typescript
export function AddBookForm({ ... })  ✓
export function BookFilters({ ... })  ✓
export function Header() { ... }  ✓
```

### Functions (camelCase, verb+noun) ✓

```typescript
// Good patterns found:
getBooks()  ✓
createBook()  ✓
updateBook()  ✓
deleteBook()  ✓
getErrorMessage()  ✓
handleSubmit()  ✓
handleApproveClick()  ✓
```

### Constants (SCREAMING_SNAKE_CASE) ✓

```typescript
export const BOOK_GENRES = [...]  ✓
export const BOOK_CONDITIONS = [...]  ✓
export const BORROW_REQUEST_STATUSES = [...]  ✓
```

### Booleans (is/has/should prefix) - MIXED

**Good:**
```typescript
isLoading  ✓
isAdmin  ✓
isPending  ✓
isActive  ✓
```

**Needs Improvement:**
```typescript
// FILE: apps/web/src/pages/Browse.tsx:27
const [availableOnly, setAvailableOnly] = useState(false);
// Better: showAvailableOnly or isAvailableOnlyFilter

// FILE: apps/web/src/components/Header.tsx:59
const [scrolled, setScrolled] = useState(false);
// Better: isScrolled
```

### Event Handlers (handle prefix) ✓

```typescript
handleSignOut()  ✓
handleApprove()  ✓
handleDeny()  ✓
handleBookClick()  ✓
handleFormSubmit()  ✓
```

### Types/Interfaces (PascalCase, no I prefix) ✓

```typescript
interface Book { ... }  ✓
interface User { ... }  ✓
interface BorrowRequest { ... }  ✓
type NotificationType = ...  ✓
```

No `IBook` or `IUser` prefixes found.

### Props Interfaces (ComponentNameProps) ✓

```typescript
interface AddBookFormProps { ... }  ✓
interface BookFiltersProps { ... }  ✓
interface AuthContextType { ... }  ✓
```

### Input Types (Suffix with Input) ✓

```typescript
interface CreateBookInput { ... }  ✓
interface UpdateBookInput { ... }  ✓
interface CreateCommunityInput { ... }  ✓
```

### Filter Types (Suffix with Filters) ✓

```typescript
interface CommunityFilters { ... }  ✓
interface BookFilters { ... }  // Used as component, also works
```

---

## Naming Violations

### VIOLATION 1: Generic Variable Names

**FILE:** `apps/web/src/pages/Browse.tsx:68-71`
```typescript
const books = shouldUseAllBooks
  ? allBooksQuery.data || []
  : specificCommunityId
  ? communityBooksQuery.data || []
  : myCommunityBooks;
```

**Issue:** Variable name `books` is too generic for filtered/selected books.
**Better:** `displayedBooks` or `selectedBooks`

---

### VIOLATION 2: Unclear Abbreviations

**FILE:** Various
```typescript
const { data: incomingRequests = [], isLoading: incomingLoading }
```

**Issue:** `incomingLoading` is fine, but consistency matters.
**Pattern:** Consider `isIncomingLoading` for boolean consistency.

---

### VIOLATION 3: Boolean Without Prefix

**FILE:** `apps/web/src/pages/Browse.tsx:27`
```typescript
const [availableOnly, setAvailableOnly] = useState(false);
```

**Better:**
```typescript
const [showAvailableOnly, setShowAvailableOnly] = useState(false);
// or
const [isAvailableOnlyEnabled, setIsAvailableOnlyEnabled] = useState(false);
```

---

### VIOLATION 4: scrolled Boolean

**FILE:** `apps/web/src/components/Header.tsx:59`
```typescript
const [scrolled, setScrolled] = useState(false);
```

**Better:**
```typescript
const [isScrolled, setIsScrolled] = useState(false);
// or
const [hasScrolled, setHasScrolled] = useState(false);
```

---

## Query Keys Naming ✓

All query key factories follow consistent patterns:
```typescript
export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (userId: string) => [...bookKeys.lists(), userId] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
};
```

---

## API Function Naming ✓

CRUD operations follow convention:
```typescript
getBooks()      // Read collection
getBook(id)     // Read single
createBook()    // Create
updateBook()    // Update
deleteBook()    // Delete
```

---

## Summary

| Category | Status |
|----------|--------|
| File naming | EXCELLENT |
| Component naming | EXCELLENT |
| Function naming | EXCELLENT |
| Constant naming | EXCELLENT |
| Boolean naming | NEEDS MINOR FIXES |
| Type/Interface naming | EXCELLENT |
| Query keys | EXCELLENT |
| API functions | EXCELLENT |

**Overall Naming Score: 9/10**

**Minor Fixes Needed:**
1. `scrolled` → `isScrolled`
2. `availableOnly` → `showAvailableOnly`
3. `books` (generic) → `displayedBooks` (specific)
