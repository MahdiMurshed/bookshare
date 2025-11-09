-- BookShare Database Schema
-- Execute this SQL in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Extends Supabase auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles
CREATE POLICY "Users can view all profiles"
  ON public.users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- BOOKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  genre TEXT,
  description TEXT,
  cover_image_url TEXT,
  condition TEXT NOT NULL CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  borrowable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS books_owner_id_idx ON public.books(owner_id);
CREATE INDEX IF NOT EXISTS books_genre_idx ON public.books(genre);
CREATE INDEX IF NOT EXISTS books_borrowable_idx ON public.books(borrowable);
CREATE INDEX IF NOT EXISTS books_title_author_idx ON public.books USING gin(to_tsvector('english', title || ' ' || author));

-- Row Level Security (RLS)
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Anyone can view all books
CREATE POLICY "Anyone can view books"
  ON public.books FOR SELECT
  USING (true);

-- Users can insert their own books
CREATE POLICY "Users can insert own books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update their own books
CREATE POLICY "Users can update own books"
  ON public.books FOR UPDATE
  USING (auth.uid() = owner_id);

-- Users can delete their own books
CREATE POLICY "Users can delete own books"
  ON public.books FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================================================
-- BORROW_REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.borrow_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  borrower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'denied', 'returned')) DEFAULT 'pending',
  request_message TEXT,
  response_message TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_borrow CHECK (borrower_id != owner_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS borrow_requests_book_id_idx ON public.borrow_requests(book_id);
CREATE INDEX IF NOT EXISTS borrow_requests_borrower_id_idx ON public.borrow_requests(borrower_id);
CREATE INDEX IF NOT EXISTS borrow_requests_owner_id_idx ON public.borrow_requests(owner_id);
CREATE INDEX IF NOT EXISTS borrow_requests_status_idx ON public.borrow_requests(status);

-- Row Level Security (RLS)
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;

-- Borrowers and owners can view their requests
CREATE POLICY "Users can view relevant borrow requests"
  ON public.borrow_requests FOR SELECT
  USING (auth.uid() = borrower_id OR auth.uid() = owner_id);

-- Users can create borrow requests
CREATE POLICY "Users can create borrow requests"
  ON public.borrow_requests FOR INSERT
  WITH CHECK (auth.uid() = borrower_id);

-- Owners can update requests for their books
CREATE POLICY "Owners can update borrow requests"
  ON public.borrow_requests FOR UPDATE
  USING (auth.uid() = owner_id OR auth.uid() = borrower_id);

-- Users can delete their own requests (if pending)
CREATE POLICY "Users can delete own pending requests"
  ON public.borrow_requests FOR DELETE
  USING (auth.uid() = borrower_id AND status = 'pending');

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(book_id, user_id) -- One review per user per book
);

-- Indexes
CREATE INDEX IF NOT EXISTS reviews_book_id_idx ON public.reviews(book_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON public.reviews(rating);

-- Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- Users can create reviews
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('borrow_request', 'request_approved', 'request_denied', 'book_returned', 'due_soon', 'overdue')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  payload JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- System can create notifications (handled via triggers or backend)
-- Allow authenticated users to create notifications for now
CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_borrow_requests_updated_at BEFORE UPDATE ON public.borrow_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
-- Create storage bucket for book covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('books', 'books', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for book covers
CREATE POLICY "Anyone can view book covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'books');

CREATE POLICY "Authenticated users can upload book covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'books' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own book covers"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'books' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own book covers"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'books' AND auth.role() = 'authenticated');

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - COMMENT OUT IN PRODUCTION)
-- ============================================================================
-- Uncomment below to insert sample data for testing

-- INSERT INTO public.users (id, email, name, bio) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'alice@example.com', 'Alice Johnson', 'Avid reader and book collector'),
--   ('00000000-0000-0000-0000-000000000002', 'bob@example.com', 'Bob Smith', 'Love science fiction and fantasy');

-- Note: You'll need to create these users in Supabase Auth first for the above to work
