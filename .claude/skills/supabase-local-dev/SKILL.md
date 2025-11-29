---
name: supabase-local-dev
description: |
  Local Supabase development workflow for the BookShare project. Use this skill when:
  (1) Setting up or starting local Supabase
  (2) Switching between local and hosted databases
  (3) Creating or applying database migrations
  (4) Deploying schema changes to production
  (5) Running integration tests against local Supabase
  (6) Questions about local vs hosted database workflow
---

# Supabase Local Development

## Quick Commands

```bash
supabase start              # Start local Supabase (Docker required)
supabase stop               # Stop (data preserved in Docker volumes)
supabase db reset           # Wipe & reapply all migrations (loses data)
```

## Local Credentials

| Setting | Value |
|---------|-------|
| API URL | `http://127.0.0.1:54321` |
| Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0` |
| Service Role Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU` |
| Studio UI | http://127.0.0.1:54323 |
| Mailpit (auth emails) | http://127.0.0.1:54324 |

## Switching Databases

**Use LOCAL:**
```bash
cp apps/web/.env.local.dev apps/web/.env.local
```

**Use HOSTED:** Restore hosted credentials to `apps/web/.env.local`

## Migration Workflow

**Schema changes via Studio UI:**
```bash
supabase db diff -f feature_name    # Generate migration
```

**Manual migrations:**
```bash
supabase migration new feature_name  # Create empty file
# Edit supabase/migrations/<timestamp>_feature_name.sql
supabase migration up                # Apply locally
```

**Deploy to production:**
```bash
supabase db push
```

## Integration Tests

```bash
cd packages/api-client
npx vitest run          # Run all tests
npx vitest              # Watch mode
```

Tests use two clients:
- `adminClient` (service_role) - bypasses RLS for setup/teardown
- `testClient` (anon) - respects RLS like real users

## Data Persistence

| Command | Data |
|---------|------|
| `supabase stop` | Preserved |
| `supabase start` | Restored |
| `supabase db reset` | Deleted |

## Typical Dev Cycle

```bash
# 1. Start
supabase start && pnpm dev

# 2. Make schema changes, then generate migration
supabase db diff -f my_feature

# 3. Test locally
supabase db reset

# 4. Deploy
supabase db push
git add . && git commit -m "feat: my feature"
```
