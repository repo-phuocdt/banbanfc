# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vietnamese amateur football team fund management app. Tracks member contributions, income/expense ledger, and dashboard metrics.

## Commands

```bash
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build (also serves as TypeScript check)
npm run lint         # ESLint (next/core-web-vitals)
npm run lint -- --fix  # Auto-fix lint issues
```

No test framework configured yet. Use `npm run build` to verify TypeScript correctness.

## Tech Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript (strict)
- **Styling**: Tailwind CSS v3 (no inline styles, no custom CSS files)
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Supabase email/password, `requireAdmin()` guard on mutations
- **Forms**: React Hook Form + Zod validation (Vietnamese error messages)
- **Charts**: Recharts (dynamically imported)

## Architecture

**Server Components + Server Actions pattern:**
- Pages (`app/**/page.tsx`) are Server Components that fetch data
- Interactive UI (`components/**`) uses `'use client'` directive
- Mutations go through Server Actions (`app/**/actions.ts`) with `requireAdmin()` + Zod validation + `ActionResult<T>` return type
- Middleware (`middleware.ts`) refreshes Supabase auth session on every request

**Data flow:** Client Component → Server Action → `requireAdmin()` → Zod parse → Supabase query → `revalidatePath()` → return `ActionResult`

## Key Conventions

- **Path alias**: `@/*` maps to project root
- **Supabase clients**: `@/lib/supabase/server` (Server Components/Actions), `@/lib/supabase/client` (Client Components)
- **Soft deletes**: Members use `status='deleted'` instead of hard delete
- **Auto-create transactions**: Recording a contribution auto-creates a matching transaction entry
- **Parallel fetches**: Use `Promise.all()` for independent Supabase queries
- **Component size**: Keep under 200 LOC per file
- **DB naming**: `snake_case` for tables/columns; `camelCase` for TypeScript
- **Routes are Vietnamese**: `/quan-ly-quy` (dashboard), `/thanh-vien` (members), `/dong-tien` (contributions), `/thu-chi` (transactions)

## Database Tables

- `members` — id, name, status (active/inactive/paused/deleted), joined_at, note
- `contributions` — id, member_id (FK), month ('YYYY-MM'), amount, paid_at
- `transactions` — id, date, type (income/expense), amount, category, description, member_id (FK), contribution_id (FK)

## Important Files

- `lib/types/database.ts` — Member, Contribution, Transaction interfaces
- `lib/types/action-result.ts` — ActionResult<T> type
- `lib/auth/require-admin.ts` — Auth guard for server actions
- `lib/validations/schemas.ts` — Zod schemas (memberSchema, contributionSchema, transactionSchema)
- `lib/utils/format.ts` — Currency (VND) and date formatters
- `lib/utils/constants.ts` — Status labels, categories, default amounts
- `lib/supabase/schema.sql` — Database schema DDL
