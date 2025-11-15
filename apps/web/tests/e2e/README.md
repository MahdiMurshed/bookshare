# BookShare E2E Tests

Comprehensive end-to-end tests for the BookShare application using Playwright.

## Overview

This test suite covers authentication and authorization flows including:

- **User Registration**: Sign up with validation, error handling, and edge cases
- **User Sign In**: Authentication with valid/invalid credentials
- **Protected Routes**: Authorization checks for authenticated-only pages
- **Public Routes**: Access control for public pages
- **Sign Out**: Session cleanup and state management
- **Session Persistence**: Session restoration after page refresh and navigation

## Project Structure

```
tests/e2e/
├── README.md                           # This file
├── helpers/                            # Reusable test utilities
│   ├── auth-helpers.ts                # Authentication helper functions
│   └── test-data.ts                   # Test data generators
├── pages/                              # Page Object Models
│   ├── BasePage.ts                    # Common page functionality
│   ├── SignInPage.ts                  # Sign in page interactions
│   └── SignUpPage.ts                  # Sign up page interactions
├── auth-signup.spec.ts                # User registration tests
├── auth-signin.spec.ts                # User sign in tests
├── auth-protected-routes.spec.ts      # Protected route authorization tests
├── auth-public-routes.spec.ts         # Public route access tests
├── auth-signout.spec.ts               # Sign out flow tests
└── auth-session-persistence.spec.ts   # Session persistence tests
```

## Prerequisites

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Install Playwright browsers:**
   ```bash
   pnpm exec playwright install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.test.example .env.test
   # Edit .env.test with your test Supabase credentials
   ```

## Running Tests

### Run all tests (headless)
```bash
pnpm test:e2e
```

### Run tests with UI mode (recommended for development)
```bash
pnpm test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
pnpm test:e2e:headed
```

### Run tests in debug mode (step through tests)
```bash
pnpm test:e2e:debug
```

### Run tests in specific browser
```bash
# Chromium only
pnpm test:e2e:chromium

# Firefox only
pnpm test:e2e:firefox

# WebKit (Safari) only
pnpm test:e2e:webkit

# Mobile browsers
pnpm test:e2e:mobile
```

### Run specific test file
```bash
pnpm test:e2e auth-signin.spec.ts
```

### Run specific test by name
```bash
pnpm test:e2e -g "should successfully sign in"
```

### View test report
```bash
pnpm test:e2e:report
```

## Test Architecture

### Page Object Model (POM)

We use the Page Object Model pattern to encapsulate page interactions:

- **BasePage**: Common functionality across all pages (header, navigation)
- **SignInPage**: Sign in page specific interactions
- **SignUpPage**: Sign up page specific interactions

Example usage:
```typescript
import { SignInPage } from './pages/SignInPage';

test('sign in test', async ({ page }) => {
  const signInPage = new SignInPage(page);
  await signInPage.goto();
  await signInPage.signIn(email, password);
  await signInPage.waitForSignInSuccess();
});
```

### Helper Functions

Reusable authentication helpers are available in `helpers/auth-helpers.ts`:

- `signUpViaUI(page, user)` - Sign up a new user through UI
- `signInViaUI(page, credentials)` - Sign in through UI
- `signOutViaUI(page)` - Sign out through UI
- `createAndSignInUser(page, user)` - Create and sign in a test user
- `ensureSignedOut(page)` - Ensure user is signed out
- `isAuthenticated(page)` - Check authentication status

### Test Data Generators

Test data generators are available in `helpers/test-data.ts`:

- `generateTestUser(prefix)` - Generate unique test user credentials
- `generateTestUsers(count, prefix)` - Generate multiple test users
- `invalidCredentials` - Pre-defined invalid credential sets for validation testing

Example:
```typescript
import { generateTestUser } from './helpers/test-data';

const user = generateTestUser('signup');
// { name: 'Test User 1234567890_abc123', email: 'signup_1234567890_abc123@bookshare-test.com', password: 'TestPass123!' }
```

## Test Coverage

### Authentication Tests

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| auth-signup.spec.ts | 15 | Registration form, validation, duplicate users |
| auth-signin.spec.ts | 12 | Sign in flow, validation, error handling |
| auth-protected-routes.spec.ts | 14 | Protected route authorization, redirects |
| auth-public-routes.spec.ts | 10 | Public route access, auth state handling |
| auth-signout.spec.ts | 9 | Sign out flow, state cleanup, mobile |
| auth-session-persistence.spec.ts | 11 | Session persistence, refresh, navigation |

**Total: 71 E2E tests**

## Best Practices

### 1. Test Isolation
Each test is independent and doesn't rely on other tests:
```typescript
test.beforeEach(async ({ page }) => {
  // Create fresh test user for each test
  const user = generateTestUser('unique_prefix');
  await createAndSignInUser(page, user);
});
```

### 2. Unique Test Data
Always use unique identifiers to avoid test collisions:
```typescript
// GOOD: Unique email per test
const user = generateTestUser('my_test');

// BAD: Hardcoded email can cause failures
const email = 'test@example.com';
```

### 3. Explicit Waits
Use Playwright's auto-waiting and explicit waits for reliability:
```typescript
// Wait for navigation
await page.waitForURL('/dashboard');

// Wait for element
await expect(page.getByRole('heading')).toBeVisible();

// Wait for network
await page.waitForResponse(resp => resp.url().includes('/api/auth'));
```

### 4. Clear Test Names
Use descriptive test names that explain what is being tested:
```typescript
// GOOD
test('should redirect to /signin when accessing /my-library without authentication', ...)

// BAD
test('test protected route', ...)
```

### 5. Page Object Methods
Encapsulate complex interactions in page object methods:
```typescript
// In SignInPage.ts
async signIn(email: string, password: string) {
  await this.fillForm(email, password);
  await this.submit();
}

// In test
await signInPage.signIn(user.email, user.password);
```

## Debugging Tests

### Visual Debugging
```bash
# Run with UI mode to see test execution
pnpm test:e2e:ui

# Run in headed mode to see browser
pnpm test:e2e:headed
```

### Debug Mode
```bash
# Step through tests with Playwright Inspector
pnpm test:e2e:debug
```

### Screenshots and Videos
Failed tests automatically capture:
- Screenshots (on failure)
- Videos (on failure)
- Traces (on retry)

Find them in:
- `test-results/` - Screenshots and videos
- `playwright-report/` - HTML report with all artifacts

### Console Logs
Add debugging output in tests:
```typescript
console.log('User:', user);
console.log('Authenticated:', await basePage.isAuthenticated());
```

## CI/CD Integration

The test suite is designed to run in CI environments:

1. **Parallel Execution**: Tests run in parallel for speed
2. **Retries**: Flaky tests are retried up to 2 times on CI
3. **Artifacts**: Screenshots and videos are preserved on failure
4. **Multiple Browsers**: Tests run across Chromium, Firefox, and WebKit

Example CI configuration (GitHub Actions):
```yaml
- name: Install dependencies
  run: pnpm install

- name: Install Playwright browsers
  run: pnpm exec playwright install --with-deps

- name: Run E2E tests
  run: pnpm test:e2e
  env:
    CI: true
    VITE_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Tests fail with "Timeout waiting for..."
- Increase timeout in playwright.config.ts
- Check if dev server is running
- Verify network connectivity to Supabase

### Tests fail with "Element not found"
- Check if selectors match current UI
- Use Playwright Inspector to inspect elements
- Verify page is fully loaded before interaction

### Tests fail intermittently
- Add explicit waits for dynamic content
- Check for race conditions
- Use `page.waitForLoadState('networkidle')`

### Authentication tests fail
- Verify Supabase test credentials are correct
- Check if test users are being created successfully
- Ensure test database is accessible

## Future Enhancements

- [ ] Add visual regression testing with Playwright snapshots
- [ ] Add accessibility testing (axe-core integration)
- [ ] Add performance testing (lighthouse integration)
- [ ] Add API testing for backend endpoints
- [ ] Add test data seeding/cleanup utilities
- [ ] Add multi-user concurrent scenario tests
- [ ] Add email verification flow tests
- [ ] Add password reset flow tests

## Contributing

When adding new tests:

1. Follow existing patterns and structure
2. Use Page Object Model for new pages
3. Add reusable helpers to `helpers/`
4. Generate unique test data
5. Ensure tests are isolated and independent
6. Add clear, descriptive test names
7. Update this README with new test coverage

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Debugging Tests](https://playwright.dev/docs/debug)
