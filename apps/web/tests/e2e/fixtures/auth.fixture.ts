/**
 * Playwright Fixtures for Authentication
 *
 * Custom fixtures provide reusable setup and teardown logic for tests.
 * These fixtures handle common auth scenarios and provide authenticated contexts.
 */

import { test as base, Page } from '@playwright/test';
import { generateTestUser } from '../helpers/test-data';
import { createAndSignInUser, ensureSignedOut } from '../helpers/auth-helpers';
import type { TestUser } from '../helpers/test-data';

type AuthFixtures = {
  /**
   * Provides a fresh authenticated page with a new test user
   * The user is automatically created and signed in before the test
   */
  authenticatedPage: Page;

  /**
   * Provides the test user credentials used for the authenticated page
   */
  testUser: TestUser;

  /**
   * Provides a page that is explicitly signed out
   * Useful for testing unauthenticated scenarios
   */
  unauthenticatedPage: Page;
};

/**
 * Extended test with auth fixtures
 *
 * Usage:
 * ```typescript
 * import { test } from './fixtures/auth.fixture';
 *
 * test('should access protected route', async ({ authenticatedPage, testUser }) => {
 *   await authenticatedPage.goto('/my-library');
 *   // Test with authenticated user
 * });
 * ```
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Authenticated page fixture
   * Automatically creates and signs in a test user before each test
   */
  authenticatedPage: async ({ page }, use) => {
    // Create and sign in a test user
    const user = generateTestUser('fixture');
    await createAndSignInUser(page, user);

    // Provide the page to the test
    await use(page);

    // Cleanup: Sign out after test completes
    try {
      await ensureSignedOut(page);
    } catch (error) {
      // Ignore errors during cleanup
      console.log('Cleanup error (ignored):', error);
    }
  },

  /**
   * Test user fixture
   * Provides the credentials of the authenticated user
   */
  testUser: async ({}, use) => {
    const user = generateTestUser('fixture');
    await use(user);
  },

  /**
   * Unauthenticated page fixture
   * Ensures the page is signed out before the test
   */
  unauthenticatedPage: async ({ page }, use) => {
    // Ensure signed out
    await ensureSignedOut(page);

    // Provide the page to the test
    await use(page);
  },
});

export { expect } from '@playwright/test';
