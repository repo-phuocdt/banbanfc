# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vietnamese amateur football team fund management app (Ban Ban FC). Tracks member contributions, income/expense ledger, QR bank transfers, and dashboard metrics. All pages are publicly viewable; only mutations require admin login.

## Commands

```bash
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build (also serves as TypeScript check)
npm run lint         # ESLint (next/core-web-vitals)
npm run lint -- --fix  # Auto-fix lint issues
npm test             # node:test unit tests (lib/**/*.test.ts) via npx tsx
```

Only pure logic has unit tests (`lib/bank/*.test.ts`); use `npm run build` to verify TypeScript correctness. `scripts/simulate-sepay-webhook.ts` posts SePay-shaped webhooks to a running app for manual testing. `scripts/seed-bank-demo.ts --confirm-ref <staging-ref>` seeds tagged demo bank transactions for the admin-only dashboard bank statistics (`--clean` removes them); never run it against production.

Environment: copy `.env.local.example` to `.env.local`. Schema changes go in a new numbered file under `supabase/migrations/` (applied manually in Supabase; there is no migration runner). `scripts/import-csv.ts` bulk-imports legacy spreadsheet data with the service-role key (`npx tsx scripts/import-csv.ts --dry-run` first).

## Tech Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript (strict)
- **Styling**: Tailwind CSS v3 (no inline styles, no custom CSS files)
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Supabase email/password, `requireAdmin()` guard on mutations (returns `AdminResult`, not throwing)
- **Forms**: React Hook Form + Zod validation (Vietnamese error messages)
- **Charts**: Recharts (dynamically imported)

## Architecture

**Server Components + Server Actions pattern:**
- Pages (`app/**/page.tsx`) are Server Components that fetch data
- Interactive UI (`components/**`) uses `'use client'` directive
- Mutations go through Server Actions (`app/**/actions.ts`) with `requireAdmin()` + Zod validation + `ActionResult<T>` return type
- Middleware (`middleware.ts`) refreshes Supabase auth session on every request (no route blocking — all pages public); `api/webhooks` and `api/cron` are excluded from its matcher

**Data flow:** Client Component → Server Action → `requireAdmin()` (check `is_admin` in `app_metadata`) → Zod parse → Supabase query → `revalidatePath()` → return `ActionResult`

**Security layers:** `requireAdmin()` in Server Actions + RLS policies with `is_admin()` PL/pgSQL function (defense-in-depth)

**Mobile/desktop split:** below 768px the app renders separate mobile views (`components/mobile/`) rather than responsive variants of the desktop ones. Each route renders a `*-switch.tsx` client component that picks the desktop or mobile component via `hooks/use-is-mobile.ts`; `components/layout/layout-shell.tsx` does the same for sidebar vs bottom nav. `useIsMobile()` returns `null` before hydration, so handle that state to avoid layout flash. A UI change to a feature usually needs to be made in both the desktop and mobile component.

**Bank transfer automation:** SePay posts every transfer of the fund's MB account to `app/api/webhooks/sepay/route.ts` (header `Authorization: Apikey …`). The route uses the service-role client (`lib/supabase/service.ts`, machine callers only), stores the raw row in `bank_transactions` (idempotent on `sepay_id` and `(account_number, reference_code)`), then `lib/bank/process-bank-transaction.ts` matches the sender (stored account number, then sender name in `member_bank_identities`) and allocates money into months (`lib/bank/allocate.ts`: from the month before the transfer, top up partial months, skip `member_leaves`, each month filled up to its own fee from `monthly_fees` via `lib/bank/fee-schedule.ts`; auto only for a transfer equal to the fee of the first month it fills, any other amount stays pending for an admin to split or record). Writes go through the atomic RPCs `apply_bank_income` / `apply_bank_simple` / `revert_bank_transaction` (migration 005). Anything unmatched stays `pending` for admins in the "Giao dịch ngân hàng" section of `/quan-ly-quy/dong-tien`. Zalo Bot messages (`lib/notify/`) report outcomes; on DB failure the route alerts once (Upstash key) and returns 500 so SePay retries. A daily Vercel cron (`vercel.json` → `api/cron/keepalive`) keeps the free Supabase project from pausing. `components/shared/realtime-refresh.tsx` refreshes pages on Supabase Realtime changes.

**QR link previews:** `opengraph-image.tsx` files (root and `qr-chuyen-tien/`) render with `next/og`, which requires inline `style` objects — the only exception to the Tailwind-only rule. The QR one queries Supabase with a cookie-less anon client because link-preview crawlers (Zalo) have no session, so `qr_codes` SELECT must stay public in RLS.

## Key Conventions

- **Path alias**: `@/*` maps to project root
- **Supabase clients**: `@/lib/supabase/server` (Server Components/Actions), `@/lib/supabase/client` (Client Components)
- **Soft deletes**: Members use `status='deleted'` instead of hard delete
- **Auto-create transactions**: Recording a contribution auto-creates a matching transaction entry
- **Parallel fetches**: Use `Promise.all()` for independent Supabase queries
- **Component size**: Keep under 200 LOC per file
- **DB naming**: `snake_case` for tables/columns; `camelCase` for TypeScript
- **Routes are Vietnamese** and nested under `/quan-ly-quy` (dashboard; `/` redirects there): `/quan-ly-quy/thanh-vien` (members), `/quan-ly-quy/dong-tien` (contributions), `/quan-ly-quy/thu-chi` (transactions), `/quan-ly-quy/qr-chuyen-tien` (QR bank transfers). `/login` is the only route outside it.

## Database Tables

- `members` — id, name, status (active/inactive/paused/deleted), joined_at, note
- `contributions` — id, member_id (FK), month ('YYYY-MM'), amount, paid_at
- `transactions` — id, date, type (income/expense), amount, category, description, member_id (FK), contribution_id (FK), bank_transaction_id (FK)
- `member_leaves` — member_id, month; the member owes nothing that month (public read)
- `monthly_fees` — effective_month ('YYYY-MM'), amount; the monthly fund fee from that month until the next row, edited by admins on `/quan-ly-quy/dong-tien` (public read). Never hardcode the fee
- `member_bank_identities` — member_id, kind (name/account), value; **admin-only RLS** (never add bank data to the public `members` table)
- `bank_transactions` — raw SePay transactions: sepay_id, transfer_type (in/out), amount, content, status (pending/applied/ignored), pending_reason, matched_via; **admin-only RLS**
- `qr_codes` — id, title, bank_name, account_name, account_number, image_data (base64), is_active, display_order

## Important Files

- `lib/types/database.ts` — Member, Contribution, Transaction, QrCode interfaces
- `lib/types/action-result.ts` — ActionResult<T> type
- `lib/auth/require-admin.ts` — Auth guard for server actions
- `lib/validations/schemas.ts` — Zod schemas (memberSchema, contributionSchema, transactionSchema, qrCodeSchema)
- `lib/utils/format.ts` — Currency (VND) and date formatters
- `lib/utils/constants.ts` — Status labels, categories, default amounts
- `supabase/migrations/` — Database schema DDL and RLS policies (numbered, apply in order)
