/**
 * E2E Tests: User Sign In Flow
 *
 * Tests all aspects of user sign in including:
 * - Successful authentication
 * - Form validation
 * - Error handling
 * - Navigation
 */

import { test, expect } from '@playwright/test';
import { SignUpPage } from './pages/SignUpPage';
import { SignInPage } from './pages/SignInPage';
import { BasePage } from './pages/BasePage';
import { generateTestUser, invalidCredentials } from './helpers/test-data';
import { createAndSignInUser, ensureSignedOut } from './helpers/auth-helpers';

test.describe('User Sign In Flow', () => {
  let signInPage: SignInPage;
  let signUpPage: SignUpPage;
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    signUpPage = new SignUpPage(page);
    basePage = new BasePage(page);

    // Ensure user is signed out before each test
    await ensureSignedOut(page);

    // Navigate to sign in page
    await signInPage.goto();
  });

  test('should display sign in form with all required fields', async () => {
    // Verify page heading
    await expect(signInPage.heading).toBeVisible();
    await expect(signInPage.heading).toHaveText(/sign in to your account/i);

    // Verify all form fields are present
    await expect(signInPage.emailInput).toBeVisible();
    await expect(signInPage.passwordInput).toBeVisible();

    // Verify submit button
    await expect(signInPage.signInButton).toBeVisible();
    await expect(signInPage.signInButton).toHaveText(/sign in/i);

    // Verify navigation link to sign up
    await expect(signInPage.createAccountLink).toBeVisible();
  });

  test('should successfully sign in with valid credentials', async ({ page }) => {
    const user = generateTestUser('signin');

    // First create the user account
    await signUpPage.goto();
    await signUpPage.signUp(user.name, user.email, user.password);
    await signUpPage.waitForSignUpSuccess('/signin');

    // Now sign in with the created account
    await signInPage.signIn(user.email, user.password);

    // Should redirect to home page after successful sign in
    await signInPage.waitForSignInSuccess('/');

    // Verify user is authenticated
    expect(await basePage.isAuthenticated()).toBe(true);

    // Verify protected navigation links are visible
    expect(await basePage.areProtectedLinksVisible()).toBe(true);
  });

  test('should show error for invalid email format', async () => {
    // Fill in form with invalid email
    await signInPage.fillForm(
      invalidCredentials.invalidEmail.email,
      invalidCredentials.invalidEmail.password
    );
    await signInPage.submit();

    // Should show validation error
    await signInPage.expectValidationErrors();

    // Should not navigate away
    await expect(signInPage.heading).toBeVisible();
  });

  test('should show error for short password', async () => {
    // Fill in form with short password
    await signInPage.fillForm(
      invalidCredentials.shortPassword.email,
      invalidCredentials.shortPassword.password
    );
    await signInPage.submit();

    // Should show validation error
    await signInPage.expectValidationErrors();

    // Should not navigate away
    await expect(signInPage.heading).toBeVisible();
  });

  test('should show error for non-existent user', async () => {
    const user = generateTestUser('nonexistent');

    // Try to sign in with credentials that don't exist
    await signInPage.signIn(user.email, user.password);

    // Wait for error to appear
    await signInPage.page.waitForTimeout(2000);

    // Should show error message
    expect(await signInPage.hasError()).toBe(true);

    // Should remain on sign in page
    await expect(signInPage.heading).toBeVisible();
  });

  test('should show error for incorrect password', async ({ page }) => {
    const user = generateTestUser('wrong_pass');

    // First create the user account
    await signUpPage.goto();
    await signUpPage.signUp(user.name, user.email, user.password);
    await signUpPage.waitForSignUpSuccess('/signin');

    // Try to sign in with wrong password
    await signInPage.signIn(user.email, 'WrongPassword123!');

    // Wait for error to appear
    await signInPage.page.waitForTimeout(2000);

    // Should show error message
    expect(await signInPage.hasError()).toBe(true);

    // Should remain on sign in page
    await expect(signInPage.heading).toBeVisible();
  });

  test('should show validation error for empty email', async () => {
    // Fill in form with empty email
    await signInPage.fillForm(
      invalidCredentials.emptyEmail.email,
      invalidCredentials.emptyEmail.password
    );
    await signInPage.submit();

    // Should show validation error
    await signInPage.expectValidationErrors();

    // Should not navigate away
    await expect(signInPage.heading).toBeVisible();
  });

  test('should show validation error for empty password', async () => {
    // Fill in form with empty password
    await signInPage.fillForm(
      invalidCredentials.emptyPassword.email,
      invalidCredentials.emptyPassword.password
    );
    await signInPage.submit();

    // Should show validation error
    await signInPage.expectValidationErrors();

    // Should not navigate away
    await expect(signInPage.heading).toBeVisible();
  });

  test('should disable submit button while sign in is in progress', async ({ page }) => {
    const user = generateTestUser('loading');

    // First create the user account
    await signUpPage.goto();
    await signUpPage.signUp(user.name, user.email, user.password);
    await signUpPage.waitForSignUpSuccess('/signin');

    // Fill in the form
    await signInPage.fillForm(user.email, user.password);

    // Click submit
    await signInPage.signInButton.click();

    // Button should be disabled while loading
    expect(await signInPage.isSignInButtonDisabled()).toBe(true);

    // Loading indicator should be visible
    expect(await signInPage.isLoading()).toBe(true);
  });

  test('should navigate to sign up page when clicking create account link', async () => {
    // Click the create account link
    await signInPage.goToSignUp();

    // Should be on sign up page
    await expect(signUpPage.heading).toBeVisible();
    await expect(signInPage.page).toHaveURL('/signup');
  });

  test('should navigate to home when clicking logo', async () => {
    // Click the BookShare logo
    await basePage.logo.click();

    // Should navigate to home
    await basePage.page.waitForURL('/');
  });

  test('should persist authentication after page refresh', async ({ page }) => {
    const user = generateTestUser('persist');

    // Create and sign in user
    await createAndSignInUser(page, user);

    // Verify authenticated
    expect(await basePage.isAuthenticated()).toBe(true);

    // Refresh the page
    await page.reload();

    // Should still be authenticated
    expect(await basePage.isAuthenticated()).toBe(true);

    // Protected links should still be visible
    expect(await basePage.areProtectedLinksVisible()).toBe(true);
  });
});
