-- Migration: Add handover and return tracking fields to borrow_requests table
-- This enables physical book exchange logistics tracking
-- Made idempotent with IF NOT EXISTS

DO $$
BEGIN
  -- Handover fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrow_requests' AND column_name = 'handover_method') THEN
    ALTER TABLE borrow_requests ADD COLUMN handover_method TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrow_requests' AND column_name = 'handover_address') THEN
    ALTER TABLE borrow_requests ADD COLUMN handover_address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrow_requests' AND column_name = 'handover_datetime') THEN
    ALTER TABLE borrow_requests ADD COLUMN handover_datetime TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrow_requests' AND column_name = 'handover_instructions') THEN
    ALTER TABLE borrow_requests ADD COLUMN handover_instructions TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrow_requests' AND column_name = 'handover_tracking') THEN
    ALTER TABLE borrow_requests ADD COLUMN handover_tracking TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrow_requests' AND column_name = 'handover_completed_at') THEN
    ALTER TABLE borrow_requests ADD COLUMN handover_completed_at TIMESTAMPTZ;
  END IF;

  -- Return fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrow_requests' AND column_name = 'return_method') THEN
    ALTER TABLE borrow_requests ADD COLUMN return_method TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrow_requests' AND column_name = 'return_address') THEN
    ALTER TABLE borrow_requests ADD COLUMN return_address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrow_requests' AND column_name = 'return_datetime') THEN
    ALTER TABLE borrow_requests ADD COLUMN return_datetime TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrow_requests' AND column_name = 'return_instructions') THEN
    ALTER TABLE borrow_requests ADD COLUMN return_instructions TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrow_requests' AND column_name = 'return_tracking') THEN
    ALTER TABLE borrow_requests ADD COLUMN return_tracking TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrow_requests' AND column_name = 'return_initiated_at') THEN
    ALTER TABLE borrow_requests ADD COLUMN return_initiated_at TIMESTAMPTZ;
  END IF;
END $$;

-- Update status constraint to include new statuses
ALTER TABLE borrow_requests
  DROP CONSTRAINT IF EXISTS borrow_requests_status_check;

ALTER TABLE borrow_requests
  ADD CONSTRAINT borrow_requests_status_check
  CHECK (status IN ('pending', 'approved', 'borrowed', 'return_initiated', 'returned', 'denied'));

-- Comments for documentation
COMMENT ON COLUMN borrow_requests.handover_method IS 'How the book will be delivered to borrower: ship (parcel), meetup (in person), or pickup (borrower comes to owner)';
COMMENT ON COLUMN borrow_requests.handover_address IS 'Shipping address or pickup location';
COMMENT ON COLUMN borrow_requests.handover_datetime IS 'Scheduled time for meetup or pickup window';
COMMENT ON COLUMN borrow_requests.handover_instructions IS 'Special instructions for handover (e.g., "Ring doorbell, Apt 3B")';
COMMENT ON COLUMN borrow_requests.handover_tracking IS 'Parcel tracking number if shipped';
COMMENT ON COLUMN borrow_requests.handover_completed_at IS 'When handover was marked complete (borrower received book)';

COMMENT ON COLUMN borrow_requests.return_method IS 'How the book will be returned: ship (parcel back), meetup (in person), or dropoff (return to owner location)';
COMMENT ON COLUMN borrow_requests.return_address IS 'Return shipping address or dropoff location';
COMMENT ON COLUMN borrow_requests.return_datetime IS 'Scheduled time for return meetup';
COMMENT ON COLUMN borrow_requests.return_instructions IS 'Special instructions for return';
COMMENT ON COLUMN borrow_requests.return_tracking IS 'Return parcel tracking number';
COMMENT ON COLUMN borrow_requests.return_initiated_at IS 'When borrower initiated the return process';
