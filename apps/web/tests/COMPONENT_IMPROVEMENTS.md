# Optional Component Improvements for Enhanced Test Stability

The current E2E tests work reliably using accessible roles and labels (Playwright best practice). However, adding `data-testid` attributes provides additional selector stability and makes test intent clearer.

## Benefits of Adding data-testid

1. **Explicit Test Intent**: Clear which elements are used in tests
2. **Refactoring Safety**: Tests survive CSS class changes
3. **Faster Selectors**: Direct element targeting is faster than complex queries
4. **Better Debugging**: Easier to identify elements during test failures

## Recommended Additions

### 1. SignInForm Component

**File**: `/home/user/bookshare/apps/web/src/components/auth/SignInForm.tsx`

```typescript
// Add to email input (line ~82)
<Input
  type="email"
  placeholder="you@example.com"
  disabled={isLoading}
  className="h-10 border-2 focus-visible:border-primary"
  data-testid="signin-email-input"  // ADD THIS
  {...field}
/>

// Add to password input (line ~103)
<Input
  type="password"
  placeholder="••••••••"
  disabled={isLoading}
  className="h-10 border-2 focus-visible:border-primary"
  data-testid="signin-password-input"  // ADD THIS
  {...field}
/>

// Add to submit button (line ~117)
<Button
  type="submit"
  disabled={isLoading}
  className="w-full h-10 mt-2 font-medium"
  data-testid="signin-submit-button"  // ADD THIS
>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
      Signing in...
    </>
  ) : (
    "Sign in"
  )}
</Button>

// Add to error alert (line ~68)
{error && (
  <div
    className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-3 flex items-start gap-2"
    data-testid="signin-error-alert"  // ADD THIS
  >
    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
    <p className="text-sm text-destructive">{error}</p>
  </div>
)}
```

### 2. SignUpForm Component

**File**: `/home/user/bookshare/apps/web/src/components/auth/SignUpForm.tsx`

```typescript
// Add to name input (line ~105)
<Input
  type="text"
  placeholder="John Doe"
  disabled={isLoading}
  className="h-11 border-2 focus-visible:border-primary"
  data-testid="signup-name-input"  // ADD THIS
  {...field}
/>

// Add to email input (line ~128)
<Input
  type="email"
  placeholder="you@example.com"
  disabled={isLoading}
  className="h-11 border-2 focus-visible:border-primary"
  data-testid="signup-email-input"  // ADD THIS
  {...field}
/>

// Add to password input (line ~151)
<Input
  type="password"
  placeholder="Create a strong password"
  disabled={isLoading}
  className="h-11 border-2 focus-visible:border-primary"
  data-testid="signup-password-input"  // ADD THIS
  {...field}
/>

// Add to confirm password input (line ~179)
<Input
  type="password"
  placeholder="Re-enter your password"
  disabled={isLoading}
  className="h-11 border-2 focus-visible:border-primary"
  data-testid="signup-confirm-password-input"  // ADD THIS
  {...field}
/>

// Add to submit button (line ~193)
<Button
  type="submit"
  disabled={isLoading}
  className="w-full h-11 mt-6 font-semibold"
  data-testid="signup-submit-button"  // ADD THIS
>
  {isLoading ? (
    <span className="flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      Creating your account...
    </span>
  ) : (
    <span>Create Account</span>
  )}
</Button>

// Add to error alert (line ~84)
{error && (
  <div
    className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4"
    data-testid="signup-error-alert"  // ADD THIS
  >
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
      <p className="text-sm font-medium text-destructive">
        {error}
      </p>
    </div>
  </div>
)}

// Add to password hint (line ~161)
{!form.formState.errors.password && (
  <p
    className="text-xs text-muted-foreground mt-1.5"
    data-testid="signup-password-hint"  // ADD THIS
  >
    Minimum 8 characters with uppercase, lowercase, and number
  </p>
)}
```

### 3. Header Component

**File**: `/home/user/bookshare/apps/web/src/components/Header.tsx`

```typescript
// Add to user avatar button (line ~186)
<button
  className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
  data-testid="user-avatar-button"  // ADD THIS
>
  <Avatar className="w-8 h-8 border-2 border-border transition-colors hover:border-primary">
    <AvatarImage src="" alt={user.email} />
    <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
      {getUserInitials()}
    </AvatarFallback>
  </Avatar>
</button>

// Add to sign in button (line ~220)
<Link to="/signin">
  <Button
    variant="ghost"
    size="sm"
    data-testid="header-signin-button"  // ADD THIS
  >
    Sign In
  </Button>
</Link>

// Add to sign up button (line ~224)
<Link to="/signup">
  <Button
    size="sm"
    data-testid="header-signup-button"  // ADD THIS
  >
    Sign Up
  </Button>
</Link>

// Add to sign out menu item (line ~208)
<DropdownMenuItem
  className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
  onClick={handleSignOut}
  data-testid="signout-menu-item"  // ADD THIS
>
  <LogOut className="mr-2 h-4 w-4" />
  <span>Sign Out</span>
</DropdownMenuItem>

// Add to profile menu item (line ~203)
<DropdownMenuItem
  className="cursor-pointer"
  onClick={() => navigate('/profile')}
  data-testid="profile-menu-item"  // ADD THIS
>
  <User className="mr-2 h-4 w-4" />
  <span>Profile</span>
</DropdownMenuItem>

// Add to navigation links (line ~134-152)
<Link
  key={item.href}
  to={item.href}
  data-testid={`nav-link-${item.href.replace('/', '')}`}  // ADD THIS
  className={cn(
    'relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
    isActive
      ? 'text-primary font-semibold'
      : 'text-muted-foreground hover:text-primary'
  )}
>
  <Icon className="w-4 h-4" />
  <span>{item.label}</span>
  {/* ... */}
</Link>

// Add to notification bell (line ~161)
<Link to="/notifications" className="relative">
  <Button
    variant="ghost"
    size="sm"
    className="relative"
    data-testid="notification-bell-button"  // ADD THIS
  >
    <Bell className="w-5 h-5" />
    {unreadNotificationCount > 0 && (
      <span
        className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-primary-foreground bg-primary rounded-full"
        data-testid="notification-badge"  // ADD THIS
      >
        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
      </span>
    )}
  </Button>
</Link>
```

### 4. Page Components

Add test IDs to main page headings for easier navigation verification:

**MyLibrary.tsx** (line with heading):
```typescript
<h1
  className="text-3xl font-bold tracking-tight"
  data-testid="my-library-heading"
>
  My Library
</h1>
```

**Requests.tsx** (line with heading):
```typescript
<h1
  className="text-3xl font-bold tracking-tight"
  data-testid="requests-heading"
>
  Requests
</h1>
```

**Profile.tsx** (line with heading):
```typescript
<h1
  className="text-3xl font-bold tracking-tight"
  data-testid="profile-heading"
>
  Profile
</h1>
```

**Notifications.tsx** (line with heading):
```typescript
<h1
  className="text-3xl font-bold tracking-tight"
  data-testid="notifications-heading"
>
  Notifications
</h1>
```

**Browse.tsx** (line with heading):
```typescript
<h1
  className="text-3xl font-bold tracking-tight"
  data-testid="browse-heading"
>
  Browse Books
</h1>
```

**Home.tsx** (line with heading):
```typescript
<h1
  className="text-4xl font-bold tracking-tight"
  data-testid="home-heading"
>
  Welcome to BookShare
</h1>
```

## How to Update Tests (Optional)

If you add the `data-testid` attributes above, you can update the Page Object Models to use them:

### SignInPage.ts
```typescript
// Change from accessible label to data-testid
this.emailInput = page.getByTestId('signin-email-input');
this.passwordInput = page.getByTestId('signin-password-input');
this.signInButton = page.getByTestId('signin-submit-button');
this.errorAlert = page.getByTestId('signin-error-alert');
```

### SignUpPage.ts
```typescript
// Change from accessible label to data-testid
this.nameInput = page.getByTestId('signup-name-input');
this.emailInput = page.getByTestId('signup-email-input');
this.passwordInput = page.getByTestId('signup-password-input');
this.confirmPasswordInput = page.getByTestId('signup-confirm-password-input');
this.createAccountButton = page.getByTestId('signup-submit-button');
this.errorAlert = page.getByTestId('signup-error-alert');
this.passwordHint = page.getByTestId('signup-password-hint');
```

### BasePage.ts
```typescript
// Change navigation links
this.homeLink = page.getByTestId('nav-link-');
this.browseLink = page.getByTestId('nav-link-browse');
this.myLibraryLink = page.getByTestId('nav-link-my-library');
this.requestsLink = page.getByTestId('nav-link-requests');
this.chatsLink = page.getByTestId('nav-link-chats');

// Change auth buttons
this.signInButton = page.getByTestId('header-signin-button');
this.signUpButton = page.getByTestId('header-signup-button');
this.userAvatar = page.getByTestId('user-avatar-button');
this.notificationBell = page.getByTestId('notification-bell-button');
```

## Priority

These changes are **optional**. The current tests work reliably with accessible roles and labels. Consider adding `data-testid` attributes if:

1. You experience selector brittleness during refactoring
2. You want faster test execution (direct element selection)
3. You want clearer test intent in component code
4. Your team prefers explicit test hooks

## Migration Strategy

If you decide to add test IDs:

1. **Phase 1**: Add `data-testid` to form inputs and buttons
2. **Phase 2**: Add `data-testid` to navigation elements
3. **Phase 3**: Add `data-testid` to page headings
4. **Phase 4**: Update Page Object Models to use test IDs
5. **Phase 5**: Verify all tests still pass

## Naming Convention

Follow this pattern for consistency:
- Form inputs: `{form}-{field}-input` (e.g., `signin-email-input`)
- Buttons: `{form}-{action}-button` (e.g., `signup-submit-button`)
- Alerts: `{component}-{type}-alert` (e.g., `signin-error-alert`)
- Navigation: `nav-link-{route}` (e.g., `nav-link-browse`)
- Headers: `{page}-heading` (e.g., `my-library-heading`)

## Testing the Changes

After adding test IDs, run the test suite to ensure everything still works:

```bash
# Run all tests
pnpm test:e2e

# Run in UI mode to debug any failures
pnpm test:e2e:ui
```

## Conclusion

The current test suite is production-ready and doesn't require these changes. These suggestions are purely for enhanced maintainability and selector stability as the application evolves.
