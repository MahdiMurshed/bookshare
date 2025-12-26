-- Migration: Improve RLS policies for borrow_requests table
-- Replaces overly permissive UPDATE policy with granular role-based policies

-- Drop the existing permissive UPDATE policy
DROP POLICY IF EXISTS "Owners can update borrow requests" ON public.borrow_requests;

-- ============================================================================
-- OWNER POLICIES (for book owners)
-- ============================================================================

-- Policy 1: Owners can approve/deny pending requests
-- Allows owner to update status from 'pending' to 'approved' or 'denied'
-- and set associated fields (response_message, due_date, handover details)
DROP POLICY IF EXISTS "Owners can approve or deny pending requests" ON public.borrow_requests;
CREATE POLICY "Owners can approve or deny pending requests"
  ON public.borrow_requests FOR UPDATE
  USING (
    auth.uid() = owner_id
    AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = owner_id
    AND status IN ('approved', 'denied')
  );

-- Policy 2: Owners can update handover tracking
-- Allows owner to add/update tracking number for handover shipments
DROP POLICY IF EXISTS "Owners can update handover tracking" ON public.borrow_requests;
CREATE POLICY "Owners can update handover tracking"
  ON public.borrow_requests FOR UPDATE
  USING (
    auth.uid() = owner_id
    AND status IN ('approved', 'borrowed')
  );

-- Policy 3: Owners can mark book as returned
-- Allows owner to mark status as 'returned' when borrower initiated return
DROP POLICY IF EXISTS "Owners can mark book as returned" ON public.borrow_requests;
CREATE POLICY "Owners can mark book as returned"
  ON public.borrow_requests FOR UPDATE
  USING (
    auth.uid() = owner_id
    AND status = 'return_initiated'
  )
  WITH CHECK (
    auth.uid() = owner_id
    AND status = 'returned'
  );

-- ============================================================================
-- BORROWER POLICIES (for users borrowing books)
-- ============================================================================

-- Policy 4: Borrowers can mark handover as complete
-- Allows borrower to confirm they received the book
DROP POLICY IF EXISTS "Borrowers can mark handover complete" ON public.borrow_requests;
CREATE POLICY "Borrowers can mark handover complete"
  ON public.borrow_requests FOR UPDATE
  USING (
    auth.uid() = borrower_id
    AND status = 'approved'
  )
  WITH CHECK (
    auth.uid() = borrower_id
    AND status = 'borrowed'
  );

-- Policy 5: Borrowers can initiate return
-- Allows borrower to start return process and provide return details
DROP POLICY IF EXISTS "Borrowers can initiate return" ON public.borrow_requests;
CREATE POLICY "Borrowers can initiate return"
  ON public.borrow_requests FOR UPDATE
  USING (
    auth.uid() = borrower_id
    AND status = 'borrowed'
  )
  WITH CHECK (
    auth.uid() = borrower_id
    AND status = 'return_initiated'
  );

-- Policy 6: Borrowers can update return tracking
-- Allows borrower to add/update tracking number for return shipments
DROP POLICY IF EXISTS "Borrowers can update return tracking" ON public.borrow_requests;
CREATE POLICY "Borrowers can update return tracking"
  ON public.borrow_requests FOR UPDATE
  USING (
    auth.uid() = borrower_id
    AND status IN ('borrowed', 'return_initiated')
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Owners can approve or deny pending requests" ON public.borrow_requests IS
'Allows book owners to approve or deny pending borrow requests and set handover details';

COMMENT ON POLICY "Owners can update handover tracking" ON public.borrow_requests IS
'Allows book owners to add or update tracking numbers for handover shipments';

COMMENT ON POLICY "Owners can mark book as returned" ON public.borrow_requests IS
'Allows book owners to mark a book as returned after borrower initiated return';

COMMENT ON POLICY "Borrowers can mark handover complete" ON public.borrow_requests IS
'Allows borrowers to confirm they received the book (approved -> borrowed)';

COMMENT ON POLICY "Borrowers can initiate return" ON public.borrow_requests IS
'Allows borrowers to initiate the return process and provide return details';

COMMENT ON POLICY "Borrowers can update return tracking" ON public.borrow_requests IS
'Allows borrowers to add or update tracking numbers for return shipments';
