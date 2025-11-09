/**
 * Supabase client initialization
 *
 * MIGRATION NOTE: This file encapsulates Supabase-specific setup.
 * When migrating to NestJS, replace this with an HTTP client or similar.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables are provided by the consuming app (web, mobile)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

/**
 * Supabase client instance
 * All database operations should use this client
 *
 * Note: We're not using a typed Database generic here to avoid type conflicts.
 * Types are defined separately in types.ts and enforced at the function level.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
