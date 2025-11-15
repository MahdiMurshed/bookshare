/**
 * E2E Tests: Protected Route Authorization
 *
 * Tests that protected routes properly enforce authentication:
 * - Unauthenticated users are redirected to sign in
 * - Authenticated users can access protected routes
 * - Direct navigation to protected routes is handled correctly
 */

import { test, expect } from '@playwright/test';
import { BasePage } from './pages/BasePage';
import { SignInPage } from './pages/SignInPage';
import { generateTestUser } from './helpers/test-data';
import { createAndSignInUser, ensureSignedOut } from './helpers/auth-helpers';

test.describe('Protected Route Authorization', () => {
  let basePage: BasePage;
  let signInPage: SignInPage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    signInPage = new SignInPage(page);
  });

  test.describe('Unauthenticated Access', () => {
    test.beforeEach(async ({ page }) => {
      // Ensure user is signed out
      await ensureSignedOut(page);
    });

    test('should redirect to /signin when accessing /my-library without authentication', async ({ page }) => {
      // Attempt to visit My Library page
      await page.goto('/my-library');

      // Should redirect to sign in page
      await page.waitForURL('/signin', { timeout: 10000 });

      // Verify we're on sign in page
      await expect(signInPage.heading).toBeVisible();
    });

    test('should redirect to /signin when accessing /requests without authentication', async ({ page }) => {
      // Attempt to visit Requests page
      await page.goto('/requests');

      // Should redirect to sign in page
      await page.waitForURL('/signin', { timeout: 10000 });

      // Verify we're on sign in page
      await expect(signInPage.heading).toBeVisible();
    });

    test('should redirect to /signin when accessing /profile without authentication', async ({ page }) => {
      // Attempt to visit Profile page
      await page.goto('/profile');

      // Should redirect to sign in page
      await page.waitForURL('/signin', { timeout: 10000 });

      // Verify we're on sign in page
      await expect(signInPage.heading).toBeVisible();
    });

    test('should redirect to /signin when accessing /notifications without authentication', async ({ page }) => {
      // Attempt to visit Notifications page
      await page.goto('/notifications');

      // Should redirect to sign in page
      await page.waitForURL('/signin', { timeout: 10000 });

      // Verify we're on sign in page
      await expect(signInPage.heading).toBeVisible();
    });

    test('should redirect to /signin when accessing /chats without authentication', async ({ page }) => {
      // Attempt to visit Chats page
      await page.goto('/chats');

      // Should redirect to sign in page
      await page.waitForURL('/signin', { timeout: 10000 });

      // Verify we're on sign in page
      await expect(signInPage.heading).toBeVisible();
    });

    test('should redirect to /signin when accessing /admin without authentication', async ({ page }) => {
      // Attempt to visit Admin page
      await page.goto('/admin');

      // Should redirect to sign in page
      await page.waitForURL('/signin', { timeout: 10000 });

      // Verify we're on sign in page
      await expect(signInPage.heading).toBeVisible();
    });

    test('should not show protected navigation links when unauthenticated', async ({ page }) => {
      // Go to home page
      await page.goto('/');

      // Protected links should not be visible
      expect(await basePage.areProtectedLinksVisible()).toBe(false);

      // Auth buttons should be visible instead
      expect(await basePage.areAuthButtonsVisible()).toBe(true);
    });
  });

  test.describe('Authenticated Access', () => {
    test.beforeEach(async ({ page }) => {
      // Create and sign in a test user before each test
      const user = generateTestUser('protected');
      await createAndSignInUser(page, user);
    });

    test('should allow access to /my-library when authenticated', async ({ page }) => {
      // Navigate to My Library
      await page.goto('/my-library');

      // Should successfully load the page
      await expect(page.getByRole('heading', { name: /my library/i })).toBeVisible();

      // URL should be /my-library
      await expect(page).toHaveURL('/my-library');
    });

    test('should allow access to /requests when authenticated', async ({ page }) => {
      // Navigate to Requests
      await page.goto('/requests');

      // Should successfully load the page
      await expect(page.getByRole('heading', { name: /requests/i })).toBeVisible();

      // URL should be /requests
      await expect(page).toHaveURL('/requests');
    });

    test('should allow access to /profile when authenticated', async ({ page }) => {
      // Navigate to Profile
      await page.goto('/profile');

      // Should successfully load the page
      await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();

      // URL should be /profile
      await expect(page).toHaveURL('/profile');
    });

    test('should allow access to /notifications when authenticated', async ({ page }) => {
      // Navigate to Notifications
      await page.goto('/notifications');

      // Should successfully load the page
      await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible();

      // URL should be /notifications
      await expect(page).toHaveURL('/notifications');
    });

    test('should allow access to /chats when authenticated', async ({ page }) => {
      // Navigate to Chats
      await page.goto('/chats');

      // Should successfully load the page (may show empty state)
      // URL should be /chats
      await expect(page).toHaveURL('/chats');
    });

    test('should show protected navigation links when authenticated', async ({ page }) => {
      // Go to home page
      await page.goto('/');

      // Protected links should be visible
      expect(await basePage.areProtectedLinksVisible()).toBe(true);

      // Verify specific links
      await expect(basePage.myLibraryLink).toBeVisible();
      await expect(basePage.requestsLink).toBeVisible();
      await expect(basePage.chatsLink).toBeVisible();

      // Auth buttons should not be visible
      expect(await basePage.areAuthButtonsVisible()).toBe(false);
    });

    test('should navigate to protected routes via header links', async ({ page }) => {
      // Start at home
      await page.goto('/');

      // Navigate to My Library via header
      await basePage.goToMyLibrary();
      await expect(page).toHaveURL('/my-library');

      // Navigate to Requests via header
      await basePage.goToRequests();
      await expect(page).toHaveURL('/requests');

      // Navigate to Chats via header
      await basePage.goToChats();
      await expect(page).toHaveURL('/chats');
    });

    test('should navigate to profile via user dropdown', async ({ page }) => {
      // Start at home
      await page.goto('/');

      // Open user menu and go to profile
      await basePage.goToProfile();

      // Should be on profile page
      await expect(page).toHaveURL('/profile');
      await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
    });

    test('should persist protected route access after page refresh', async ({ page }) => {
      // Navigate to a protected route
      await page.goto('/my-library');

      // Verify access
      await expect(page).toHaveURL('/my-library');

      // Refresh page
      await page.reload();

      // Should still have access
      await expect(page).toHaveURL('/my-library');
      await expect(page.getByRole('heading', { name: /my library/i })).toBeVisible();
    });
  });

  test.describe('Authorization State Transitions', () => {
    test('should lose access to protected routes after signing out', async ({ page }) => {
      // Create and sign in user
      const user = generateTestUser('signout_transition');
      await createAndSignInUser(page, user);

      // Navigate to protected route
      await page.goto('/my-library');
      await expect(page).toHaveURL('/my-library');

      // Sign out
      await basePage.signOut();

      // Try to access protected route again
      await page.goto('/my-library');

      // Should redirect to sign in
      await page.waitForURL('/signin', { timeout: 10000 });
      await expect(signInPage.heading).toBeVisible();
    });

    test('should gain access to protected routes after signing in', async ({ page }) => {
      // Ensure signed out
      await ensureSignedOut(page);

      // Try to access protected route
      await page.goto('/my-library');

      // Should redirect to sign in
      await page.waitForURL('/signin', { timeout: 10000 });

      // Create and sign in user
      const user = generateTestUser('signin_transition');
      await createAndSignInUser(page, user);

      // Now try to access protected route
      await page.goto('/my-library');

      // Should have access
      await expect(page).toHaveURL('/my-library');
      await expect(page.getByRole('heading', { name: /my library/i })).toBeVisible();
    });
  });
});
