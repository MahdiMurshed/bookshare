# Process Task List

You are implementing tasks for the **BookShare** monorepo one sub-task at a time.

## Core Rules

1. **One sub-task at a time** - Do NOT proceed until user says "yes", "y", or "go"
2. **Stop and wait** after each sub-task for approval
3. **Mark tasks complete** immediately when done
4. **Follow BookShare conventions** from CLAUDE.md

## Key Conventions to Follow

### API Client (`packages/api-client/`)
- All backend calls through api-client, never import Supabase directly
- Functions: `getBooks()`, `createBook()`, `updateBook()`, `deleteBook()`
- Types in `src/types.ts`: `Book`, `CreateBookInput`, `BookFilters`

### Hooks (`apps/web/src/hooks/`)
- Use TanStack Query for all data fetching
- Export query key factories:
  ```typescript
  export const bookKeys = {
    all: ['books'] as const,
    list: (userId: string) => [...bookKeys.all, 'list', userId] as const,
    detail: (id: string) => [...bookKeys.all, 'detail', id] as const,
  };
  ```
- Prefer `mutateAsync` with try/catch
- Invalidate queries in `onSuccess`

### Components
- Small, focused (~150 lines max)
- Named exports: `export function MyComponent() {}`
- Props interface: `interface MyComponentProps {}`
- Use `import type` for type-only imports

### Forms
- react-hook-form + Zod + shadcn Form components
- Schemas in `apps/web/src/lib/validations/`

## Process

### Step 1: Find Task List

Check `/tasks/` for task files (starting with `tasks-`) or ask user.

### Step 2: Check Progress

Identify:
- Completed tasks `[x]`
- Next sub-task to work on `[ ]`

### Step 3: Implement Sub-Task

1. Implement following BookShare conventions
2. Mark sub-task complete: `[ ]` → `[x]`
3. Update task list file
4. **Stop and ask**: "Sub-task completed. Ready for the next one?"

### Step 4: Parent Task Completion

When all sub-tasks of a parent are done:

1. **Lint**: `pnpm lint`
2. **Build**: `pnpm build`
3. **Stage**: `git add .`
4. **Clean up**: Remove temporary files/code
5. **Commit**:
   ```bash
   git commit -m "feat: [parent task summary]" -m "- [key change 1]" -m "- [key change 2]"
   ```
6. Mark parent task `[x]`

## Task List Maintenance

- Mark tasks `[x]` immediately when done
- Add new tasks if discovered during implementation
- Update "Relevant Files" with files created/modified

## Commands Reference

```bash
pnpm dev              # Start dev server
pnpm build            # Build all packages
pnpm lint             # Lint all workspaces
pnpm ui <component>   # Add shadcn/ui component
```

## Completion Flow

```
Implement sub-task → Mark [x] → Update file → STOP → Wait for user
All sub-tasks done → Lint → Build → Git add → Commit → Mark parent [x]
```

---

Start by asking which task list to process, or list available task lists in `/tasks/`.
