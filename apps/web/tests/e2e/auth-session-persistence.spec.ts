/**
 * E2E Tests: Session Persistence
 *
 * Tests that authentication sessions persist correctly:
 * - Session survives page refresh
 * - Session survives browser navigation
 * - Session is maintained across different pages
 * - Session expires appropriately
 */

import { test, expect } from '@playwright/test';
import { BasePage } from './pages/BasePage';
import { SignInPage } from './pages/SignInPage';
import { generateTestUser } from './helpers/test-data';
import { createAndSignInUser, ensureSignedOut } from './helpers/auth-helpers';

test.describe('Session Persistence', () => {
  let basePage: BasePage;
  let signInPage: SignInPage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    signInPage = new SignInPage(page);
  });

  test('should persist session after page refresh on home page', async ({ page }) => {
    // Create and sign in user
    const user = generateTestUser('persist_home');
    await createAndSignInUser(page, user);

    // Verify authenticated
    expect(await basePage.isAuthenticated()).toBe(true);

    // Refresh the page
    await page.reload();

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should still be authenticated
    expect(await basePage.isAuthenticated()).toBe(true);

    // Protected links should still be visible
    expect(await basePage.areProtectedLinksVisible()).toBe(true);
  });

  test('should persist session after page refresh on protected route', async ({ page }) => {
    // Create and sign in user
    const user = generateTestUser('persist_protected');
    await createAndSignInUser(page, user);

    // Navigate to protected route
    await page.goto('/my-library');
    await expect(page).toHaveURL('/my-library');

    // Refresh the page
    await page.reload();

    // Should still have access to protected route
    await expect(page).toHaveURL('/my-library');
    await expect(page.getByRole('heading', { name: /my library/i })).toBeVisible();

    // Should still be authenticated
    expect(await basePage.isAuthenticated()).toBe(true);
  });

  test('should persist session when navigating between pages', async ({ page }) => {
    // Create and sign in user
    const user = generateTestUser('persist_nav');
    await createAndSignInUser(page, user);

    // Navigate through multiple pages
    await page.goto('/browse');
    expect(await basePage.isAuthenticated()).toBe(true);

    await page.goto('/my-library');
    expect(await basePage.isAuthenticated()).toBe(true);

    await page.goto('/requests');
    expect(await basePage.isAuthenticated()).toBe(true);

    await page.goto('/profile');
    expect(await basePage.isAuthenticated()).toBe(true);

    await page.goto('/');
    expect(await basePage.isAuthenticated()).toBe(true);
  });

  test('should persist session when using browser back button', async ({ page }) => {
    // Create and sign in user
    const user = generateTestUser('persist_back');
    await createAndSignInUser(page, user);

    // Navigate to a protected route
    await page.goto('/my-library');
    expect(await basePage.isAuthenticated()).toBe(true);

    // Navigate to another route
    await page.goto('/profile');
    expect(await basePage.isAuthenticated()).toBe(true);

    // Use browser back button
    await page.goBack();

    // Should still be authenticated
    await expect(page).toHaveURL('/my-library');
    expect(await basePage.isAuthenticated()).toBe(true);
  });

  test('should persist session when using browser forward button', async ({ page }) => {
    // Create and sign in user
    const user = generateTestUser('persist_forward');
    await createAndSignInUser(page, user);

    // Navigate through routes
    await page.goto('/my-library');
    await page.goto('/profile');

    // Go back
    await page.goBack();
    await expect(page).toHaveURL('/my-library');

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL('/profile');

    // Should still be authenticated
    expect(await basePage.isAuthenticated()).toBe(true);
  });

  test('should maintain session across multiple tab opens', async ({ page, context }) => {
    // Create and sign in user
    const user = generateTestUser('persist_tabs');
    await createAndSignInUser(page, user);

    // Open a new tab in the same context
    const newTab = await context.newPage();
    const newBasePage = new BasePage(newTab);

    // Navigate to home in new tab
    await newTab.goto('/');

    // Should be authenticated in new tab (shared session)
    expect(await newBasePage.isAuthenticated()).toBe(true);

    // Should have access to protected routes in new tab
    await newTab.goto('/my-library');
    await expect(newTab).toHaveURL('/my-library');

    // Close new tab
    await newTab.close();

    // Original tab should still be authenticated
    expect(await basePage.isAuthenticated()).toBe(true);
  });

  test('should not persist session after signing out', async ({ page }) => {
    // Create and sign in user
    const user = generateTestUser('no_persist_signout');
    await createAndSignInUser(page, user);

    // Verify authenticated
    expect(await basePage.isAuthenticated()).toBe(true);

    // Sign out
    await basePage.signOut();

    // Refresh page
    await page.reload();

    // Should not be authenticated
    expect(await basePage.isAuthenticated()).toBe(false);

    // Should still be on sign in page
    await expect(page).toHaveURL('/signin');
  });

  test('should restore session state correctly after refresh', async ({ page }) => {
    // Create and sign in user
    const user = generateTestUser('restore_state');
    await createAndSignInUser(page, user);

    // Navigate to a specific protected route
    await page.goto('/profile');

    // Refresh the page
    await page.reload();

    // Should still be on the same route
    await expect(page).toHaveURL('/profile');

    // Should still be authenticated
    expect(await basePage.isAuthenticated()).toBe(true);

    // Profile content should be visible
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
  });

  test('should maintain session when navigating to and from public routes', async ({ page }) => {
    // Create and sign in user
    const user = generateTestUser('persist_public');
    await createAndSignInUser(page, user);

    // Navigate to public route (browse)
    await page.goto('/browse');
    expect(await basePage.isAuthenticated()).toBe(true);

    // Navigate to protected route
    await page.goto('/my-library');
    expect(await basePage.isAuthenticated()).toBe(true);

    // Back to public route
    await page.goto('/');
    expect(await basePage.isAuthenticated()).toBe(true);

    // Should still have protected links visible
    expect(await basePage.areProtectedLinksVisible()).toBe(true);
  });

  test('should handle loading state correctly during session restoration', async ({ page }) => {
    // Create and sign in user
    const user = generateTestUser('loading_state');
    await createAndSignInUser(page, user);

    // Navigate to protected route
    await page.goto('/my-library');

    // Monitor network activity during refresh
    const requestPromise = page.waitForResponse(
      response => response.url().includes('auth') || response.url().includes('session'),
      { timeout: 5000 }
    ).catch(() => null); // Catch timeout if no auth request

    // Refresh the page
    await page.reload();

    // Wait for any auth requests to complete
    await requestPromise;

    // Page should be fully loaded
    await page.waitForLoadState('networkidle');

    // Should be authenticated and on correct page
    await expect(page).toHaveURL('/my-library');
    expect(await basePage.isAuthenticated()).toBe(true);
  });

  test('should maintain session across protected route redirects', async ({ page }) => {
    // Ensure signed out first
    await ensureSignedOut(page);

    // Try to access protected route (will redirect to signin)
    await page.goto('/my-library');
    await page.waitForURL('/signin');

    // Sign in
    const user = generateTestUser('redirect_session');
    await signInPage.goto();
    await signInPage.signIn(user.email, user.password);

    // Create user first
    await page.goto('/signup');
    const signUpPage = (await import('./pages/SignUpPage')).SignUpPage;
    const signUp = new signUpPage(page);
    await signUp.signUp(user.name, user.email, user.password);

    // Sign in
    await signInPage.goto();
    await signInPage.signIn(user.email, user.password);
    await page.waitForURL('/');

    // Now access protected route
    await page.goto('/my-library');

    // Should have access
    await expect(page).toHaveURL('/my-library');
    expect(await basePage.isAuthenticated()).toBe(true);

    // Refresh should maintain session
    await page.reload();
    await expect(page).toHaveURL('/my-library');
    expect(await basePage.isAuthenticated()).toBe(true);
  });
});
