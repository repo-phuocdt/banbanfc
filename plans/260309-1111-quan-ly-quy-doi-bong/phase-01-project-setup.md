# Phase 1: Project Setup

## Overview
- **Priority:** P1 (blocking all other phases)
- **Status:** done
- **Effort:** 2h
- Initialize Next.js 14 project with TypeScript, Tailwind, Supabase client, and folder structure.

## Requirements

### Functional
- Next.js 14 App Router project scaffolded
- Supabase JS client configured (browser + server)
- Auth middleware for protected routes
- Environment variables template

### Non-functional
- TypeScript strict mode
- Tailwind with custom color tokens
- ESLint configured

## Related Code Files

### Create
- `/package.json` — dependencies
- `/tsconfig.json`
- `/tailwind.config.ts` — custom colors (#4472C4, #006100, #E2EFDA, #9C0006, #FCE4EC)
- `/app/layout.tsx` — root layout with Vietnamese font, metadata
- `/app/globals.css` — Tailwind directives + custom utilities
- `/lib/supabase/client.ts` — `createBrowserClient()` using `@supabase/ssr`
- `/lib/supabase/server.ts` — `createServerClient()` for Server Components
- `/middleware.ts` — Supabase auth session refresh
- `/lib/types/database.ts` — TypeScript interfaces (Member, Contribution, Transaction)
- `/lib/utils/format.ts` — `formatCurrency()`, `formatDate()`
- `/lib/utils/constants.ts` — categories, default amount, color tokens
- `/.env.local.example` — template for NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

## Implementation Steps

1. Run `npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"`
2. Install deps: `npm i @supabase/supabase-js @supabase/ssr react-hook-form recharts date-fns zod`
3. Configure `tailwind.config.ts` with custom colors:
   ```
   primary: '#4472C4'
   income: { text: '#006100', bg: '#E2EFDA' }
   expense: { text: '#9C0006', bg: '#FCE4EC' }
   ```
4. Create `/lib/types/database.ts` with interfaces:
   - `Member { id, name, status: 'active'|'inactive'|'paused', joined_at, note }`
   - `Contribution { id, member_id, month, amount, paid_at, note }`
   - `Transaction { id, date, type: 'income'|'expense', amount, category, description, member_id, note }`
5. Create `/lib/utils/format.ts`:
   - `formatCurrency(n)` → "200.000" (dot separator, no decimals)
   - `formatDate(d)` → "09/03/2026" (DD/MM/YYYY via date-fns vi locale)
6. Create `/lib/utils/constants.ts`:
   - `INCOME_CATEGORIES`, `EXPENSE_CATEGORIES` arrays
   - `DEFAULT_CONTRIBUTION = 200000`
   - Color constants
7. Create Supabase client files using `@supabase/ssr` pattern
8. Create middleware for auth session refresh
9. Create `.env.local.example`
10. **[Security]** Disable self-signup in Supabase Auth settings: Authentication → Settings → User Signups → disable. This ensures only the pre-created admin account can log in; no public registration.
11. Verify: `npm run build` passes

## Todo List

- [x] Scaffold Next.js project
- [x] Install all dependencies
- [x] Configure Tailwind custom colors
- [x] Create TypeScript interfaces
- [x] Create utility functions (format)
- [x] Create constants file
- [x] Set up Supabase client (browser + server)
- [x] Set up auth middleware
- [x] Create env template
- [x] Disable self-signup in Supabase Auth settings
- [x] Verify build passes

## Success Criteria

- `npm run build` succeeds with zero errors
- All type definitions compile
- `formatCurrency(200000)` returns `"200.000"`
- `formatDate(new Date('2026-03-09'))` returns `"09/03/2026"`
- Supabase clients instantiate without errors (with valid env vars)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| `@supabase/ssr` API changes | Medium | Pin version, check latest docs |
| Next.js 14 vs 15 confusion | Low | Explicitly use `create-next-app@14` |
