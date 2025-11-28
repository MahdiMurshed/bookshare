# Generate a Task List from a PRD

You are creating a task list for the **BookShare** monorepo based on an existing PRD.

## Project Structure Reference

```
apps/
  web/                    # Main React + Vite app
    src/
      pages/              # Route-level components (default exports)
      components/         # Reusable UI components
      hooks/              # Custom React hooks (useX naming)
      contexts/           # React Context providers
      lib/validations/    # Zod schemas
      lib/constants/      # Constants and enums
packages/
  api-client/             # Backend abstraction (Supabase)
    src/types.ts          # All shared TypeScript types
    migrations/           # SQL migrations
  shared/                 # Shared Zod schemas, constants
  ui/                     # shadcn/ui components
```

## Process

### Step 1: Identify the PRD

Check `/tasks/` for available PRDs or ask user which one to use.

### Step 2: Analyze the PRD

Read and understand:
- Functional requirements
- User stories
- Technical considerations
- Design considerations

### Step 3: Assess Current State

Review the codebase for:
- Existing patterns in `apps/web/src/hooks/` (TanStack Query usage, query keys)
- Component patterns in `apps/web/src/components/`
- API client patterns in `packages/api-client/src/`
- Existing types in `packages/api-client/src/types.ts`
- UI components available in `packages/ui/`

### Step 4: Generate Parent Tasks

Create ~5 high-level tasks. Common task categories:

1. **Database/API** - Migrations, api-client functions, types
2. **Shared** - Zod schemas, constants
3. **UI Components** - Reusable components in apps/web or packages/ui
4. **Page/Feature** - Main feature implementation
5. **Integration** - Connecting pieces, testing

Present tasks and say:
> "I have generated the high-level tasks. Ready to generate sub-tasks? Respond with 'Go' to proceed."

**Wait for "Go" before continuing.**

### Step 5: Generate Sub-Tasks

Break down each parent into actionable sub-tasks following BookShare conventions:
- API functions: `get`, `create`, `update`, `delete` prefixes
- Hooks: `use` prefix, export query keys
- Components: Named exports, `ComponentNameProps` interfaces
- Types: `Input` suffix for mutations, `Filters` for queries

### Step 6: Identify Relevant Files

List files to create/modify:

```markdown
## Relevant Files

- `packages/api-client/src/[resource].ts` - API functions
- `packages/api-client/src/types.ts` - Type definitions
- `packages/api-client/migrations/[timestamp]_[name].sql` - Database migration
- `apps/web/src/hooks/use[Resource].ts` - TanStack Query hooks
- `apps/web/src/components/[Feature]/[Component].tsx` - UI components
- `apps/web/src/pages/[Page].tsx` - Page component

### Notes

- Run `pnpm lint` to check for issues
- Run `pnpm build` to verify builds
- Use `pnpm dev` to test locally
```

### Step 7: Save Task List

Save to `/tasks/tasks-[prd-file-name].md`

## Output Format

```markdown
## Relevant Files

- `path/to/file.ts` - Description

### Notes

- Testing and build commands

## Tasks

- [ ] 1.0 Database & API Layer
  - [ ] 1.1 Create migration for [feature]
  - [ ] 1.2 Add types to types.ts
  - [ ] 1.3 Implement API functions in api-client
- [ ] 2.0 React Query Hooks
  - [ ] 2.1 Create use[Feature].ts with query keys
  - [ ] 2.2 Implement query and mutation hooks
- [ ] 3.0 UI Components
  - [ ] 3.1 Create [Component] component
- [ ] 4.0 Page Integration
  - [ ] 4.1 Add feature to [Page]
- [ ] 5.0 Testing & Polish
  - [ ] 5.1 Test feature end-to-end
```

---

Start by asking which PRD to generate tasks from, or list available PRDs in `/tasks/`.
