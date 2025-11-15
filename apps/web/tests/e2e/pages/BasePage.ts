/**
 * Base Page Object Model
 *
 * Contains common functionality used across all pages,
 * including header navigation and authentication status checks.
 */

import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly logo: Locator;
  readonly homeLink: Locator;
  readonly browseLink: Locator;
  readonly myLibraryLink: Locator;
  readonly requestsLink: Locator;
  readonly chatsLink: Locator;
  readonly signInButton: Locator;
  readonly signUpButton: Locator;
  readonly userAvatar: Locator;
  readonly notificationBell: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header');
    this.logo = page.locator('header').getByRole('link', { name: /bookshare/i });
    this.homeLink = page.locator('header').getByRole('link', { name: /^home$/i });
    this.browseLink = page.locator('header').getByRole('link', { name: /browse/i });
    this.myLibraryLink = page.locator('header').getByRole('link', { name: /my library/i });
    this.requestsLink = page.locator('header').getByRole('link', { name: /requests/i });
    this.chatsLink = page.locator('header').getByRole('link', { name: /chats/i });
    this.signInButton = page.locator('header').getByRole('link', { name: /sign in/i }).first();
    this.signUpButton = page.locator('header').getByRole('link', { name: /sign up/i }).first();
    this.userAvatar = page.locator('header').getByRole('button').filter({ has: page.locator('[class*="avatar"]') });
    this.notificationBell = page.locator('header').getByRole('link').filter({ has: page.locator('svg[class*="lucide-bell"]') });
  }

  /**
   * Checks if the user is authenticated based on header state
   *
   * @returns Boolean indicating if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await this.userAvatar.isVisible();
  }

  /**
   * Navigates to home page
   */
  async goToHome() {
    await this.logo.click();
    await this.page.waitForURL('/');
  }

  /**
   * Navigates to browse page
   */
  async goToBrowse() {
    await this.browseLink.click();
    await this.page.waitForURL('/browse');
  }

  /**
   * Navigates to My Library page (requires authentication)
   */
  async goToMyLibrary() {
    await this.myLibraryLink.click();
    await this.page.waitForURL('/my-library');
  }

  /**
   * Navigates to Requests page (requires authentication)
   */
  async goToRequests() {
    await this.requestsLink.click();
    await this.page.waitForURL('/requests');
  }

  /**
   * Navigates to Chats page (requires authentication)
   */
  async goToChats() {
    await this.chatsLink.click();
    await this.page.waitForURL('/chats');
  }

  /**
   * Navigates to Notifications page (requires authentication)
   */
  async goToNotifications() {
    await this.notificationBell.click();
    await this.page.waitForURL('/notifications');
  }

  /**
   * Opens user dropdown menu
   */
  async openUserMenu() {
    await this.userAvatar.click();
  }

  /**
   * Signs out through the user dropdown menu
   */
  async signOut() {
    await this.openUserMenu();
    await this.page.getByRole('menuitem', { name: /sign out/i }).click();
    await this.page.waitForURL('/signin', { timeout: 10000 });
  }

  /**
   * Navigates to profile page through user dropdown
   */
  async goToProfile() {
    await this.openUserMenu();
    await this.page.getByRole('menuitem', { name: /profile/i }).click();
    await this.page.waitForURL('/profile');
  }

  /**
   * Checks if protected route navigation links are visible
   *
   * @returns Boolean indicating if protected links are visible
   */
  async areProtectedLinksVisible(): Promise<boolean> {
    return await this.myLibraryLink.isVisible();
  }

  /**
   * Checks if public auth buttons are visible
   *
   * @returns Boolean indicating if sign in/up buttons are visible
   */
  async areAuthButtonsVisible(): Promise<boolean> {
    return await this.signInButton.isVisible();
  }

  /**
   * Gets the unread notification count from the bell icon
   *
   * @returns Number of unread notifications or 0 if none
   */
  async getNotificationCount(): Promise<number> {
    const badge = this.notificationBell.locator('[class*="badge"]');
    if (await badge.isVisible()) {
      const text = await badge.textContent();
      return text === '99+' ? 99 : parseInt(text || '0', 10);
    }
    return 0;
  }

  /**
   * Waits for page to fully load
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Asserts that the current URL matches the expected path
   *
   * @param expectedPath - Expected URL path
   */
  async expectUrl(expectedPath: string) {
    await expect(this.page).toHaveURL(expectedPath);
  }
}
