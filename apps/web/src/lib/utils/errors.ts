/**
 * Error Handling Utilities
 *
 * Provides standardized error message extraction and formatting
 * to ensure consistent error handling across the application
 */

/**
 * Extract a user-friendly error message from an unknown error type
 *
 * @param error - Unknown error (could be Error, string, or other type)
 * @param fallback - Fallback message if error cannot be parsed (default: "An unexpected error occurred")
 * @returns A user-friendly error message string
 *
 * @example
 * try {
 *   await someAsyncOperation();
 * } catch (err) {
 *   const message = getErrorMessage(err);
 *   setError(message);
 * }
 */
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle objects with message property
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  // Fallback for unknown error types
  return fallback;
}

/**
 * Check if an error is a network error
 *
 * @param error - Unknown error
 * @returns True if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch') ||
      error.message.toLowerCase().includes('connection')
    );
  }
  return false;
}

/**
 * Check if an error is an authentication error
 *
 * @param error - Unknown error
 * @returns True if error is auth-related
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('unauthorized') ||
      message.includes('unauthenticated') ||
      message.includes('forbidden') ||
      message.includes('not authenticated') ||
      message.includes('invalid credentials') ||
      message.includes('session expired')
    );
  }
  return false;
}

/**
 * Get a user-friendly error message with context
 *
 * @param error - Unknown error
 * @param context - Context about where the error occurred (e.g., "creating book", "signing in")
 * @returns A formatted error message with context
 *
 * @example
 * try {
 *   await createBook(data);
 * } catch (err) {
 *   const message = getContextualErrorMessage(err, 'creating book');
 *   // Returns: "Failed to create book: Book title is required"
 * }
 */
export function getContextualErrorMessage(error: unknown, context: string): string {
  const baseMessage = getErrorMessage(error);

  // Check for network errors
  if (isNetworkError(error)) {
    return `Network error while ${context}. Please check your connection and try again.`;
  }

  // Check for auth errors
  if (isAuthError(error)) {
    return `Authentication required for ${context}. Please sign in and try again.`;
  }

  // Return contextual message
  return `Failed to ${context}: ${baseMessage}`;
}

/**
 * Log error to console in development
 *
 * @param error - Unknown error
 * @param context - Optional context about where the error occurred
 */
export function logError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) {
    if (context) {
      console.error(`Error in ${context}:`, error);
    } else {
      console.error('Error:', error);
    }
  }

  // In production, you could send this to an error tracking service
  // e.g., Sentry, LogRocket, etc.
}

/**
 * Error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error class for not found errors
 */
export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * Error class for unauthorized errors
 */
export class UnauthorizedError extends Error {
  constructor(message = 'You are not authorized to perform this action') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
