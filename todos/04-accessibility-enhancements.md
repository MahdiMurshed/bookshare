# Accessibility Enhancements

Add ARIA attributes and improve accessibility compliance.

**Current Status:** Only 5 files have aria-label/role attributes
**Target:** All interactive components should be accessible

---

## Task 1: Add aria-labels to Icon-Only Buttons

**Priority:** HIGH
**Affected Components:**

| Component | Location | Missing Attribute |
|-----------|----------|------------------|
| Header mobile menu | `Header.tsx` | `aria-label="Open menu"` |
| Theme toggle | `ThemeToggle.tsx` | Has aria-label (keep) |
| Close buttons | Various modals | `aria-label="Close"` |
| Delete buttons | Various | `aria-label="Delete"` |
| Edit buttons | Various | `aria-label="Edit"` |

**Example Fix:**
```tsx
// Before
<Button variant="ghost" size="icon" onClick={...}>
  <Menu className="h-5 w-5" />
</Button>

// After
<Button
  variant="ghost"
  size="icon"
  onClick={...}
  aria-label="Open navigation menu"
>
  <Menu className="h-5 w-5" />
</Button>
```

---

## Task 2: Add aria-live Regions for Dynamic Content

**Priority:** HIGH
**Affected Components:**

| Component | Dynamic Content | Required Attribute |
|-----------|-----------------|-------------------|
| Notifications.tsx | Notification list | `aria-live="polite"` |
| ChatConversation.tsx | Messages | `aria-live="polite"` |
| RequestList.tsx | Request updates | `aria-live="polite"` |
| Toast notifications | Alerts | `role="alert"` (usually built-in) |

**Example Fix:**
```tsx
// Notifications.tsx
<div
  className="notification-list"
  aria-live="polite"
  aria-atomic="false"
>
  {notifications.map(notification => (
    <NotificationItem key={notification.id} {...notification} />
  ))}
</div>
```

---

## Task 3: Add aria-busy for Loading States

**Priority:** MEDIUM
**Affected Components:**

| Component | Loading State | Fix |
|-----------|--------------|-----|
| All pages | `isLoading` | `aria-busy={isLoading}` on container |
| Buttons | `isPending` | `aria-busy={isPending}` |
| Forms | Submitting | `aria-busy={isSubmitting}` |

**Example Fix:**
```tsx
// Button during mutation
<Button
  disabled={mutation.isPending}
  aria-busy={mutation.isPending}
>
  {mutation.isPending ? 'Saving...' : 'Save'}
</Button>

// Page container during loading
<div aria-busy={isLoading}>
  {isLoading ? <Skeleton /> : <Content />}
</div>
```

---

## Task 4: Add role="status" for Loading Indicators

**Priority:** MEDIUM
**Affected Components:**

| Component | Loading Element | Fix |
|-----------|----------------|-----|
| Skeleton loaders | Loading placeholder | `role="status"` + `aria-label="Loading"` |
| Spinner components | Loading spinner | `role="status"` |

**Example Fix:**
```tsx
// Skeleton component
<div
  className="skeleton"
  role="status"
  aria-label="Loading content"
>
  <span className="sr-only">Loading...</span>
</div>
```

---

## Task 5: Add aria-describedby for Form Validation

**Priority:** MEDIUM
**Note:** shadcn/ui Form components handle this, but verify custom forms.

**Check these files:**
- `apps/web/src/components/auth/SignInForm.tsx`
- `apps/web/src/components/auth/SignUpForm.tsx`
- `apps/web/src/components/Forms/AddBookForm.tsx`

**Pattern to verify:**
```tsx
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} aria-describedby="email-error" />
      </FormControl>
      <FormMessage id="email-error" />
    </FormItem>
  )}
/>
```

---

## Task 6: Add role="alert" for Error Messages

**Priority:** MEDIUM
**Affected Components:**

| Component | Error Display | Fix |
|-----------|--------------|-----|
| Form error messages | Root error | `role="alert"` |
| Query error states | Error cards | `role="alert"` |

**Example Fix:**
```tsx
// Form root error
{form.formState.errors.root && (
  <div role="alert" className="text-red-500">
    {form.formState.errors.root.message}
  </div>
)}

// Query error state
{error && (
  <Card role="alert" className="border-destructive">
    <p>Failed to load books: {error.message}</p>
  </Card>
)}
```

---

## Task 7: Add Skip Link for Keyboard Navigation

**Priority:** LOW
**Affected File:** `apps/web/src/App.tsx` or `apps/web/src/components/Header.tsx`

**Add:**
```tsx
// At the very top of the page
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded"
>
  Skip to main content
</a>

// On main content area
<main id="main-content">
  {/* Page content */}
</main>
```

---

## Task 8: Ensure Proper Heading Hierarchy

**Priority:** LOW
**Check:** Each page should have proper h1 → h2 → h3 hierarchy

**Files to audit:**
- All files in `apps/web/src/pages/`

**Pattern:**
```tsx
// Good
<h1>Page Title</h1>
<section>
  <h2>Section Title</h2>
  <h3>Subsection</h3>
</section>

// Bad
<h1>Page Title</h1>
<h3>Skipped h2!</h3>
```

---

## Accessibility Checklist for Components

When creating/updating components, ensure:

- [ ] All interactive elements are keyboard accessible
- [ ] Icon-only buttons have `aria-label`
- [ ] Loading states have `aria-busy`
- [ ] Dynamic regions have `aria-live`
- [ ] Error messages have `role="alert"`
- [ ] Form errors linked via `aria-describedby`
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus states are visible
- [ ] No content is hidden from screen readers unintentionally

---

## Components Already Accessible

| Component | Accessibility Feature |
|-----------|----------------------|
| ThemeToggle.tsx | Has aria-label |
| RequestActionsMenu.tsx | Has role attribute |
| UserActionsMenu.tsx | Has role attribute |
| BookActionsMenu.tsx | Has role attribute |
| shadcn Form components | Built-in aria handling |

---

## Testing Accessibility

### Manual Testing
1. Tab through all interactive elements
2. Use screen reader (VoiceOver, NVDA)
3. Check focus visibility
4. Test keyboard-only navigation

### Automated Testing
```bash
# Add axe-core for automated checks
pnpm add -D @axe-core/react

# In development, wrap app with axe
import React from 'react';
import ReactDOM from 'react-dom';

if (import.meta.env.DEV) {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

---

## Summary

| Task | Priority | Effort |
|------|----------|--------|
| aria-labels on icon buttons | HIGH | 1 hour |
| aria-live for dynamic content | HIGH | 45 min |
| aria-busy for loading states | MEDIUM | 30 min |
| role="status" for loaders | MEDIUM | 30 min |
| Form validation accessibility | MEDIUM | 30 min |
| Error message roles | MEDIUM | 20 min |
| Skip link | LOW | 15 min |
| Heading hierarchy audit | LOW | 30 min |

**Total Estimated Effort:** 3-4 hours
