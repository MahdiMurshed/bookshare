/**
 * E2E Tests: User Sign Out Flow
 *
 * Tests all aspects of user sign out including:
 * - Sign out via dropdown menu
 * - Sign out via mobile menu
 * - State cleanup after sign out
 * - Navigation after sign out
 */

import { test, expect } from '@playwright/test';
import { BasePage } from './pages/BasePage';
import { SignInPage } from './pages/SignInPage';
import { generateTestUser } from './helpers/test-data';
import { createAndSignInUser } from './helpers/auth-helpers';

test.describe('User Sign Out Flow', () => {
  let basePage: BasePage;
  let signInPage: SignInPage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    signInPage = new SignInPage(page);

    // Create and sign in a user before each test
    const user = generateTestUser('signout');
    await createAndSignInUser(page, user);

    // Navigate to home
    await page.goto('/');
  });

  test('should successfully sign out via user dropdown menu', async ({ page }) => {
    // Verify user is authenticated
    expect(await basePage.isAuthenticated()).toBe(true);

    // Sign out via dropdown
    await basePage.signOut();

    // Should redirect to sign in page
    await expect(page).toHaveURL('/signin');

    // Should show sign in form
    await expect(signInPage.heading).toBeVisible();

    // Should no longer be authenticated
    expect(await basePage.isAuthenticated()).toBe(false);

    // Auth buttons should be visible
    expect(await basePage.areAuthButtonsVisible()).toBe(true);
  });

  test('should sign out from any page', async ({ page }) => {
    // Navigate to different protected routes and sign out from each

    // From My Library
    await page.goto('/my-library');
    expect(await basePage.isAuthenticated()).toBe(true);

    // Sign out
    await basePage.signOut();
    await expect(page).toHaveURL('/signin');

    // Sign back in for next test
    const user = generateTestUser('signout_any');
    await createAndSignInUser(page, user);

    // From Profile
    await page.goto('/profile');
    expect(await basePage.isAuthenticated()).toBe(true);

    // Sign out
    await basePage.signOut();
    await expect(page).toHaveURL('/signin');
  });

  test('should clear authentication state after sign out', async ({ page }) => {
    // Sign out
    await basePage.signOut();

    // Try to access protected route
    await page.goto('/my-library');

    // Should redirect to sign in (not allowed)
    await page.waitForURL('/signin', { timeout: 10000 });
    await expect(signInPage.heading).toBeVisible();
  });

  test('should not show protected navigation links after sign out', async ({ page }) => {
    // Verify protected links are visible when signed in
    expect(await basePage.areProtectedLinksVisible()).toBe(true);

    // Sign out
    await basePage.signOut();

    // Navigate to home
    await page.goto('/');

    // Protected links should not be visible
    expect(await basePage.areProtectedLinksVisible()).toBe(false);

    // Auth buttons should be visible instead
    expect(await basePage.areAuthButtonsVisible()).toBe(true);
  });

  test('should not persist session after sign out and page refresh', async ({ page }) => {
    // Sign out
    await basePage.signOut();

    // Refresh the page
    await page.reload();

    // Should still be on sign in page
    await expect(page).toHaveURL('/signin');

    // Should not be authenticated
    expect(await basePage.isAuthenticated()).toBe(false);
  });

  test('should be able to sign in again after signing out', async ({ page }) => {
    const user = generateTestUser('signout_signin');

    // Create user first (need to start fresh)
    const newPage = await page.context().newPage();
    await createAndSignInUser(newPage, user);
    await newPage.close();

    // Now on original page, sign in with that user
    await signInPage.goto();
    await signInPage.signIn(user.email, user.password);

    // Should be authenticated
    await page.waitForURL('/');
    expect(await basePage.isAuthenticated()).toBe(true);

    // Sign out
    await basePage.signOut();
    await expect(page).toHaveURL('/signin');

    // Sign in again with same credentials
    await signInPage.signIn(user.email, user.password);

    // Should be authenticated again
    await page.waitForURL('/');
    expect(await basePage.isAuthenticated()).toBe(true);
  });

  test('should display sign in button after sign out', async ({ page }) => {
    // Sign out
    await basePage.signOut();

    // Navigate to home
    await page.goto('/');

    // Sign in and sign up buttons should be visible
    await expect(basePage.signInButton).toBeVisible();
    await expect(basePage.signUpButton).toBeVisible();

    // User avatar should not be visible
    expect(await basePage.userAvatar.isVisible()).toBe(false);
  });

  test('should clear user-specific data from header after sign out', async ({ page }) => {
    // Get notification count before sign out (if any)
    const notificationsBefore = await basePage.notificationBell.isVisible();

    // Sign out
    await basePage.signOut();

    // Navigate to home
    await page.goto('/');

    // Notification bell should not be visible
    expect(await basePage.notificationBell.isVisible()).toBe(false);

    // User avatar should not be visible
    expect(await basePage.userAvatar.isVisible()).toBe(false);
  });

  test('should handle sign out from dropdown menu correctly', async ({ page }) => {
    // Open user dropdown
    await basePage.openUserMenu();

    // Verify dropdown is open with profile option
    await expect(page.getByRole('menuitem', { name: /profile/i })).toBeVisible();

    // Verify sign out option is visible
    await expect(page.getByRole('menuitem', { name: /sign out/i })).toBeVisible();

    // Click sign out
    await page.getByRole('menuitem', { name: /sign out/i }).click();

    // Should redirect to sign in
    await page.waitForURL('/signin', { timeout: 10000 });

    // Should show sign in form
    await expect(signInPage.heading).toBeVisible();
  });

  test.describe('Mobile Sign Out', () => {
    test.use({
      viewport: { width: 375, height: 667 }, // iPhone SE viewport
    });

    test('should sign out via mobile menu', async ({ page }) => {
      // Navigate to home
      await page.goto('/');

      // Verify user is authenticated
      expect(await basePage.isAuthenticated()).toBe(true);

      // Open mobile menu
      await page.locator('header').getByRole('button').filter({ has: page.locator('svg') }).last().click();

      // Wait for mobile menu to open
      await page.waitForTimeout(500);

      // Click sign out button in mobile menu
      await page.getByRole('button', { name: /sign out/i }).click();

      // Should redirect to sign in page
      await page.waitForURL('/signin', { timeout: 10000 });

      // Should show sign in form
      await expect(signInPage.heading).toBeVisible();

      // Should no longer be authenticated
      expect(await basePage.isAuthenticated()).toBe(false);
    });
  });
});
