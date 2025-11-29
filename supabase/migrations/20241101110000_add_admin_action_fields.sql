-- Migration 011: Add Admin Action Fields
-- Adds fields for user suspension, book flagging, and activity logging

-- Add suspension fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- Add index for efficient suspended user queries
CREATE INDEX IF NOT EXISTS idx_users_suspended ON users(suspended);

-- Add flagging fields to books table
ALTER TABLE books
ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS flagged_reason TEXT;

-- Add index for efficient flagged book queries
CREATE INDEX IF NOT EXISTS idx_books_flagged ON books(flagged);

-- Create user activity logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'book_added', 'borrow_request', 'review_posted', etc.
  entity_type TEXT, -- 'book', 'borrow_request', 'review', etc.
  entity_id UUID,
  description TEXT NOT NULL,
  metadata JSONB, -- Additional data about the action
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient activity log queries
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action_type ON user_activity_logs(action_type);

-- Enable RLS on user_activity_logs
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all activity logs
DROP POLICY IF EXISTS "Admins can read all activity logs" ON user_activity_logs;
CREATE POLICY "Admins can read all activity logs"
  ON user_activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Allow users to read their own activity logs
DROP POLICY IF EXISTS "Users can read own activity logs" ON user_activity_logs;
CREATE POLICY "Users can read own activity logs"
  ON user_activity_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Insert activity logs for existing data (optional, for historical data)
-- This creates activity logs for existing books
INSERT INTO user_activity_logs (user_id, action_type, entity_type, entity_id, description, created_at)
SELECT
  owner_id,
  'book_added',
  'book',
  id,
  'Added book: ' || title,
  created_at
FROM books
ON CONFLICT DO NOTHING;

-- Create activity logs for existing borrow requests
INSERT INTO user_activity_logs (user_id, action_type, entity_type, entity_id, description, created_at)
SELECT
  borrower_id,
  'borrow_request_created',
  'borrow_request',
  id,
  'Requested to borrow a book',
  requested_at
FROM borrow_requests
ON CONFLICT DO NOTHING;

-- Create function to automatically log book additions
CREATE OR REPLACE FUNCTION log_book_addition()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_logs (user_id, action_type, entity_type, entity_id, description)
  VALUES (
    NEW.owner_id,
    'book_added',
    'book',
    NEW.id,
    'Added book: ' || NEW.title
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic book addition logging
DROP TRIGGER IF EXISTS trigger_log_book_addition ON books;
CREATE TRIGGER trigger_log_book_addition
  AFTER INSERT ON books
  FOR EACH ROW
  EXECUTE FUNCTION log_book_addition();

-- Create function to automatically log borrow request actions
CREATE OR REPLACE FUNCTION log_borrow_request_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Log request creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO user_activity_logs (user_id, action_type, entity_type, entity_id, description)
    VALUES (
      NEW.borrower_id,
      'borrow_request_created',
      'borrow_request',
      NEW.id,
      'Requested to borrow a book'
    );
  END IF;

  -- Log status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    CASE NEW.status
      WHEN 'approved' THEN
        INSERT INTO user_activity_logs (user_id, action_type, entity_type, entity_id, description)
        VALUES (
          NEW.borrower_id,
          'borrow_request_approved',
          'borrow_request',
          NEW.id,
          'Borrow request was approved'
        );
      WHEN 'denied' THEN
        INSERT INTO user_activity_logs (user_id, action_type, entity_type, entity_id, description)
        VALUES (
          NEW.borrower_id,
          'borrow_request_denied',
          'borrow_request',
          NEW.id,
          'Borrow request was denied'
        );
      WHEN 'borrowed' THEN
        INSERT INTO user_activity_logs (user_id, action_type, entity_type, entity_id, description)
        VALUES (
          NEW.borrower_id,
          'book_borrowed',
          'borrow_request',
          NEW.id,
          'Started borrowing a book'
        );
      WHEN 'returned' THEN
        INSERT INTO user_activity_logs (user_id, action_type, entity_type, entity_id, description)
        VALUES (
          NEW.borrower_id,
          'book_returned',
          'borrow_request',
          NEW.id,
          'Returned a borrowed book'
        );
    END CASE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic borrow request logging
DROP TRIGGER IF EXISTS trigger_log_borrow_request_action ON borrow_requests;
CREATE TRIGGER trigger_log_borrow_request_action
  AFTER INSERT OR UPDATE ON borrow_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_borrow_request_action();
