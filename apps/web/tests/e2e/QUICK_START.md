# Quick Start Guide - E2E Tests

Get up and running with Playwright E2E tests in 5 minutes.

## Step 1: Install Dependencies

```bash
# From the monorepo root
pnpm install

# Install Playwright browsers
cd apps/web
pnpm exec playwright install
```

## Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.test.example .env.test

# Edit .env.test with your test Supabase credentials
# You should use a separate Supabase project for testing
```

Your `.env.test` should look like:
```env
PLAYWRIGHT_BASE_URL=http://localhost:5173
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Start Development Server

In one terminal, start the dev server:
```bash
# From apps/web directory
pnpm dev
```

The app should be running at http://localhost:5173

## Step 4: Run Tests

In another terminal, run the tests:

```bash
# Run all tests in headless mode
pnpm test:e2e

# OR run with UI mode (recommended for first time)
pnpm test:e2e:ui

# OR run in headed mode to see the browser
pnpm test:e2e:headed
```

## Step 5: View Results

After tests complete:

```bash
# View HTML report
pnpm test:e2e:report
```

## Common Commands

```bash
# Development
pnpm test:e2e:ui              # Run with UI mode (best for development)
pnpm test:e2e:headed          # Run with visible browser
pnpm test:e2e:debug           # Run with debugger

# Specific browsers
pnpm test:e2e:chromium        # Chrome only
pnpm test:e2e:firefox         # Firefox only
pnpm test:e2e:webkit          # Safari only
pnpm test:e2e:mobile          # Mobile browsers

# Specific tests
pnpm test:e2e auth-signin     # Run sign in tests only
pnpm test:e2e -g "sign up"    # Run tests matching "sign up"

# View reports
pnpm test:e2e:report          # Show HTML report
```

## Troubleshooting

### Port Already in Use
If port 5173 is in use:
1. Stop the existing dev server
2. Or change the port in `playwright.config.ts` and `.env.test`

### Supabase Connection Issues
- Verify your Supabase URL and anon key are correct
- Check network connectivity
- Ensure Supabase project is active

### Tests Failing
1. Make sure dev server is running (http://localhost:5173)
2. Check `.env.test` has correct Supabase credentials
3. Try running a single test file first: `pnpm test:e2e auth-signin.spec.ts`
4. Use UI mode to debug: `pnpm test:e2e:ui`

### Browser Not Found
Run: `pnpm exec playwright install`

## Next Steps

- Read the full [E2E Tests README](./README.md)
- Explore test files in `tests/e2e/`
- Learn about [Page Object Model](./pages/)
- Check out [helper functions](./helpers/)

## Need Help?

- [Playwright Documentation](https://playwright.dev)
- [Playwright Discord](https://discord.com/invite/playwright-807756831384403968)
- Check `tests/e2e/README.md` for detailed documentation
