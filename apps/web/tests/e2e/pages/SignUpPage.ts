/**
 * Page Object Model for the Sign Up page
 *
 * Encapsulates all interactions with the sign up page,
 * providing a clean API for tests to use.
 */

import { Page, Locator, expect } from '@playwright/test';

export class SignUpPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly createAccountButton: Locator;
  readonly signInLink: Locator;
  readonly errorAlert: Locator;
  readonly loadingIndicator: Locator;
  readonly passwordHint: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /create account/i });
    this.nameInput = page.getByLabel(/full name/i);
    this.emailInput = page.getByLabel(/email address/i);
    this.passwordInput = page.getByLabel(/^password$/i);
    this.confirmPasswordInput = page.getByLabel(/confirm password/i);
    this.createAccountButton = page.getByRole('button', { name: /create account/i });
    this.signInLink = page.getByRole('link', { name: /sign in to your account/i });
    this.errorAlert = page.locator('form').locator('div').filter({ hasText: /failed to create account/i });
    this.loadingIndicator = page.getByText(/creating your account/i);
    this.passwordHint = page.getByText(/minimum 8 characters/i);
  }

  /**
   * Navigates to the sign up page
   */
  async goto() {
    await this.page.goto('/signup');
    await expect(this.heading).toBeVisible();
  }

  /**
   * Fills in the sign up form
   *
   * @param name - User's full name
   * @param email - User email
   * @param password - User password
   * @param confirmPassword - Password confirmation (defaults to password if not provided)
   */
  async fillForm(
    name: string,
    email: string,
    password: string,
    confirmPassword?: string
  ) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword ?? password);
  }

  /**
   * Submits the sign up form
   */
  async submit() {
    await this.createAccountButton.click();
  }

  /**
   * Signs up with provided credentials
   *
   * @param name - User's full name
   * @param email - User email
   * @param password - User password
   * @param confirmPassword - Password confirmation (defaults to password if not provided)
   */
  async signUp(
    name: string,
    email: string,
    password: string,
    confirmPassword?: string
  ) {
    await this.fillForm(name, email, password, confirmPassword);
    await this.submit();
  }

  /**
   * Clicks the "Sign In" link to navigate to sign in
   */
  async goToSignIn() {
    await this.signInLink.click();
    await this.page.waitForURL('/signin');
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
   * Waits for the sign up to complete and redirect
   *
   * @param expectedUrl - Expected redirect URL (default: '/signin')
   */
  async waitForSignUpSuccess(expectedUrl: string = '/signin') {
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
   * Checks if password hint is visible
   *
   * @returns Boolean indicating if hint is visible
   */
  async isPasswordHintVisible(): Promise<boolean> {
    return await this.passwordHint.isVisible();
  }

  /**
   * Checks if the create account button is disabled
   *
   * @returns Boolean indicating if button is disabled
   */
  async isCreateAccountButtonDisabled(): Promise<boolean> {
    return await this.createAccountButton.isDisabled();
  }

  /**
   * Gets validation error for a specific field
   *
   * @param fieldName - Name of the field to check
   * @returns Error message text or null if no error
   */
  async getFieldError(fieldName: 'name' | 'email' | 'password' | 'confirmPassword'): Promise<string | null> {
    let field: Locator;
    switch (fieldName) {
      case 'name':
        field = this.nameInput;
        break;
      case 'email':
        field = this.emailInput;
        break;
      case 'password':
        field = this.passwordInput;
        break;
      case 'confirmPassword':
        field = this.confirmPasswordInput;
        break;
    }

    // Find the error message associated with this field
    const fieldContainer = field.locator('..');
    const errorMessage = fieldContainer.locator('[class*="form-message"]');

    if (await errorMessage.isVisible()) {
      return await errorMessage.textContent();
    }
    return null;
  }
}
