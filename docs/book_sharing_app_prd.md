# Product Requirements Document (PRD)

## Product: Book Sharing App

**Version:** 1.0 (MVP Complete)\
**Owner:** Mahdi Murshed\
**Date:** 11/08/2025\
**Status:** ✅ Core features implemented and functional

---

## 1. Overview

A platform that allows users to create and manage their personal book collections. Users can mark books as *borrowable* and allow others in the community to request to borrow them. The app fosters community-based sharing and discovery of books.

---

## 2. Objectives / Goals

- Enable users to **catalog their personal libraries** online.
- Allow users to **lend and borrow books safely**.
- Facilitate **trust and engagement** through ratings, reviews, and notifications.
- (Optional) Provide **admin tools** for moderation and analytics.

---

## 3. Target Audience

- Avid readers with personal book collections.
- Community libraries and reading clubs.
- Users who want to discover or borrow books nearby.

---

## 4. Core Features & Requirements

| # | Feature                       | Description                                                                       | Priority | Status | Acceptance Criteria                                           |
| - | ----------------------------- | --------------------------------------------------------------------------------- | -------- | ------ | ------------------------------------------------------------- |
| 1 | **User Authentication**       | Email/password sign up and login                                            | High     | ✅ Implemented | Users can sign up, log in, and stay logged in securely.       |
| 2 | **Book Inventory Management** | Add/edit/delete books (title, author, genre, cover, condition)                                 | High     | ✅ Implemented | User sees their own books; only the owner can modify them.    |
| 3 | **Browse Community Books**    | Explore and filter books by title, author, genre, or availability                  | High     | ✅ Implemented | Users can search and view other users' books.                 |
| 4 | **Borrow Requests**           | Borrower requests to borrow → owner approves/denies → handover tracking → return | High     | ✅ Implemented | Borrow status updates correctly and notifies both users.      |
| 5 | **Real-time Chat**             | In-app messaging between borrower and owner for each request                                  | High   | ✅ Implemented | Users can chat about book exchange details. |
| 6 | **Notifications**             | Real-time updates on borrow requests, approvals, and messages                                  | Medium   | ✅ Implemented | Users are notified of borrow requests, approvals, denials, and messages. |
| 7 | **User Profile**              | View and edit profile (avatar, name, bio), view statistics                                               | Medium   | ✅ Implemented | Users can manage their profile and see activity stats.          |
| 8 | **Book Reviews**              | Borrowers can rate and review books after return                                               | Medium   | ✅ Implemented | Reviews appear on book detail page.          |
| 9 | **Admin Panel**               | Manage users, books, requests, and view analytics                                          | Low      | ✅ Implemented | Admin can view and moderate data, see platform stats.                             |

---

## 5. User Flow / Journey

1. User signs up or logs in.
2. Adds books to their inventory.
3. Marks certain books as borrowable.
4. Other users browse and request to borrow.
5. Owner approves or denies the request.
6. Borrower returns and reviews the book.
7. Notifications keep both parties updated throughout.

---

## 6. Non-Functional Requirements

- **Performance:** API response under 300ms for most requests (Supabase optimized).
- **Scalability:** Support 10k+ users initially (Supabase managed infrastructure).
- **Security:** Supabase Auth with Row Level Security (RLS), role-based access (user/admin).
- **Availability:** 99% uptime target (Supabase SLA).
- **Compatibility:** Web-first responsive design, mobile app planned (React Native/Expo).

---

## 7. Tech Stack

- **Frontend:** React (TypeScript), Vite, TailwindCSS 4, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Auth:** Supabase Auth (Email/Password, OAuth planned)
- **State Management:** TanStack Query (React Query)
- **Build System:** Turborepo monorepo
- **Future:** NestJS backend migration planned (backend abstraction layer in place)

---

## 8. Metrics for Success

- 1,000+ books added in first 3 months.
- 60% of users engage in at least one borrow/lend transaction.
- Average response time under 500ms.
- User satisfaction rating ≥ 4.5/5.

---

## 9. Risks & Mitigation

| Risk                       | Impact | Mitigation                                |
| -------------------------- | ------ | ----------------------------------------- |
| Low engagement             | Medium | Gamify borrowing (badges, activity feed). |
| Trust issues between users | High   | Add review system and borrow history.     |
| Scalability problems       | Medium | Use microservices and caching (Redis).    |

---

## 10. Future Enhancements

- Map-based interface for nearby books.
- Recommendation engine (based on genre or reading habits).
- Analytics for book popularity and borrowing trends.

