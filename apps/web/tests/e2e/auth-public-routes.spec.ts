/**
 * E2E Tests: Public Route Access
 *
 * Tests that public routes are accessible and handle authentication correctly:
 * - Public routes are accessible without authentication
 * - Auth pages redirect authenticated users away
 * - Public content routes remain accessible when authenticated
 */

import { test, expect } from '@playwright/test';
import { BasePage } from './pages/BasePage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { generateTestUser } from './helpers/test-data';
import { createAndSignInUser, ensureSignedOut } from './helpers/auth-helpers';

test.describe('Public Route Access', () => {
  let basePage: BasePage;
  let signInPage: SignInPage;
  let signUpPage: SignUpPage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    signInPage = new SignInPage(page);
    signUpPage = new SignUpPage(page);
  });

  test.describe('Unauthenticated Public Access', () => {
    test.beforeEach(async ({ page }) => {
      // Ensure user is signed out
      await ensureSignedOut(page);
    });

    test('should access home page (/) without authentication', async ({ page }) => {
      // Navigate to home
      await page.goto('/');

      // Should load successfully
      await expect(page).toHaveURL('/');

      // Should see home page content
      await expect(page.getByRole('heading', { name: /welcome to bookshare/i })).toBeVisible();
    });

    test('should access browse page (/browse) without authentication', async ({ page }) => {
      // Navigate to browse
      await page.goto('/browse');

      // Should load successfully
      await expect(page).toHaveURL('/browse');

      // Should see browse page content
      await expect(page.getByRole('heading', { name: /browse books/i })).toBeVisible();
    });

    test('should access book detail page (/books/:id) without authentication', async ({ page }) => {
      // Navigate to browse first to find a book
      await page.goto('/browse');

      // Wait for books to load
      await page.waitForTimeout(2000);

      // Try to find and click a book card (if any exist)
      const bookCards = page.locator('[data-testid="book-card"], article, div').filter({ hasText: /borrow|available/i });
      const count = await bookCards.count();

      if (count > 0) {
        // Click first book
        await bookCards.first().click();

        // Should navigate to book detail page
        await page.waitForURL(/\/books\/.+/, { timeout: 5000 });

        // Should see book detail content
        await expect(page.locator('h1, h2').first()).toBeVisible();
      }
      // Note: If no books exist, this test will skip the detail check
    });

    test('should access sign in page (/signin) without authentication', async ({ page }) => {
      // Navigate to sign in
      await page.goto('/signin');

      // Should load successfully
      await expect(page).toHaveURL('/signin');

      // Should see sign in form
      await expect(signInPage.heading).toBeVisible();
    });

    test('should access sign up page (/signup) without authentication', async ({ page }) => {
      // Navigate to sign up
      await page.goto('/signup');

      // Should load successfully
      await expect(page).toHaveURL('/signup');

      // Should see sign up form
      await expect(signUpPage.heading).toBeVisible();
    });
  });

  test.describe('Authenticated Public Access', () => {
    test.beforeEach(async ({ page }) => {
      // Create and sign in a test user
      const user = generateTestUser('public_auth');
      await createAndSignInUser(page, user);
    });

    test('should access home page (/) when authenticated', async ({ page }) => {
      // Navigate to home
      await page.goto('/');

      // Should load successfully
      await expect(page).toHaveURL('/');

      // Should see home page content
      await expect(page.getByRole('heading', { name: /welcome to bookshare/i })).toBeVisible();

      // Should show authenticated state in header
      expect(await basePage.isAuthenticated()).toBe(true);
    });

    test('should access browse page (/browse) when authenticated', async ({ page }) => {
      // Navigate to browse
      await page.goto('/browse');

      // Should load successfully
      await expect(page).toHaveURL('/browse');

      // Should see browse page content
      await expect(page.getByRole('heading', { name: /browse books/i })).toBeVisible();

      // Should show authenticated state in header
      expect(await basePage.isAuthenticated()).toBe(true);
    });

    test('should access book detail page (/books/:id) when authenticated', async ({ page }) => {
      // Navigate to browse first
      await page.goto('/browse');

      // Wait for books to load
      await page.waitForTimeout(2000);

      // Try to find and click a book card (if any exist)
      const bookCards = page.locator('[data-testid="book-card"], article, div').filter({ hasText: /borrow|available/i });
      const count = await bookCards.count();

      if (count > 0) {
        // Click first book
        await bookCards.first().click();

        // Should navigate to book detail page
        await page.waitForURL(/\/books\/.+/, { timeout: 5000 });

        // Should see book detail content
        await expect(page.locator('h1, h2').first()).toBeVisible();

        // Should show authenticated state in header
        expect(await basePage.isAuthenticated()).toBe(true);
      }
    });

    test('should redirect to home (/) when accessing /signin while authenticated', async ({ page }) => {
      // Attempt to visit sign in page
      await page.goto('/signin');

      // Should redirect to home
      await page.waitForURL('/', { timeout: 10000 });

      // Should be on home page
      await expect(page.getByRole('heading', { name: /welcome to bookshare/i })).toBeVisible();
    });

    test('should redirect to home (/) when accessing /signup while authenticated', async ({ page }) => {
      // Attempt to visit sign up page
      await page.goto('/signup');

      // Should redirect to home
      await page.waitForURL('/', { timeout: 10000 });

      // Should be on home page
      await expect(page.getByRole('heading', { name: /welcome to bookshare/i })).toBeVisible();
    });
  });

  test.describe('Navigation Between Public Routes', () => {
    test('should navigate between public routes using header links', async ({ page }) => {
      // Start at sign in
      await page.goto('/signin');

      // Click logo to go home
      await basePage.logo.click();
      await expect(page).toHaveURL('/');

      // Click Browse link
      await basePage.browseLink.click();
      await expect(page).toHaveURL('/browse');

      // Click Home link
      await basePage.homeLink.click();
      await expect(page).toHaveURL('/');
    });

    test('should navigate from sign in to sign up and back', async ({ page }) => {
      // Start at sign in
      await signInPage.goto();

      // Click create account link
      await signInPage.goToSignUp();
      await expect(page).toHaveURL('/signup');

      // Click sign in link
      await signUpPage.goToSignIn();
      await expect(page).toHaveURL('/signin');
    });
  });

  test.describe('Direct URL Access', () => {
    test('should allow direct navigation to public routes via URL', async ({ page }) => {
      // Ensure signed out
      await ensureSignedOut(page);

      // Direct navigation to home
      await page.goto('/');
      await expect(page).toHaveURL('/');

      // Direct navigation to browse
      await page.goto('/browse');
      await expect(page).toHaveURL('/browse');

      // Direct navigation to signin
      await page.goto('/signin');
      await expect(page).toHaveURL('/signin');

      // Direct navigation to signup
      await page.goto('/signup');
      await expect(page).toHaveURL('/signup');
    });
  });
});
