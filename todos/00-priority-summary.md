# Task Priority Summary

Based on comprehensive analysis of `/findings/` documents, tasks are organized by **highest gain to lowest**.

## Priority Matrix

| Priority | Category | Files Affected | Estimated Effort | Impact |
|----------|----------|----------------|------------------|--------|
| **CRITICAL** | Component Refactoring | 10 files (1574-298 lines) | 6-8 hours | Architecture/Maintainability |
| **HIGH** | Type Safety Fixes | 12 `any` occurrences | 2-3 hours | Type Safety/Bug Prevention |
| **HIGH** | Error Handling Consistency | 20+ locations | 1-2 hours | Production Readiness |
| **MEDIUM** | DRY Violations | 6 patterns | 3-4 hours | Code Quality/Maintainability |
| **MEDIUM** | Accessibility | 50+ components | 3-4 hours | UX/Compliance |
| **LOW** | Testing Infrastructure | New setup | 6-8 hours | Quality Assurance |
| **LOW** | Quick Wins | 10+ small fixes | 1-2 hours | Polish |

---

## Task Files

| File | Focus Area | Task Count |
|------|------------|------------|
| `01-critical-component-refactoring.md` | Split oversized components/files | 10 tasks |
| `02-type-safety-fixes.md` | Fix `any` types, add proper types | 12 tasks |
| `03-code-quality-improvements.md` | DRY, error logging, native dialogs | 15 tasks |
| `04-accessibility-enhancements.md` | ARIA attributes, semantic HTML | 8 tasks |
| `05-testing-infrastructure.md` | Playwright, Vitest setup | 12 tasks |
| `06-quick-wins.md` | Small, immediate improvements | 10 tasks |

---

## Recommended Execution Order

### Week 1: Critical Fixes
1. Split `packages/api-client/src/admin.ts` (1574 lines)
2. Fix all `any` types in api-client
3. Replace `alert()/confirm()` with UI components
4. Standardize error logging to `logError()`

### Week 2: High Priority
1. Split AdminAnalyticsTab (705 lines) into 8 components
2. Extract Header into Desktop/Mobile/UserMenu
3. Create `useDebouncedValue` hook (eliminate duplication)
4. Create `useBookFilters` hook

### Week 3: Medium Priority
1. Extract filter utilities to `lib/utils/filters.ts`
2. Add basic accessibility attributes
3. Remove dead/commented code
4. Create FilterButton component

### Week 4: Polish
1. Set up Playwright E2E testing
2. Add data-testid attributes
3. Rename `auth/` to `Auth/`, `modals/` to `Modals/`
4. Add barrel exports to hooks/constants

---

## Overall Quality Scores (from audit)

| Category | Score | Notes |
|----------|-------|-------|
| Component Architecture | 6/10 | 21 files >300 lines |
| Business Logic Separation | 8/10 | Good hook patterns |
| Custom Hooks Quality | 8/10 | Well-structured |
| Type Safety | 7/10 | 12 `any` types to fix |
| Error Handling | 8/10 | Good utilities, remove alert() |
| React Patterns | 8/10 | No major anti-patterns |
| Naming Conventions | 9/10 | Minor boolean naming |
| DRY Violations | 6/10 | Filter logic duplication |
| Documentation | 8/10 | Remove dead code |
| File Organization | 8/10 | Well-structured |

**Overall Score: 7.5/10** - Production-ready with above improvements.

---

## ROI Analysis

### Highest ROI Tasks (Do First)
1. **Split admin.ts** - Improves maintainability, code review, and future development
2. **Fix `any` types** - Prevents runtime bugs, improves IDE support
3. **Replace alert()** - Direct user experience improvement
4. **Standardize error logging** - Consistency, better debugging

### Medium ROI Tasks
1. **Component splitting** - Improves code organization and testability
2. **DRY fixes** - Reduces maintenance burden
3. **Accessibility** - Compliance and UX improvement

### Lower ROI (But Important)
1. **Testing setup** - Long-term quality investment
2. **Naming fixes** - Code clarity
3. **Barrel exports** - Developer convenience
