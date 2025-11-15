-- Migration: Add handover and return tracking fields to borrow_requests table
-- This enables physical book exchange logistics tracking

ALTER TABLE borrow_requests
  -- Handover fields (for getting the book to the borrower)
  ADD COLUMN handover_method TEXT CHECK (handover_method IN ('ship', 'meetup', 'pickup')),
  ADD COLUMN handover_address TEXT,
  ADD COLUMN handover_datetime TIMESTAMPTZ,
  ADD COLUMN handover_instructions TEXT,
  ADD COLUMN handover_tracking TEXT,
  ADD COLUMN handover_completed_at TIMESTAMPTZ,

  -- Return fields (for returning the book to the owner)
  ADD COLUMN return_method TEXT CHECK (return_method IN ('ship', 'meetup', 'dropoff')),
  ADD COLUMN return_address TEXT,
  ADD COLUMN return_datetime TIMESTAMPTZ,
  ADD COLUMN return_instructions TEXT,
  ADD COLUMN return_tracking TEXT,
  ADD COLUMN return_initiated_at TIMESTAMPTZ;

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
