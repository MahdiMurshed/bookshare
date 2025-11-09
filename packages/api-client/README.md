# @repo/api-client

Backend abstraction layer for BookShare. This package provides a clean, backend-agnostic API for all data operations.

## Purpose

This package acts as an abstraction layer between the frontend applications and the backend. Currently implemented with Supabase, but designed to enable seamless migration to a custom NestJS backend in the future.

## Architecture

```
Frontend Apps (web, mobile)
         ↓
   @repo/api-client (this package)
         ↓
   Supabase (current) → NestJS (future)
```

## Usage

```typescript
import { getBooks, createBook, signIn, signUp } from '@repo/api-client';

// All backend operations go through this package
const books = await getBooks();
const newBook = await createBook({ title: '1984', author: 'George Orwell' });
```

## Modules

- `auth.ts` - Authentication (sign up, sign in, sign out, session management)
- `books.ts` - Book CRUD operations
- `borrowRequests.ts` - Borrow request management
- `reviews.ts` - Book review operations
- `notifications.ts` - Real-time notifications
- `types.ts` - TypeScript data models

## Migration Strategy

When migrating from Supabase to NestJS:
1. Replace implementation inside each module's functions
2. Keep function signatures identical
3. Frontend apps require zero changes

Example:
```typescript
// Current implementation
export async function getBooks() {
  const { data, error } = await supabase.from('books').select('*');
  if (error) throw error;
  return data;
}

// Future implementation
export async function getBooks() {
  const response = await fetch(`${API_URL}/books`);
  return response.json();
}
```
