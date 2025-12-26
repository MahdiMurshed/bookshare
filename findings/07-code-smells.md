# Code Smells Audit

## SMELL 1: Magic Numbers/Strings

### Occurrences Found

**FILE:** `apps/web/src/pages/Browse.tsx:35`
```typescript
}, 300);  // Magic number for debounce delay
```

**FIX:**
```typescript
// lib/constants/ui.ts
export const DEBOUNCE_DELAY_MS = 300;

// Usage
import { DEBOUNCE_DELAY_MS } from '../lib/constants/ui';
}, DEBOUNCE_DELAY_MS);
```

---

**FILE:** `apps/web/src/pages/Notifications.tsx`
Multiple inline status checks:
```typescript
r.status === 'pending'
r.status === 'approved'
r.status === 'borrowed'
```

**Assessment:** These use the exported `BORROW_REQUEST_STATUSES` constant, which is good. The string literals are acceptable when checking against typed status values.

---

**FILE:** `apps/web/src/components/Header.tsx:64`
```typescript
setScrolled(window.scrollY > 10);
```

**FIX:**
```typescript
const SCROLL_THRESHOLD = 10;
setScrolled(window.scrollY > SCROLL_THRESHOLD);
```

---

## SMELL 2: Data Clumps

### Filter State Pattern
The same group of filter variables appear together multiple times:

**FILE:** `apps/web/src/pages/Browse.tsx:24-29`
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [genreFilter, setGenreFilter] = useState<string>('all');
const [conditionFilter, setConditionFilter] = useState<string>('all');
const [availableOnly, setAvailableOnly] = useState(false);
const [communityFilter, setCommunityFilter] = useState<string>('all');
```

**FIX:** Create a unified filter state type and hook:
```typescript
interface BookFilterState {
  searchQuery: string;
  genreFilter: string;
  conditionFilter: string;
  availableOnly: boolean;
  communityFilter: string;
}

// Custom hook
function useBookFilters() {
  const [filters, setFilters] = useState<BookFilterState>({
    searchQuery: '',
    genreFilter: 'all',
    conditionFilter: 'all',
    availableOnly: false,
    communityFilter: 'all',
  });

  const updateFilter = <K extends keyof BookFilterState>(
    key: K,
    value: BookFilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return { filters, updateFilter, setFilters };
}
```

---

### Request Dialog State Pattern

**FILE:** `apps/web/src/pages/Requests.tsx:33-37`
```typescript
const [selectedRequest, setSelectedRequest] = useState<BorrowRequestWithDetails | null>(null);
const [approveDialogOpen, setApproveDialogOpen] = useState(false);
const [denyDialogOpen, setDenyDialogOpen] = useState(false);
const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
const [returnDialogOpen, setReturnDialogOpen] = useState(false);
```

**FIX:** Use a single dialog state:
```typescript
type DialogType = 'approve' | 'deny' | 'tracking' | 'return' | null;

interface DialogState {
  type: DialogType;
  request: BorrowRequestWithDetails | null;
}

const [dialog, setDialog] = useState<DialogState>({ type: null, request: null });

// Open dialog
const openDialog = (type: DialogType, request: BorrowRequestWithDetails) => {
  setDialog({ type, request });
};

// Close dialog
const closeDialog = () => {
  setDialog({ type: null, request: null });
};
```

---

## SMELL 3: Long Parameter Lists

**FILE:** `apps/web/src/pages/Requests.tsx:119-124`
```typescript
const handleApprove = async (
  dueDate: string,
  handoverMethod: HandoverMethod,
  handoverDetails: { address?: string; datetime?: string; instructions?: string },
  message?: string
) => {
```

**Assessment:** 4 parameters, with one already being an object. This is borderline acceptable. The `handoverDetails` object pattern is good.

---

**FILE:** `apps/web/src/components/Browse/BookFilters.tsx`
Props interface has 13 properties.

**FIX:** Group related props:
```typescript
interface BookFiltersProps {
  filters: {
    searchQuery: string;
    genreFilter: string;
    conditionFilter: string;
    availableOnly: boolean;
    communityFilter: string;
  };
  onChange: {
    onSearchChange: (value: string) => void;
    onGenreChange: (value: string) => void;
    onConditionChange: (value: string) => void;
    onAvailableOnlyChange: (value: boolean) => void;
    onCommunityChange: (value: string) => void;
  };
  userCommunities: Community[];
  onClearFilters: () => void;
  activeFilterCount: number;
}
```

---

## SMELL 4: Long Method Chains

### Supabase Query Chains
**FILE:** `packages/api-client/src/communities.ts:172-180`
```typescript
const { data, error } = await supabase
  .from('community_members')
  .select(`
    role,
    status,
    communities (*)
  `)
  .eq('user_id', userId)
  .eq('status', 'approved');
```

**Assessment:** This is the standard Supabase query builder pattern. Acceptable and readable.

---

## SMELL 5: Feature Envy

### BorrowRequests Hook Notifications
**FILE:** `apps/web/src/hooks/useBorrowRequests.ts:98-106`
```typescript
onSuccess: async (request: BorrowRequest) => {
  // ... cache invalidation

  // Send notification to borrower
  try {
    await notifyRequestApproved(
      request.borrower_id,
      request.owner_id,
      request.book_id
    );
  } catch (error) {
    logError(error, 'sending approval notification');
  }
}
```

**Assessment:** The mutation hook is doing notification work that could belong elsewhere. Consider:
1. Server-side trigger for notifications
2. Separate notification hook
3. Event-based pattern

---

## SMELL 6: Boolean Parameters

### Limited Occurrences

**FILE:** `packages/api-client/src/communities.ts:97`
```typescript
is_private: boolean;
requires_approval: boolean;
```

**Assessment:** These are data model properties, not function parameters. Acceptable.

---

## SMELL 7: Primitive Obsession

### Status Strings
The codebase properly uses typed string unions:
```typescript
export type BorrowRequestStatus = 'pending' | 'approved' | 'denied' | 'borrowed' | 'returned' | 'cancelled';
```

**Assessment:** Good pattern. No primitive obsession issues.

---

## SMELL 8: Nested Callbacks

### No Callback Hell Found
The codebase uses async/await consistently. No deeply nested callback patterns found.

---

## Summary

| Code Smell | Occurrences | Severity | Priority |
|------------|-------------|----------|----------|
| Magic numbers | 2-3 | LOW | LOW |
| Data clumps | 2 patterns | MEDIUM | MEDIUM |
| Long param lists | 1-2 | LOW | LOW |
| Feature envy | 1 | MEDIUM | MEDIUM |
| Long chains | Many | LOW | ACCEPTABLE |
| Boolean params | 0 issues | N/A | N/A |
| Primitive obsession | 0 issues | N/A | N/A |
| Nested callbacks | 0 issues | N/A | N/A |

**Recommendations:**
1. Extract filter state to custom hook (data clump fix)
2. Consolidate dialog state (data clump fix)
3. Consider moving notification side-effects to server-side or separate system
