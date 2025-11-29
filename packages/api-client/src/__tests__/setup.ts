/**
 * Test Setup for API Client Integration Tests
 *
 * This file configures the test environment with local Supabase clients.
 * Tests run against a real local Supabase instance for maximum confidence.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import 'dotenv/config';

// Local Supabase credentials (from `supabase start`)
// These are the default local development credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

/**
 * Admin client for test setup/teardown
 * Uses service_role key to bypass RLS policies
 * CRITICAL: persistSession must be false to prevent session contamination
 */
export const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Creates a fresh test client for each test
 * Uses anon key and respects RLS policies (like real users)
 * CRITICAL: persistSession must be false for test isolation
 */
export const createTestClient = (): SupabaseClient => {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

// Global test client - recreated for each test
export let testClient: SupabaseClient;

// Track created test users for cleanup
const createdUserIds: string[] = [];

/**
 * Register a user ID for cleanup after tests
 */
export const registerUserForCleanup = (userId: string) => {
  if (!createdUserIds.includes(userId)) {
    createdUserIds.push(userId);
  }
};

beforeAll(async () => {
  // Verify local Supabase is running
  try {
    const { error } = await adminClient.from('users').select('id').limit(1);
    if (error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        throw new Error(
          '\n\n❌ Local Supabase is not running!\n\n' +
            'Please start it with:\n' +
            '  supabase start\n\n' +
            'Then run tests again.\n'
        );
      }
      // Table might not exist yet, but connection works
      console.log('Note: users table may not exist yet, but Supabase is running');
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('Local Supabase')) {
      throw err;
    }
    throw new Error(
      '\n\n❌ Cannot connect to local Supabase!\n\n' +
        'Make sure Docker is running and start Supabase with:\n' +
        '  supabase start\n\n' +
        `Error: ${err}\n`
    );
  }
});

beforeEach(() => {
  // Create a fresh test client for each test
  testClient = createTestClient();
});

afterEach(async () => {
  // Sign out the test client after each test
  await testClient.auth.signOut();
});

afterAll(async () => {
  // Cleanup all created test users
  for (const userId of createdUserIds) {
    try {
      await adminClient.auth.admin.deleteUser(userId);
    } catch (err) {
      console.warn(`Failed to cleanup user ${userId}:`, err);
    }
  }
  createdUserIds.length = 0;
});

// Export URL for tests that need it
export const supabaseUrl = SUPABASE_URL;
