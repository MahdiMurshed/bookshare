/**
 * Page Object Model for the Sign In page
 *
 * Encapsulates all interactions with the sign in page,
 * providing a clean API for tests to use.
 */

import { Page, Locator, expect } from '@playwright/test';

export class SignInPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly createAccountLink: Locator;
  readonly errorAlert: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /sign in to your account/i });
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.signInButton = page.getByRole('button', { name: /^sign in$/i });
    this.createAccountLink = page.getByRole('link', { name: /create account/i });
    this.errorAlert = page.locator('form').locator('div').filter({ hasText: /failed to sign in/i });
    this.loadingIndicator = page.getByText(/signing in/i);
  }

  /**
   * Navigates to the sign in page
   */
  async goto() {
    await this.page.goto('/signin');
    await expect(this.heading).toBeVisible();
  }

  /**
   * Fills in the sign in form
   *
   * @param email - User email
   * @param password - User password
   */
  async fillForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Submits the sign in form
   */
  async submit() {
    await this.signInButton.click();
  }

  /**
   * Signs in with provided credentials
   *
   * @param email - User email
   * @param password - User password
   */
  async signIn(email: string, password: string) {
    await this.fillForm(email, password);
    await this.submit();
  }

  /**
   * Clicks the "Create Account" link to navigate to sign up
   */
  async goToSignUp() {
    await this.createAccountLink.click();
    await this.page.waitForURL('/signup');
  }

  /**
   * Checks if an error message is displayed
   *
   * @returns Boolean indicating if error is visible
   */
  async hasError(): Promise<boolean> {
    return await this.errorAlert.isVisible();
  }

  /**
   * Gets the error message text
   *
   * @returns Error message text or null if no error
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.hasError()) {
      return await this.errorAlert.textContent();
    }
    return null;
  }

  /**
   * Checks if the form is in loading state
   *
   * @returns Boolean indicating if form is loading
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingIndicator.isVisible();
  }

  /**
   * Waits for the sign in to complete and redirect
   *
   * @param expectedUrl - Expected redirect URL (default: '/')
   */
  async waitForSignInSuccess(expectedUrl: string = '/') {
    await this.page.waitForURL(expectedUrl, { timeout: 10000 });
  }

  /**
   * Asserts that form validation errors are shown
   */
  async expectValidationErrors() {
    // Check for form field validation messages
    const validationMessage = this.page.locator('[class*="form-message"]');
    await expect(validationMessage.first()).toBeVisible();
  }

  /**
   * Checks if the sign in button is disabled
   *
   * @returns Boolean indicating if button is disabled
   */
  async isSignInButtonDisabled(): Promise<boolean> {
    return await this.signInButton.isDisabled();
  }
}
