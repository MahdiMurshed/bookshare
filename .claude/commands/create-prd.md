# Create a Product Requirements Document (PRD)

You are helping the user create a detailed PRD for a new feature in the **BookShare** app - a book sharing platform built as a Turborepo monorepo.

## Context

Before asking questions, review:
- `/docs/book_sharing_app_prd.md` - Existing product requirements
- `/docs/book_sharing_user_stories.md` - User stories reference
- `/docs/book_sharing_technical_plan.md` - Technical architecture

## Step 1: Gather Requirements

Ask clarifying questions covering:

- **Problem/Goal:** What problem does this feature solve? What is the main goal?
- **Target User:** Who uses this? (book owners, borrowers, both?)
- **Core Functionality:** What key actions should a user be able to perform?
- **User Stories:** Provide user stories (e.g., As a book owner, I want to [action] so that [benefit])
- **Acceptance Criteria:** How will we know this feature is complete?
- **Scope/Boundaries:** What should this feature NOT do?
- **Data Requirements:** Which entities are involved? (Book, User, BorrowRequest, Review, Notification)
- **Design/UI:** Any specific UI requirements? Which pages/components affected?
- **Edge Cases:** What error conditions should we handle?

**Provide options in letter/number lists for easy selection.**

## Step 2: Generate PRD

Create a PRD with these sections:

1. **Introduction/Overview** - Feature description and problem statement
2. **Goals** - Specific, measurable objectives
3. **User Stories** - Detailed user narratives
4. **Functional Requirements** - Numbered list of functionalities
5. **Non-Goals (Out of Scope)** - What this feature will NOT include
6. **Design Considerations** - UI/UX requirements, affected components
7. **Technical Considerations** - Include:
   - Affected packages (`apps/web`, `packages/api-client`, `packages/ui`, `packages/shared`)
   - Database changes needed (migrations in `packages/api-client/migrations/`)
   - API functions to add/modify in `packages/api-client`
   - New types needed in `packages/api-client/src/types.ts`
   - Zod schemas needed in `packages/shared/src/schemas/`
8. **Success Metrics** - How success will be measured
9. **Open Questions** - Remaining questions

## Step 3: Save the PRD

Save to `/tasks/[n]-prd-[feature-name].md`
- `n` = zero-padded 4-digit sequence (0001, 0002, etc.)
- `feature-name` = kebab-case description

## Tech Stack Reference

- Frontend: React 19 + TypeScript, Vite, TailwindCSS 4
- UI: shadcn/ui via `@repo/ui`
- Data: TanStack Query, react-hook-form + Zod
- Backend: Supabase (via `@repo/api-client` abstraction)
- Core entities: User, Book, BorrowRequest, Review, Notification

## Rules

1. Do NOT implement - only create the PRD
2. MUST ask clarifying questions first
3. Reference existing docs for consistency

---

Start by asking the user to describe the feature they want to build.
