# Book Sharing App - User Stories

## Title
As a registered user, I want to manage my personal book inventory and share books with others, so that I can lend books I own and borrow books from the community.

## Role
Registered User (with optional Admin role for management)

## Goal / Motivation
- Users want to **keep track of the books they own**.
- Users want to **share books with a local or online community**.
- Users want to **borrow books from others safely and efficiently**.
- Users want **notifications and updates** about their book requests and interactions.

## User Journey / Steps

1. **Sign Up / Login**
   - User creates an account via email/password or OAuth (Google/GitHub).
   - After login, user is redirected to the **Dashboard**.

2. **View My Inventory**
   - User sees all books they have added.
   - Each book shows title, author, genre, status (available/requested/borrowed), and reviews.

3. **Add a Book**
   - User clicks **“Add Book”**.
   - Fills in the form: title, author, ISBN, genre, description, cover image.
   - Submits → book appears in **their inventory**.
   - Backend assigns **ownerId = userId**.

4. **Edit / Delete a Book**
   - User clicks **Edit/Delete** on their own books.
   - Changes update backend (PUT/DELETE `/books/:id`).
   - Only the owner can modify their books.

5. **Browse Community Books**
   - User searches or filters books by title, author, genre, or availability.
   - Clicking a book shows detailed info, including owner and reviews.

6. **Request to Borrow**
   - User clicks **“Request to Borrow”** on a book they don’t own.
   - Borrow request is created (status = pending).
   - Owner receives a **notification**.

7. **Approve / Deny Borrow Request (Owner)**
   - Owner can view pending requests for their books.
   - Owner approves or denies → updates status (approved/denied).
   - Borrower receives **notification** of decision.

8. **Chat About Book Exchange**
   - Borrower and owner can message each other about pickup/return details.
   - Real-time chat updates via Supabase Realtime.
   - Unread message indicators keep users informed.

9. **Track Handover and Return**
   - Owner can mark book as handed over and add tracking details.
   - Borrower can initiate return process.
   - Both parties track the book's status through the request lifecycle.

10. **Leave a Review**
   - After borrowing, user can rate and review the book.
   - Reviews are visible on the book details page and user dashboard.

11. **Manage Profile**
   - User can update their profile (name, bio, avatar).
   - View personal statistics (books owned, shared, borrowed, total exchanges).
   - Manage account settings.

12. **Notifications**
   - User receives **real-time notifications** for:
     - Incoming borrow requests
     - Approvals/denials of requests
     - New messages in chats
     - Reviews on their books

13. **Admin Actions** (Admin Role)
    - View platform statistics and analytics.
    - Manage all users, books, and borrow requests.
    - Moderate content and handle reported issues.

## Acceptance Criteria
- Users can **sign up/login** securely using Supabase Auth.
- Users can **add/edit/delete** only their own books (enforced by RLS policies).
- Users can **browse all available books** with search and filters.
- Users can **request to borrow books**, and owners can approve/deny requests.
- Users can **chat in real-time** about book exchanges.
- Notifications are sent for requests, approvals/denials, and messages.
- Users can **track handover and return** processes.
- Users can **review books** after borrowing.
- Users can **manage their profile** and view activity statistics.
- All actions are type-safe and validated using TypeScript + Zod schemas + React Hook Form.

## Optional Enhancements
- Search by **location** for physical sharing.
- **Map-based interface** to locate nearby users.
- **Private/public inventory** option for each book.
- **Analytics Dashboard** for top books, most active users, borrowing stats.