/**
 * Authentication abstraction layer
 *
 * Provides backend-agnostic authentication functions.
 * Currently implemented with Supabase Auth.
 *
 * MIGRATION NOTE: When migrating to NestJS, replace Supabase calls
 * with REST API calls to /auth/* endpoints while keeping function signatures identical.
 */

import { supabase } from './supabaseClient.js';
import type { SignUpCredentials, SignInCredentials, AuthUser, Session } from './types.js';

/**
 * Sign up a new user
 */
export async function signUp(credentials: SignUpCredentials) {
  // Current: Supabase implementation
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        name: credentials.name,
      },
    },
  });

  if (error) throw error;

  // Note: User profile is automatically created via database trigger
  // See migrations/001_add_user_profile_trigger.sql

  return data;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/auth/signup`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(credentials),
  // });
  // return response.json();
}

/**
 * Sign in an existing user
 */
export async function signIn(credentials: SignInCredentials) {
  // Current: Supabase implementation
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) throw error;
  return data;

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/auth/signin`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(credentials),
  // });
  // return response.json();
}

/**
 * Sign out the current user
 */
export async function signOut() {
  // Current: Supabase implementation
  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  // Future: NestJS implementation
  // await fetch(`${API_URL}/auth/signout`, { method: 'POST' });
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  // Current: Supabase implementation
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  // Map Supabase session to our Session type
  if (!data.session) return null;

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
    user: {
      id: data.session.user.id,
      email: data.session.user.email ?? '',
      user_metadata: data.session.user.user_metadata,
    },
  };

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/auth/session`);
  // return response.json();
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  // Current: Supabase implementation
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  if (!data.user) return null;

  // Map Supabase user to our AuthUser type
  return {
    id: data.user.id,
    email: data.user.email ?? '',
    user_metadata: data.user.user_metadata,
  };

  // Future: NestJS implementation
  // const response = await fetch(`${API_URL}/auth/me`);
  // return response.json();
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  // Current: Supabase implementation
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event: string, session: { user?: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null) => {
      if (!session?.user) {
        callback(null);
        return;
      }

      // Map to our AuthUser type
      callback({
        id: session.user.id,
        email: session.user.email ?? '',
        user_metadata: session.user.user_metadata,
      });
    }
  );

  return () => {
    subscription.unsubscribe();
  };

  // Future: NestJS implementation
  // Use WebSocket or polling to detect auth state changes
  // const ws = new WebSocket(`${WS_URL}/auth/state`);
  // ws.onmessage = (event) => callback(JSON.parse(event.data));
  // return () => ws.close();
}

/**
 * Reset password for a user
 */
export async function resetPassword(email: string) {
  // Current: Supabase implementation
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;

  // Future: NestJS implementation
  // await fetch(`${API_URL}/auth/reset-password`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email }),
  // });
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  // Current: Supabase implementation
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;

  // Future: NestJS implementation
  // await fetch(`${API_URL}/auth/update-password`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ password: newPassword }),
  // });
}
