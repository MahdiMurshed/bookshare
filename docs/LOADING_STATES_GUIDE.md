# Loading States Best Practices

This document outlines best practices for implementing loading states in the BookShare application to ensure a great user experience.

## Why Loading States Matter

Loading states provide visual feedback to users, indicating that:
1. Their action is being processed
2. The app is responsive
3. They should wait before retrying

Without loading states, users may:
- Click buttons multiple times
- Think the app is broken
- Abandon the action prematurely

## Implementation Guidelines

### For Mutations (Create, Update, Delete)

**✅ Good Example:**

```typescript
export function MyComponent() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: createBook,
  });

  const handleSubmit = async (data) => {
    try {
      await mutateAsync(data);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Button disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Creating...
        </>
      ) : (
        'Create Book'
      )}
    </Button>
  );
}
```

**❌ Bad Example:**

```typescript
// Missing loading state entirely
<Button onClick={handleSubmit}>
  Create Book
</Button>
```

### For Queries (Fetching Data)

**✅ Good Example:**

```typescript
export function BookList() {
  const { data: books, isLoading, error } = useBooks(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load books" />;
  }

  return (
    <div>
      {books.map(book => <BookCard key={book.id} book={book} />)}
    </div>
  );
}
```

**❌ Bad Example:**

```typescript
// No loading or error states
const { data: books } = useBooks(userId);

return (
  <div>
    {books?.map(book => <BookCard key={book.id} book={book} />)}
  </div>
);
```

## Checklist for All Forms

When implementing forms with mutations:

- [ ] Button shows loading spinner when `isPending` is true
- [ ] Button text changes to indicate action (e.g., "Creating...", "Saving...")
- [ ] Button is disabled during loading (`disabled={isPending}`)
- [ ] Input fields are disabled during loading
- [ ] Error messages are displayed if mutation fails
- [ ] Success feedback is provided (toast, navigation, or modal close)

## Common Patterns

### 1. Form Submission

```typescript
const { mutateAsync, isPending, error } = useMutation({
  mutationFn: createResource,
});

async function handleSubmit(data: FormData) {
  try {
    await mutateAsync(data);
    toast.success('Resource created successfully');
    navigate('/success');
  } catch (err) {
    toast.error(getErrorMessage(err));
  }
}

return (
  <form onSubmit={handleSubmit}>
    <Input disabled={isPending} {...field} />
    <Button type="submit" disabled={isPending}>
      {isPending ? 'Saving...' : 'Save'}
    </Button>
  </form>
);
```

### 2. Delete Confirmation

```typescript
const { mutateAsync, isPending } = useDeleteBook();

async function handleDelete() {
  try {
    await mutateAsync(bookId);
    toast.success('Book deleted');
    onClose();
  } catch (err) {
    toast.error(getErrorMessage(err));
  }
}

return (
  <Dialog>
    <DialogContent>
      <DialogFooter>
        <Button variant="outline" disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          {isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
```

### 3. List with Skeleton Loaders

```typescript
const { data, isLoading } = useBooks(userId);

if (isLoading) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  );
}

return (
  <div className="grid grid-cols-3 gap-4">
    {data.map(book => <BookCard key={book.id} book={book} />)}
  </div>
);
```

## Loading State Components

### Spinner

```typescript
import { Loader2 } from 'lucide-react';

<Loader2 className="w-6 h-6 animate-spin" />
```

### Skeleton

```typescript
import { Skeleton } from '@repo/ui/components/skeleton';

<Skeleton className="h-12 w-full" />
```

### Loading Button

```typescript
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

## Testing Loading States

1. **Network Throttling:** Use browser dev tools to slow down network
2. **Manual Testing:** Click buttons and verify loading states appear
3. **Edge Cases:** Test rapid clicking, navigation during loading
4. **Accessibility:** Ensure loading states are announced to screen readers

## Common Mistakes to Avoid

1. **Forgetting to disable buttons:** Users can click multiple times
2. **No visual feedback:** Users don't know if action is processing
3. **Inconsistent loading text:** Use consistent patterns (e.g., always "-ing")
4. **Not handling errors:** Loading states should account for failures
5. **Blocking entire UI:** Use localized loading states when possible

## Examples in Codebase

Good examples of loading states:
- `apps/web/src/components/auth/SignInForm.tsx` - Proper form loading
- `apps/web/src/pages/Browse.tsx` - Skeleton loaders for book grid
- `apps/web/src/components/Admin/FlagBookDialog.tsx` - Button loading states

## Additional Resources

- TanStack Query Loading States: https://tanstack.com/query/latest/docs/react/guides/mutations
- React Hook Form Loading: https://react-hook-form.com/api/useform/formstate
- Accessibility Loading States: https://www.w3.org/WAI/ARIA/apg/patterns/alert/

## Summary

Always implement loading states for:
- ✅ Form submissions
- ✅ Delete actions
- ✅ Data fetching
- ✅ File uploads
- ✅ Navigation after mutations

This ensures users have a smooth, predictable experience throughout the app.
