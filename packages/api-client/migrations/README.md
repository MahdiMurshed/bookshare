# Database Migrations

This directory contains SQL migration files for the BookShare database.

## How to Apply Migrations

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **+ New Query**
4. Copy the contents of the migration file
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

## Migration Files

### `001_add_user_profile_trigger.sql`
**Purpose**: Fixes Row Level Security violation during user signup

**What it does**:
- Creates a database trigger that automatically creates a user profile in `public.users` when a new user signs up
- Updates RLS policies to allow the trigger to insert users
- Removes the need for manual profile creation in the `signUp` function

**When to run**: After initial schema setup if you experience signup errors

**Status**: ⚠️ **REQUIRED** - Run this migration to enable user signup

---

### `013_add_type_constraints.sql`
**Purpose**: Adds database-level type constraints for data integrity

**What it does**:
- Updates notification types to include admin notification types (announcement, alert, info)
- Adds CHECK constraint for review ratings to enforce 1-5 range at database level
- Updates the secure notification function to support new types

**When to run**: After deploying code that uses admin notifications or reviews

**Status**: ✅ **RECOMMENDED** - Improves data integrity and type safety

---

## Migration History

| Migration | Date Applied | Applied By | Notes |
|-----------|-------------|------------|-------|
| 001_add_user_profile_trigger.sql | _pending_ | - | Fixes RLS violation on signup |
| 013_add_type_constraints.sql | _pending_ | - | Adds type constraints for notifications and reviews |
