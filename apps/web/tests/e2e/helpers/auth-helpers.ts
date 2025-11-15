/**
 * Authentication helper functions for E2E tests
 *
 * These utilities provide reusable authentication operations
 * that can be used across multiple test files.
 */

import { Page, expect } from '@playwright/test';
import type { TestUser } from './test-data';

/**
 * Signs up a new user through the UI
 *
 * @param page - Playwright page object
 * @param user - User credentials to sign up with
 * @param options - Additional options for signup flow
 */
export async function signUpViaUI(
  page: Page,
  user: TestUser,
  options: { waitForRedirect?: boolean; expectSuccess?: boolean } = {}
) {
  const { waitForRedirect = true, expectSuccess = true } = options;

  // Navigate to signup page
  await page.goto('/signup');

  // Wait for page to be ready
  await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();

  // Fill in the signup form
  await page.getByLabel(/full name/i).fill(user.name);
  await page.getByLabel(/email address/i).fill(user.email);
  await page.getByLabel(/^password$/i).fill(user.password);
  await page.getByLabel(/confirm password/i).fill(user.password);

  // Submit the form
  await page.getByRole('button', { name: /create account/i }).click();

  if (expectSuccess) {
    // Wait for navigation or success indication
    if (waitForRedirect) {
      // SignUp redirects to /signin after success
      await page.waitForURL('/signin', { timeout: 10000 });
    }
  }
}

/**
 * Signs in an existing user through the UI
 *
 * @param page - Playwright page object
 * @param credentials - User email and password
 * @param options - Additional options for signin flow
 */
export async function signInViaUI(
  page: Page,
  credentials: { email: string; password: string },
  options: { waitForRedirect?: boolean; expectSuccess?: boolean } = {}
) {
  const { waitForRedirect = true, expectSuccess = true } = options;

  // Navigate to signin page
  await page.goto('/signin');

  // Wait for page to be ready
  await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible();

  // Fill in the signin form
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);

  // Submit the form
  await page.getByRole('button', { name: /^sign in$/i }).click();

  if (expectSuccess) {
    // Wait for navigation or success indication
    if (waitForRedirect) {
      // SignIn redirects to home (/) after success
      await page.waitForURL('/', { timeout: 10000 });
    }
  }
}

/**
 * Signs out the current user through the UI
 *
 * @param page - Playwright page object
 * @param options - Additional options for signout flow
 */
export async function signOutViaUI(
  page: Page,
  options: { waitForRedirect?: boolean } = {}
) {
  const { waitForRedirect = true } = options;

  // Wait for header to be visible
  await expect(page.locator('header')).toBeVisible();

  // Click on the user avatar to open dropdown (desktop)
  const avatar = page.locator('header').getByRole('button').filter({ has: page.locator('[class*="avatar"]') });

  // Try desktop dropdown first, fall back to mobile menu if not visible
  if (await avatar.isVisible()) {
    await avatar.click();

    // Click sign out in dropdown menu
    await page.getByRole('menuitem', { name: /sign out/i }).click();
  } else {
    // Mobile menu
    await page.locator('header').getByRole('button', { has: page.locator('[class*="menu"]') }).click();
    await page.getByRole('button', { name: /sign out/i }).click();
  }

  if (waitForRedirect) {
    // After sign out, should redirect to /signin
    await page.waitForURL('/signin', { timeout: 10000 });
  }
}

/**
 * Checks if a user is currently authenticated
 *
 * @param page - Playwright page object
 * @returns Boolean indicating if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Navigate to home to check auth state
  await page.goto('/');

  // Check if user avatar is visible in header (indicates authenticated)
  const avatar = page.locator('header').getByRole('button').filter({ has: page.locator('[class*="avatar"]') });
  return await avatar.isVisible();
}

/**
 * Ensures the user is signed out
 * Useful for test setup/teardown
 *
 * @param page - Playwright page object
 */
export async function ensureSignedOut(page: Page) {
  const authenticated = await isAuthenticated(page);
  if (authenticated) {
    await signOutViaUI(page);
  }
}

/**
 * Creates a test user and signs them in
 * Useful for tests that require an authenticated user
 *
 * @param page - Playwright page object
 * @param user - User credentials
 * @returns The user object that was created and signed in
 */
export async function createAndSignInUser(page: Page, user: TestUser): Promise<TestUser> {
  // First sign up the user
  await signUpViaUI(page, user);

  // Then sign in (signup redirects to signin page)
  await signInViaUI(page, user);

  return user;
}

/**
 * Waits for authentication state to be loaded
 * Useful when navigating to pages that depend on auth state
 *
 * @param page - Playwright page object
 */
export async function waitForAuthLoaded(page: Page) {
  // Wait for either sign in button or user avatar to appear
  await page.waitForSelector(
    'header button:has-text("Sign In"), header button:has([class*="avatar"])',
    { timeout: 10000 }
  );
}
