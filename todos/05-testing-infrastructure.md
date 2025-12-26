# Testing Infrastructure Setup

Set up Playwright E2E and Vitest unit testing.

**Current Status:** No tests exist
**Readiness Scores:**
- Playwright: 5/10 (needs data-testid attributes)
- Vitest: 6/10 (needs api-client mockability refactor)

---

## Phase 1: Playwright E2E Setup

### Task 1: Install Playwright Dependencies

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

### Task 2: Create Playwright Configuration

**File:** `playwright.config.ts` (root)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  webServer: {
    command: 'pnpm --filter web dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Task 3: Create Test Environment Config

**File:** `apps/web/.env.test`

```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=test-anon-key
```

### Task 4: Add data-testid Attributes (HIGH PRIORITY)

**Critical Components (add first):**

| Component | Test IDs to Add |
|-----------|-----------------|
| SignInForm.tsx | `email-input`, `password-input`, `submit-button`, `error-alert` |
| SignUpForm.tsx | `name-input`, `email-input`, `password-input`, `confirm-password-input`, `submit-button` |
| Header.tsx | `nav-home`, `nav-browse`, `nav-library`, `nav-requests`, `user-menu`, `sign-out-button` |
| AddBookForm.tsx | `title-input`, `author-input`, `genre-select`, `condition-select`, `submit-button` |
| BookCard.tsx | `book-card`, `book-title`, `book-author`, `view-details-button` |
| BookFilters.tsx | `genre-filter`, `condition-filter`, `search-input`, `clear-filters-button` |
| RequestCard.tsx | `request-card`, `approve-button`, `deny-button`, `status-badge` |

**Example Implementation:**
```tsx
// SignInForm.tsx
<Input
  type="email"
  placeholder="Email"
  data-testid="email-input"
  {...field}
/>

<Button type="submit" data-testid="submit-button">
  Sign In
</Button>
```

### Task 5: Create Test Seed Utilities

**File:** `packages/api-client/src/testUtils.ts`

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const TEST_USER = {
  email: 'test@bookshare.dev',
  password: 'test-password-123',
  name: 'Test User',
};

export async function seedTestUser(client: SupabaseClient) {
  const { data, error } = await client.auth.signUp({
    email: TEST_USER.email,
    password: TEST_USER.password,
    options: {
      data: { name: TEST_USER.name },
    },
  });
  if (error) throw error;
  return data.user;
}

export async function seedTestBooks(client: SupabaseClient, userId: string) {
  const books = [
    { owner_id: userId, title: 'Test Book 1', author: 'Author 1', genre: 'Fiction', condition: 'Good', borrowable: true },
    { owner_id: userId, title: 'Test Book 2', author: 'Author 2', genre: 'Non-Fiction', condition: 'Like New', borrowable: false },
  ];

  const { data, error } = await client.from('books').insert(books).select();
  if (error) throw error;
  return data;
}

export async function cleanupTestData(client: SupabaseClient, userId: string) {
  await client.from('books').delete().eq('owner_id', userId);
  await client.auth.admin.deleteUser(userId);
}
```

### Task 6: Create Basic E2E Tests

**File:** `e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display sign in page', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('submit-button')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/signin');
    await page.getByTestId('submit-button').click();
    await expect(page.getByTestId('error-alert')).toBeVisible();
  });

  // Add more auth tests...
});
```

**File:** `e2e/navigation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to browse page', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-browse').click();
    await expect(page).toHaveURL('/browse');
  });

  test('should show book filters', async ({ page }) => {
    await page.goto('/browse');
    await expect(page.getByTestId('search-input')).toBeVisible();
    await expect(page.getByTestId('genre-filter')).toBeVisible();
  });
});
```

### Task 7: Add Test Scripts to package.json

**File:** `package.json` (root)

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## Phase 2: Vitest Unit Testing Setup

### Task 8: Install Vitest Dependencies

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

### Task 9: Create Vitest Configuration

**File:** `apps/web/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@repo/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
      '@repo/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
});
```

### Task 10: Create Vitest Setup File

**File:** `apps/web/vitest.setup.ts`

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### Task 11: Create Test Utilities

**File:** `apps/web/src/test-utils.tsx`

```typescript
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Task 12: Create Sample Unit Tests

**File:** `apps/web/src/lib/utils/__tests__/errors.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { getErrorMessage, isNetworkError, isAuthError } from '../errors';

describe('getErrorMessage', () => {
  it('returns message from Error object', () => {
    const error = new Error('Test error');
    expect(getErrorMessage(error)).toBe('Test error');
  });

  it('returns string directly', () => {
    expect(getErrorMessage('Direct string')).toBe('Direct string');
  });

  it('returns fallback for unknown types', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred');
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
  });

  it('uses custom fallback', () => {
    expect(getErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
  });
});

describe('isNetworkError', () => {
  it('identifies fetch errors', () => {
    const error = new TypeError('Failed to fetch');
    expect(isNetworkError(error)).toBe(true);
  });

  it('returns false for other errors', () => {
    const error = new Error('Some other error');
    expect(isNetworkError(error)).toBe(false);
  });
});
```

**File:** `apps/web/src/hooks/__tests__/useBooks.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock api-client
vi.mock('@repo/api-client', () => ({
  getBooks: vi.fn(() => Promise.resolve([
    { id: '1', title: 'Test Book', author: 'Author' },
  ])),
}));

import { useBooks, bookKeys } from '../useBooks';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty when userId is undefined', async () => {
    const { result } = renderHook(() => useBooks(undefined), { wrapper });
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches books for user', async () => {
    const { result } = renderHook(() => useBooks('user-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('bookKeys', () => {
  it('generates correct query keys', () => {
    expect(bookKeys.all).toEqual(['books']);
    expect(bookKeys.list('user-1')).toEqual(['books', 'list', 'user-1']);
    expect(bookKeys.detail('book-1')).toEqual(['books', 'detail', 'book-1']);
  });
});
```

---

## Phase 3: API Client Refactoring for Testability

### Task 13: Refactor Supabase Client to Factory

**File:** `packages/api-client/src/supabaseClient.ts`

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Factory function for testing
export function createSupabaseClientInstance(url: string, key: string): SupabaseClient<Database> {
  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

// Default singleton for production use
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found - using test mode');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createSupabaseClientInstance(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient<Database>); // Will be mocked in tests
```

---

## Summary

### Priority Order

| Phase | Task | Effort | Prerequisite |
|-------|------|--------|--------------|
| 1.1 | Install Playwright | 15 min | None |
| 1.2 | Create config | 15 min | 1.1 |
| 1.3 | Test env config | 10 min | None |
| 1.4 | Add data-testid (50+ components) | 3-4 hours | None |
| 1.5 | Create seed utilities | 30 min | None |
| 1.6 | Create basic E2E tests | 1 hour | 1.4, 1.5 |
| 1.7 | Add test scripts | 10 min | 1.1 |
| 2.1 | Install Vitest | 15 min | None |
| 2.2 | Create Vitest config | 20 min | 2.1 |
| 2.3 | Create setup file | 15 min | 2.2 |
| 2.4 | Create test utilities | 20 min | 2.2 |
| 2.5 | Create sample tests | 1 hour | 2.4 |
| 3.1 | Refactor Supabase client | 1 hour | None |

**Total Estimated Effort:** 8-10 hours

---

## Test Coverage Goals

### Phase 1 (Minimum Viable)
- [ ] Auth flow (sign in, sign up, sign out)
- [ ] Navigation between pages
- [ ] Book creation flow
- [ ] Error utilities (100% coverage)

### Phase 2 (Comprehensive)
- [ ] All CRUD operations
- [ ] Filter/search functionality
- [ ] Community features
- [ ] Notification handling

### Phase 3 (Production Ready)
- [ ] 80%+ code coverage
- [ ] Visual regression tests
- [ ] Performance tests
- [ ] Accessibility tests
