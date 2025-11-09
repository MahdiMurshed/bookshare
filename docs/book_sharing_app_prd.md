# Product Requirements Document (PRD)

## Product: Book Sharing App

**Version:** 1.0\
**Owner:** Mahdi Murshed\
**Date:** 11/08/2025

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

| # | Feature                       | Description                                                                       | Priority | Acceptance Criteria                                           |
| - | ----------------------------- | --------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| 1 | **User Authentication**       | Email/password and Google/GitHub OAuth                                            | High     | Users can sign up, log in, and stay logged in securely.       |
| 2 | **Book Inventory Management** | Add/edit/delete books (title, author, ISBN, etc.)                                 | High     | User sees their own books; only the owner can modify them.    |
| 3 | **Browse Community Books**    | Explore and filter books by title, genre, owner, or availability                  | High     | Users can search and view other users’ books.                 |
| 4 | **Borrow Requests**           | Borrower requests to borrow a book → owner gets notification → approves or denies | High     | Borrow status updates correctly and notifies both users.      |
| 5 | **Notifications**             | Real-time updates on borrow requests and reviews                                  | Medium   | Users are notified of borrow requests, approvals, or denials. |
| 6 | **Book Reviews**              | Borrowers can rate and review books                                               | Medium   | Reviews appear on book detail and owner’s dashboard.          |
| 7 | **Admin Panel**               | Manage users, books, and flagged reviews                                          | Low      | Admin can view and moderate data.                             |

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

- **Performance:** API response under 300ms for most requests.
- **Scalability:** Support 10k+ users initially.
- **Security:** JWT-based auth, role-based access (user/admin).
- **Availability:** 99% uptime target.
- **Compatibility:** Web-first (React + NestJS), mobile-friendly.

---

## 7. Tech Stack

- **Frontend:** React (TypeScript), TailwindCSS
- **Backend:** NestJS (TypeScript), PostgreSQL or Firebase
- **Auth:** JWT + OAuth (Google/GitHub)
- **Notifications:** WebSocket or Firebase Cloud Messaging (FCM)

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

