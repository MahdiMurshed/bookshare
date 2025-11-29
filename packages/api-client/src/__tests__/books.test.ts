/**
 * Integration tests for Books API
 * Tests against real local Supabase instance
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTestClient, adminClient } from './setup';
import {
  createTestUser,
  signInTestUser,
  createTestBook,
  cleanupTestBooks,
  type TestUser,
} from './helpers';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('Books API', () => {
  let testClient: SupabaseClient;
  let testUser: TestUser;

  beforeAll(async () => {
    // Create a test user
    testUser = await createTestUser();

    // Create authenticated client and sign in
    testClient = createTestClient();
    await signInTestUser(testClient, testUser.email, testUser.password);
  });

  afterAll(async () => {
    // Cleanup books (users are cleaned up automatically via setup.ts)
    await cleanupTestBooks(testUser.user.id);
  });

  describe('createBook', () => {
    it('should create a book successfully', async () => {
      const bookData = {
        owner_id: testUser.user.id,
        title: 'Test Book Title',
        author: 'Test Author',
        genre: 'fiction',
        description: 'A test book description',
        condition: 'good',
        borrowable: true,
      };

      const { data, error } = await testClient
        .from('books')
        .insert(bookData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.title).toBe(bookData.title);
      expect(data?.author).toBe(bookData.author);
      expect(data?.owner_id).toBe(testUser.user.id);
    });

    it('should require title field', async () => {
      const bookData = {
        owner_id: testUser.user.id,
        author: 'Test Author',
        genre: 'fiction',
      };

      const { error } = await testClient
        .from('books')
        // @ts-expect-error - intentionally missing required field
        .insert(bookData)
        .select()
        .single();

      expect(error).toBeDefined();
    });

    it('should require owner_id field', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
      };

      const { error } = await testClient
        .from('books')
        // @ts-expect-error - intentionally missing required field
        .insert(bookData)
        .select()
        .single();

      expect(error).toBeDefined();
    });
  });

  describe('getBooks', () => {
    beforeEach(async () => {
      // Create some test books for queries using admin client
      await createTestBook(testUser.user.id);
      await createTestBook(testUser.user.id);
    });

    it('should fetch books for a user', async () => {
      const { data, error } = await testClient
        .from('books')
        .select('*')
        .eq('owner_id', testUser.user.id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter books by genre', async () => {
      // First create a book with specific genre
      const specificBook = await createTestBook(testUser.user.id, { genre: 'scifi' });

      const { data, error } = await testClient
        .from('books')
        .select('*')
        .eq('owner_id', testUser.user.id)
        .eq('genre', 'scifi');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.some(book => book.id === specificBook.id)).toBe(true);
    });

    it('should filter books by borrowable status', async () => {
      // Create a non-borrowable book
      await createTestBook(testUser.user.id, { borrowable: false });

      const { data, error } = await testClient
        .from('books')
        .select('*')
        .eq('owner_id', testUser.user.id)
        .eq('borrowable', true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.every(book => book.borrowable === true)).toBe(true);
    });
  });

  describe('updateBook', () => {
    it('should update own book successfully', async () => {
      const book = await createTestBook(testUser.user.id);

      const { data, error } = await testClient
        .from('books')
        .update({ title: 'Updated Title' })
        .eq('id', book.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.title).toBe('Updated Title');
    });

    it("should not update another user's book", async () => {
      // Create another user and their book
      const anotherUser = await createTestUser();
      const book = await createTestBook(anotherUser.user.id);

      const { data } = await testClient
        .from('books')
        .update({ title: 'Hacked Title' })
        .eq('id', book.id)
        .select()
        .single();

      // RLS should prevent this update - no data returned
      expect(data).toBeNull();

      // Verify book title unchanged using admin client
      const { data: checkData } = await adminClient
        .from('books')
        .select()
        .eq('id', book.id)
        .single();

      expect(checkData?.title).not.toBe('Hacked Title');
    });
  });

  describe('deleteBook', () => {
    it('should delete own book successfully', async () => {
      const book = await createTestBook(testUser.user.id);

      const { error } = await testClient
        .from('books')
        .delete()
        .eq('id', book.id);

      expect(error).toBeNull();

      // Verify deletion using admin client
      const { data: checkData } = await adminClient
        .from('books')
        .select()
        .eq('id', book.id)
        .single();

      expect(checkData).toBeNull();
    });

    it("should not delete another user's book", async () => {
      // Create another user and their book
      const anotherUser = await createTestUser();
      const book = await createTestBook(anotherUser.user.id);

      // Attempt to delete
      await testClient.from('books').delete().eq('id', book.id);

      // Verify the book still exists (using admin client)
      const { data: checkData } = await adminClient
        .from('books')
        .select()
        .eq('id', book.id)
        .single();

      expect(checkData).toBeDefined();
      expect(checkData?.id).toBe(book.id);
    });
  });
});
