/**
 * E2E Tests: User Registration Flow
 *
 * Tests all aspects of user sign up including:
 * - Successful registration
 * - Form validation
 * - Error handling
 * - Navigation
 */

import { test, expect } from '@playwright/test';
import { SignUpPage } from './pages/SignUpPage';
import { SignInPage } from './pages/SignInPage';
import { BasePage } from './pages/BasePage';
import { generateTestUser, invalidCredentials } from './helpers/test-data';

test.describe('User Registration Flow', () => {
  let signUpPage: SignUpPage;
  let signInPage: SignInPage;
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    signInPage = new SignInPage(page);
    basePage = new BasePage(page);

    // Navigate to sign up page
    await signUpPage.goto();
  });

  test('should display sign up form with all required fields', async () => {
    // Verify page heading
    await expect(signUpPage.heading).toBeVisible();
    await expect(signUpPage.heading).toHaveText(/create account/i);

    // Verify all form fields are present
    await expect(signUpPage.nameInput).toBeVisible();
    await expect(signUpPage.emailInput).toBeVisible();
    await expect(signUpPage.passwordInput).toBeVisible();
    await expect(signUpPage.confirmPasswordInput).toBeVisible();

    // Verify submit button
    await expect(signUpPage.createAccountButton).toBeVisible();
    await expect(signUpPage.createAccountButton).toHaveText(/create account/i);

    // Verify navigation link to sign in
    await expect(signUpPage.signInLink).toBeVisible();
  });

  test('should successfully register a new user', async () => {
    const user = generateTestUser('signup');

    // Fill in and submit the form
    await signUpPage.signUp(user.name, user.email, user.password);

    // Should redirect to sign in page after successful registration
    await signUpPage.waitForSignUpSuccess('/signin');

    // Verify we're on sign in page
    await expect(signInPage.heading).toBeVisible();

    // Now sign in with the newly created account
    await signInPage.signIn(user.email, user.password);

    // Should redirect to home page after sign in
    await signInPage.waitForSignInSuccess('/');

    // Verify user is authenticated
    expect(await basePage.isAuthenticated()).toBe(true);
  });

  test('should show validation error for invalid email', async () => {
    const user = generateTestUser('invalid_email');

    // Fill form with invalid email
    await signUpPage.fillForm(
      user.name,
      invalidCredentials.invalidEmail.email,
      user.password
    );
    await signUpPage.submit();

    // Should show validation error
    await signUpPage.expectValidationErrors();

    // Should not navigate away
    await expect(signUpPage.heading).toBeVisible();
  });

  test('should show validation error for short password', async () => {
    const user = generateTestUser('short_pass');

    // Fill form with password that's too short
    await signUpPage.fillForm(
      user.name,
      user.email,
      invalidCredentials.shortPassword.password
    );
    await signUpPage.submit();

    // Should show validation error
    await signUpPage.expectValidationErrors();

    // Should not navigate away
    await expect(signUpPage.heading).toBeVisible();
  });

  test('should show validation error for weak password (no uppercase)', async () => {
    const user = generateTestUser('weak_pass');

    // Fill form with password missing uppercase letter
    await signUpPage.fillForm(
      user.name,
      user.email,
      invalidCredentials.missingUppercase.password
    );
    await signUpPage.submit();

    // Should show validation error
    await signUpPage.expectValidationErrors();

    // Should not navigate away
    await expect(signUpPage.heading).toBeVisible();
  });

  test('should show validation error for weak password (no number)', async () => {
    const user = generateTestUser('weak_pass_no_num');

    // Fill form with password missing number
    await signUpPage.fillForm(
      user.name,
      user.email,
      invalidCredentials.missingNumber.password
    );
    await signUpPage.submit();

    // Should show validation error
    await signUpPage.expectValidationErrors();

    // Should not navigate away
    await expect(signUpPage.heading).toBeVisible();
  });

  test('should show validation error when passwords do not match', async () => {
    const user = generateTestUser('mismatch');

    // Fill form with mismatched passwords
    await signUpPage.fillForm(
      user.name,
      user.email,
      user.password,
      'DifferentPassword123!'
    );
    await signUpPage.submit();

    // Should show validation error
    await signUpPage.expectValidationErrors();

    // Should not navigate away
    await expect(signUpPage.heading).toBeVisible();
  });

  test('should show validation error for missing name', async () => {
    const user = generateTestUser('no_name');

    // Fill form without name
    await signUpPage.fillForm(
      '', // Empty name
      user.email,
      user.password
    );
    await signUpPage.submit();

    // Should show validation error
    await signUpPage.expectValidationErrors();

    // Should not navigate away
    await expect(signUpPage.heading).toBeVisible();
  });

  test('should show validation error for short name', async () => {
    const user = generateTestUser('short_name');

    // Fill form with name that's too short (less than 2 characters)
    await signUpPage.fillForm(
      'A',
      user.email,
      user.password
    );
    await signUpPage.submit();

    // Should show validation error
    await signUpPage.expectValidationErrors();

    // Should not navigate away
    await expect(signUpPage.heading).toBeVisible();
  });

  test('should show error when registering with duplicate email', async () => {
    const user = generateTestUser('duplicate');

    // First registration
    await signUpPage.signUp(user.name, user.email, user.password);
    await signUpPage.waitForSignUpSuccess('/signin');

    // Go back to sign up page
    await signUpPage.goto();

    // Try to register again with same email
    await signUpPage.signUp(user.name, user.email, user.password);

    // Should show error (Supabase will return duplicate user error)
    // Note: This may take a moment for the API to respond
    await signUpPage.page.waitForTimeout(1000);

    // Error should be visible
    expect(await signUpPage.hasError()).toBe(true);

    // Should remain on sign up page
    await expect(signUpPage.heading).toBeVisible();
  });

  test('should disable submit button while registration is in progress', async () => {
    const user = generateTestUser('loading_state');

    // Fill in the form
    await signUpPage.fillForm(user.name, user.email, user.password);

    // Click submit
    await signUpPage.createAccountButton.click();

    // Button should be disabled while loading
    expect(await signUpPage.isCreateAccountButtonDisabled()).toBe(true);

    // Loading indicator should be visible
    expect(await signUpPage.isLoading()).toBe(true);
  });

  test('should display password requirements hint', async () => {
    // Password hint should be visible
    expect(await signUpPage.isPasswordHintVisible()).toBe(true);

    // Verify hint text
    await expect(signUpPage.passwordHint).toHaveText(/minimum 8 characters/i);
  });

  test('should navigate to sign in page when clicking sign in link', async () => {
    // Click the sign in link
    await signUpPage.goToSignIn();

    // Should be on sign in page
    await expect(signInPage.heading).toBeVisible();
    await expect(signUpPage.page).toHaveURL('/signin');
  });

  test('should navigate to home when clicking logo', async () => {
    // Click the BookShare logo
    await basePage.logo.click();

    // Should navigate to home
    await basePage.page.waitForURL('/');
  });
});
