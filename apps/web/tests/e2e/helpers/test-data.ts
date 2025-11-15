/**
 * Test data generators for E2E tests
 *
 * These functions create realistic test data with unique identifiers
 * to avoid collisions when tests run in parallel.
 */

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

/**
 * Generates a unique test user with valid credentials
 *
 * @param prefix - Optional prefix for the email (useful for test organization)
 * @returns TestUser object with name, email, and password
 */
export function generateTestUser(prefix: string = 'test'): TestUser {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const uniqueId = `${timestamp}_${random}`;

  return {
    name: `Test User ${uniqueId}`,
    email: `${prefix}_${uniqueId}@bookshare-test.com`,
    password: 'TestPass123!',
  };
}

/**
 * Generates multiple unique test users
 *
 * @param count - Number of users to generate
 * @param prefix - Optional prefix for the emails
 * @returns Array of TestUser objects
 */
export function generateTestUsers(count: number, prefix: string = 'test'): TestUser[] {
  return Array.from({ length: count }, (_, i) =>
    generateTestUser(`${prefix}_${i}`)
  );
}

/**
 * Generates invalid credentials for testing validation
 */
export const invalidCredentials = {
  invalidEmail: {
    email: 'not-an-email',
    password: 'TestPass123!',
  },
  shortPassword: {
    email: 'test@example.com',
    password: '12345',
  },
  weakPassword: {
    email: 'test@example.com',
    password: 'password', // No uppercase, no number
  },
  missingUppercase: {
    email: 'test@example.com',
    password: 'testpass123',
  },
  missingNumber: {
    email: 'test@example.com',
    password: 'TestPassword',
  },
  emptyEmail: {
    email: '',
    password: 'TestPass123!',
  },
  emptyPassword: {
    email: 'test@example.com',
    password: '',
  },
};

/**
 * Wait times for various operations (in milliseconds)
 * Adjusted based on typical operation durations
 */
export const waitTimes = {
  navigation: 5000,
  apiResponse: 10000,
  animation: 500,
  networkIdle: 2000,
};
