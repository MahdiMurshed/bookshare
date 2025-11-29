-- Migration: Sync local schema with hosted production
-- This migration brings the local database in line with the hosted Supabase schema

-- ============================================================================
-- STEP 1: EXTENSIONS
-- ============================================================================

-- Add extensions that exist in hosted
CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";

-- Remove pg_net if it exists (not in hosted)
DROP EXTENSION IF EXISTS "pg_net";

-- ============================================================================
-- STEP 2: DROP OLD POLICIES (using local naming convention)
-- ============================================================================

-- Books policies
DROP POLICY IF EXISTS "Books are viewable by everyone" ON public.books;
DROP POLICY IF EXISTS "Anyone can view books" ON public.books;

-- Borrow requests policies
DROP POLICY IF EXISTS "Borrow requests viewable by participants" ON public.borrow_requests;
DROP POLICY IF EXISTS "Participants can delete borrow requests" ON public.borrow_requests;
DROP POLICY IF EXISTS "Participants can update borrow requests" ON public.borrow_requests;
DROP POLICY IF EXISTS "Users can view relevant borrow requests" ON public.borrow_requests;
DROP POLICY IF EXISTS "Users can delete own pending requests" ON public.borrow_requests;

-- Messages policies
DROP POLICY IF EXISTS "Messages viewable by request participants" ON public.messages;
DROP POLICY IF EXISTS "Request participants can send messages" ON public.messages;
DROP POLICY IF EXISTS "Request participants can update messages" ON public.messages;

-- Reviews policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;

-- User activity logs policies
DROP POLICY IF EXISTS "System can insert activity logs" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Users can view own activity logs" ON public.user_activity_logs;

-- Users policies
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

-- ============================================================================
-- STEP 3: DROP OLD INDEXES (local naming convention: idx_table_column)
-- ============================================================================

DROP INDEX IF EXISTS public.idx_books_borrowable;
DROP INDEX IF EXISTS public.idx_books_genre;
DROP INDEX IF EXISTS public.idx_books_owner_id;
DROP INDEX IF EXISTS public.idx_borrow_requests_book_id;
DROP INDEX IF EXISTS public.idx_borrow_requests_borrower_id;
DROP INDEX IF EXISTS public.idx_borrow_requests_owner_id;
DROP INDEX IF EXISTS public.idx_borrow_requests_status;
DROP INDEX IF EXISTS public.idx_messages_borrow_request_id;
DROP INDEX IF EXISTS public.idx_messages_sender_id;
DROP INDEX IF EXISTS public.idx_notifications_read;
DROP INDEX IF EXISTS public.idx_notifications_user_id;
DROP INDEX IF EXISTS public.idx_reviews_book_id;
DROP INDEX IF EXISTS public.idx_reviews_user_id;

-- ============================================================================
-- STEP 4: ALTER COLUMN DEFAULTS AND NULLABILITY (to match hosted)
-- ============================================================================

-- books.condition - drop default
ALTER TABLE public.books ALTER COLUMN condition DROP DEFAULT;

-- books.flagged - make nullable
ALTER TABLE public.books ALTER COLUMN flagged DROP NOT NULL;

-- users.is_admin - make nullable
ALTER TABLE public.users ALTER COLUMN is_admin DROP NOT NULL;

-- users.name - drop default
ALTER TABLE public.users ALTER COLUMN name DROP DEFAULT;

-- users.suspended - make nullable
ALTER TABLE public.users ALTER COLUMN suspended DROP NOT NULL;

-- user_activity_logs.created_at - make nullable
ALTER TABLE public.user_activity_logs ALTER COLUMN created_at DROP NOT NULL;

-- user_activity_logs.id - use gen_random_uuid() default
ALTER TABLE public.user_activity_logs ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================================================
-- STEP 5: DROP ENUM TYPES (hosted uses CHECK constraints instead)
-- ============================================================================

-- These may fail if not created, that's ok
DROP TYPE IF EXISTS public.book_condition;
DROP TYPE IF EXISTS public.borrow_request_status;
DROP TYPE IF EXISTS public.handover_method;
DROP TYPE IF EXISTS public.return_method;

-- ============================================================================
-- STEP 6: CREATE INDEXES (hosted naming convention: table_column_idx)
-- ============================================================================

-- Books indexes
CREATE INDEX IF NOT EXISTS books_borrowable_idx ON public.books USING btree (borrowable);
CREATE INDEX IF NOT EXISTS books_genre_idx ON public.books USING btree (genre);
CREATE INDEX IF NOT EXISTS books_owner_id_idx ON public.books USING btree (owner_id);
CREATE INDEX IF NOT EXISTS books_title_author_idx ON public.books USING gin (to_tsvector('english'::regconfig, ((title || ' '::text) || author)));

-- Borrow requests indexes
CREATE INDEX IF NOT EXISTS borrow_requests_book_id_idx ON public.borrow_requests USING btree (book_id);
CREATE INDEX IF NOT EXISTS borrow_requests_borrower_id_idx ON public.borrow_requests USING btree (borrower_id);
CREATE INDEX IF NOT EXISTS borrow_requests_owner_id_idx ON public.borrow_requests USING btree (owner_id);
CREATE INDEX IF NOT EXISTS borrow_requests_status_idx ON public.borrow_requests USING btree (status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications USING btree (read);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications USING btree (user_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS reviews_book_id_idx ON public.reviews USING btree (book_id);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON public.reviews USING btree (rating);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews USING btree (user_id);

-- Users indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users USING btree (email);

-- Messages indexes - drop messages_borrow_request_id_idx (doesn't exist in hosted)
DROP INDEX IF EXISTS public.messages_borrow_request_id_idx;
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages USING btree (sender_id);

-- ============================================================================
-- STEP 7: ADD CONSTRAINTS (to match hosted)
-- ============================================================================

-- Add unique constraint on users.email
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);

-- Add CHECK constraints for books.condition
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_condition_check;
ALTER TABLE public.books ADD CONSTRAINT books_condition_check
  CHECK (condition = ANY (ARRAY['excellent'::text, 'good'::text, 'fair'::text, 'poor'::text]));

-- Add CHECK constraints for borrow_requests.handover_method
ALTER TABLE public.borrow_requests DROP CONSTRAINT IF EXISTS borrow_requests_handover_method_check;
ALTER TABLE public.borrow_requests ADD CONSTRAINT borrow_requests_handover_method_check
  CHECK (handover_method = ANY (ARRAY['ship'::text, 'meetup'::text, 'pickup'::text]));

-- Add CHECK constraints for borrow_requests.return_method
ALTER TABLE public.borrow_requests DROP CONSTRAINT IF EXISTS borrow_requests_return_method_check;
ALTER TABLE public.borrow_requests ADD CONSTRAINT borrow_requests_return_method_check
  CHECK (return_method = ANY (ARRAY['ship'::text, 'meetup'::text, 'dropoff'::text]));

-- Add no_self_borrow constraint
ALTER TABLE public.borrow_requests DROP CONSTRAINT IF EXISTS no_self_borrow;
ALTER TABLE public.borrow_requests ADD CONSTRAINT no_self_borrow
  CHECK (borrower_id <> owner_id);

-- ============================================================================
-- STEP 8: CREATE POLICIES (hosted naming convention)
-- ============================================================================

-- Books policies
CREATE POLICY "Anyone can view books"
  ON public.books FOR SELECT
  TO public
  USING (true);

-- Borrow requests policies
CREATE POLICY "Users can view relevant borrow requests"
  ON public.borrow_requests FOR SELECT
  TO public
  USING ((auth.uid() = borrower_id) OR (auth.uid() = owner_id));

CREATE POLICY "Users can delete own pending requests"
  ON public.borrow_requests FOR DELETE
  TO public
  USING ((auth.uid() = borrower_id) AND (status = 'pending'::text));

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- Users policies
CREATE POLICY "Users can view all profiles"
  ON public.users FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- STEP 9: DISABLE RLS ON COMMUNITIES (to match hosted)
-- ============================================================================

ALTER TABLE public.communities DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 10: CREATE STORAGE BUCKET AND POLICIES
-- ============================================================================

-- Create books storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('books', 'books', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for books bucket
DROP POLICY IF EXISTS "Anyone can view book covers" ON storage.objects;
CREATE POLICY "Anyone can view book covers"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'books'::text);

DROP POLICY IF EXISTS "Authenticated users can upload book covers" ON storage.objects;
CREATE POLICY "Authenticated users can upload book covers"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK ((bucket_id = 'books'::text) AND (auth.role() = 'authenticated'::text));

DROP POLICY IF EXISTS "Users can delete own book covers" ON storage.objects;
CREATE POLICY "Users can delete own book covers"
  ON storage.objects FOR DELETE
  TO public
  USING ((bucket_id = 'books'::text) AND (auth.role() = 'authenticated'::text));

DROP POLICY IF EXISTS "Users can update own book covers" ON storage.objects;
CREATE POLICY "Users can update own book covers"
  ON storage.objects FOR UPDATE
  TO public
  USING ((bucket_id = 'books'::text) AND (auth.role() = 'authenticated'::text));

-- ============================================================================
-- STEP 11: ENSURE update_updated_at_column FUNCTION EXISTS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;
