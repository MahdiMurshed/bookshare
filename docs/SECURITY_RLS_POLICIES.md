# Supabase Row Level Security (RLS) Policies

This document outlines the Row Level Security (RLS) policies that should be implemented in Supabase to ensure data security and proper access control.

## Overview

Row Level Security (RLS) is enabled on all tables to ensure users can only access data they're authorized to see. All policies follow the principle of least privilege.

## Table Policies

### Users Table

**Enable RLS:** ✅ Yes

**Policies:**

1. **Select Own Profile**
   - Operation: SELECT
   - Rule: `auth.uid() = id`
   - Description: Users can view their own profile

2. **Select Other Profiles (Public Info)**
   - Operation: SELECT
   - Rule: `true` (all authenticated users)
   - Description: Users can view basic info of other users (for book owners, borrowers, etc.)

3. **Update Own Profile**
   - Operation: UPDATE
   - Rule: `auth.uid() = id`
   - Description: Users can only update their own profile

4. **Admin Full Access**
   - Operation: ALL
   - Rule: `is_admin = true AND auth.uid() = id`
   - Description: Admins have full access to user management

### Books Table

**Enable RLS:** ✅ Yes

**Policies:**

1. **Select All Books**
   - Operation: SELECT
   - Rule: `true` (all authenticated users)
   - Description: All users can view books (for browsing)

2. **Insert Own Books**
   - Operation: INSERT
   - Rule: `auth.uid() = owner_id`
   - Description: Users can only create books under their own ownership

3. **Update Own Books**
   - Operation: UPDATE
   - Rule: `auth.uid() = owner_id`
   - Description: Users can only update their own books

4. **Delete Own Books**
   - Operation: DELETE
   - Rule: `auth.uid() = owner_id`
   - Description: Users can only delete their own books

5. **Admin Full Access**
   - Operation: ALL
   - Rule: `EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)`
   - Description: Admins can manage all books

### Borrow Requests Table

**Enable RLS:** ✅ Yes

**Policies:**

1. **Select Own Requests**
   - Operation: SELECT
   - Rule: `auth.uid() = borrower_id OR auth.uid() = owner_id`
   - Description: Users can view requests they created or received

2. **Insert Own Requests**
   - Operation: INSERT
   - Rule: `auth.uid() = borrower_id`
   - Description: Users can only create requests as the borrower

3. **Update Own Requests**
   - Operation: UPDATE
   - Rule: `auth.uid() = owner_id OR auth.uid() = borrower_id`
   - Description: Owners can approve/deny, borrowers can update their requests

4. **Delete Own Requests**
   - Operation: DELETE
   - Rule: `auth.uid() = borrower_id AND status = 'pending'`
   - Description: Borrowers can delete their own pending requests

5. **Admin Full Access**
   - Operation: ALL
   - Rule: `EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)`
   - Description: Admins can manage all borrow requests

### Reviews Table

**Enable RLS:** ✅ Yes

**Policies:**

1. **Select All Reviews**
   - Operation: SELECT
   - Rule: `true` (all authenticated users)
   - Description: All users can view reviews

2. **Insert Own Reviews**
   - Operation: INSERT
   - Rule: `auth.uid() = user_id`
   - Description: Users can only create reviews under their own name

3. **Update Own Reviews**
   - Operation: UPDATE
   - Rule: `auth.uid() = user_id`
   - Description: Users can only update their own reviews

4. **Delete Own Reviews**
   - Operation: DELETE
   - Rule: `auth.uid() = user_id`
   - Description: Users can only delete their own reviews

5. **Admin Delete Reviews**
   - Operation: DELETE
   - Rule: `EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)`
   - Description: Admins can delete any review (content moderation)

### Notifications Table

**Enable RLS:** ✅ Yes

**Policies:**

1. **Select Own Notifications**
   - Operation: SELECT
   - Rule: `auth.uid() = user_id`
   - Description: Users can only view their own notifications

2. **Update Own Notifications**
   - Operation: UPDATE
   - Rule: `auth.uid() = user_id`
   - Description: Users can only mark their own notifications as read

3. **Delete Own Notifications**
   - Operation: DELETE
   - Rule: `auth.uid() = user_id`
   - Description: Users can delete their own notifications

4. **System Insert Notifications**
   - Operation: INSERT
   - Rule: Use `create_notification_secure()` RPC function to bypass RLS
   - Description: Notifications are created via secure RPC function

5. **Admin Send Notifications**
   - Operation: INSERT
   - Rule: `EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)`
   - Description: Admins can send system notifications

### Messages Table

**Enable RLS:** ✅ Yes

**Policies:**

1. **Select Messages in Own Requests**
   - Operation: SELECT
   - Rule: ```sql
   EXISTS (
     SELECT 1 FROM borrow_requests
     WHERE borrow_requests.id = borrow_request_id
     AND (borrow_requests.borrower_id = auth.uid() OR borrow_requests.owner_id = auth.uid())
   )
   ```
   - Description: Users can view messages in their own borrow requests

2. **Insert Messages in Own Requests**
   - Operation: INSERT
   - Rule: ```sql
   auth.uid() = sender_id AND EXISTS (
     SELECT 1 FROM borrow_requests
     WHERE borrow_requests.id = borrow_request_id
     AND (borrow_requests.borrower_id = auth.uid() OR borrow_requests.owner_id = auth.uid())
   )
   ```
   - Description: Users can send messages in their own requests

3. **Update Read Status**
   - Operation: UPDATE
   - Rule: ```sql
   EXISTS (
     SELECT 1 FROM borrow_requests
     WHERE borrow_requests.id = borrow_request_id
     AND (borrow_requests.borrower_id = auth.uid() OR borrow_requests.owner_id = auth.uid())
   )
   ```
   - Description: Users can mark messages as read in their own requests

## Security Considerations

### ✅ Implemented

1. **Authentication Required:** All policies require authentication via `auth.uid()`
2. **Ownership Validation:** Users can only modify their own data
3. **Admin Privileges:** Admins have elevated permissions for moderation
4. **Relationship Validation:** Access to related data (messages, requests) validated through JOINs

### ⚠️ Recommendations

1. **Rate Limiting:** Implement rate limiting on API endpoints to prevent abuse
2. **Input Validation:** Always validate input on the client and server side
3. **Audit Logging:** Log admin actions for accountability
4. **Regular Audits:** Review RLS policies quarterly
5. **Principle of Least Privilege:** Minimize permissions granted to each role

### 🔍 Testing RLS Policies

To test RLS policies:

1. **As Regular User:**
   ```sql
   -- Set user context
   SET LOCAL jwt.claims.sub = 'user-uuid-here';

   -- Try to access data
   SELECT * FROM books WHERE owner_id != 'user-uuid-here';
   -- Should return empty or error
   ```

2. **As Admin:**
   ```sql
   -- Verify admin can access all data
   SELECT * FROM books;
   -- Should return all books
   ```

3. **As Unauthenticated:**
   ```sql
   -- Clear auth context
   RESET jwt.claims.sub;

   -- Try to access data
   SELECT * FROM books;
   -- Should return error
   ```

## Migration Checklist

When deploying RLS policies:

- [ ] Enable RLS on all tables
- [ ] Apply policies in correct order (dependencies first)
- [ ] Test policies with different user roles
- [ ] Verify admin access works correctly
- [ ] Test edge cases (deleted users, suspended accounts)
- [ ] Document any custom RPC functions
- [ ] Set up monitoring for policy violations

## Notes

- All SQL injection protection is handled by Supabase's prepared statements
- Search queries using `.ilike()` are parameterized by Supabase
- Direct Supabase client usage should only be in `packages/api-client`
- Never expose the `service_role` key to the client

## Related Files

- `packages/api-client/migrations/` - SQL migration files
- `packages/api-client/src/supabaseClient.ts` - Supabase client configuration
- `docs/book_sharing_technical_plan.md` - Technical architecture
