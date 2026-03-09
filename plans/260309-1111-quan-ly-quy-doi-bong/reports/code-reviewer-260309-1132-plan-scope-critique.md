# Plan Scope & Complexity Review: Quan Ly Quy Doi Bong

**Reviewer perspective:** Scope & Complexity Critic (YAGNI enforcer)
**Date:** 2026-03-09

---

## Finding 1: Supabase is over-engineering for a ~32-member CRUD app

- **Severity:** Critical
- **Location:** plan.md, Tech Stack section; Phase 2 entire
- **Flaw:** The original prompt explicitly suggested "simple JSON file or SQLite (via Prisma) as data store -- no external DB required." The plan escalated to Supabase PostgreSQL with RLS, auth middleware, SSR client/browser client split, service role keys, migration files, and seed SQL. This is a team ledger for 32 people with ~500 transactions max.
- **Failure scenario:** Supabase introduces external dependency management (env vars, project provisioning, RLS debugging, auth session refresh middleware, anon vs authenticated role confusion), adds ~4h of setup/debugging overhead not in the estimate, and creates a hard dependency on Supabase uptime for a tool that could run from a single SQLite file. RLS misconfiguration (Phase 2 Risk Assessment already flags "RLS blocks server components") will burn time that a simpler store avoids entirely.
- **Evidence:** `"Use a simple JSON file or SQLite (via Prisma) as data store — no external DB required"` from `docs/prompt_quan_ly_thu_chi.md` line 22. Plan ignores this and introduces 2 Supabase client files, middleware, RLS policies, and migration SQL.
- **Suggested fix:** Use SQLite via Prisma or even a JSON file. If Supabase is truly desired, justify why and add the setup overhead to the time estimate. Currently Phase 1 (2h) and Phase 2 (2h) will not cover Supabase provisioning + RLS debugging.

---

## Finding 2: Auth system for a single admin is unnecessary complexity

- **Severity:** High
- **Location:** plan.md "Auth Model"; Phase 1 (middleware.ts); Phase 3 (login page)
- **Flaw:** The plan builds Supabase Auth with email/password login, auth middleware for session refresh, a dedicated login page, login/logout button in sidebar, and RLS policies split across anon/authenticated roles -- all for a single admin account manually created in Supabase dashboard. A simple password check or even a static secret in an env var would suffice for one person.
- **Failure scenario:** Auth middleware breaks server component rendering. Session refresh bugs cause silent auth failures. The admin gets locked out and has to debug Supabase auth flows. 3 separate files (middleware.ts, login/page.tsx, sidebar auth state) plus RLS policies = 5+ touch points for a feature that protects writes for one person.
- **Evidence:** `"Single admin account created via Supabase dashboard"` (plan.md line 62). One user does not justify a full auth system.
- **Suggested fix:** Use a simple shared secret / env-var password check. Or skip auth entirely for MVP -- it is an internal tool. Add auth later if multi-admin becomes real.

---

## Finding 3: Component library scope is gold-plating

- **Severity:** High
- **Location:** Phase 3, "Implementation Steps" section, items 4-5
- **Flaw:** Phase 3 specs 10+ reusable components (Modal, Badge, Toast with context provider, Skeleton, EmptyState, ConfirmDialog, CurrencyDisplay, DateDisplay, Breadcrumb) before any page is built. This is a component library, not an MVP. Many of these will be used once or twice. Toast with context provider + hook + auto-dismiss is a mini-framework.
- **Failure scenario:** 3h estimate for Phase 3 is consumed by component infrastructure. Pages in Phases 4-6 discover the component APIs don't fit their actual needs, requiring rework. Toast provider wrapping the entire app introduces a client component boundary that conflicts with Server Components.
- **Evidence:** `"Toast: context provider + hook useToast(), auto-dismiss 3s"` (Phase 3 step 4). A simple `window.alert` or `sonner` library (2 lines to install) replaces this entire subsystem.
- **Suggested fix:** Use `sonner` or `react-hot-toast` (one import, zero custom code). Build components inline as pages need them, extract shared ones only when duplication actually appears.

---

## Finding 4: Running balance calculation has an unresolved correctness bug in the spec

- **Severity:** High
- **Location:** Phase 5, "Implementation Steps" step 3; "Risk Assessment" row 1
- **Flaw:** The plan says: fetch transactions ordered by date ASC for running balance calc, display in date DESC order. But when filters are applied (date range, member, category), the running balance must still reflect ALL transactions up to each row's date, not just filtered ones. The plan half-acknowledges this in Risk Assessment ("Calculate balance on ALL data, then filter for display") but the implementation steps contradict it by filtering client-side after fetching all data.
- **Failure scenario:** Admin filters to "Expenses only." Running balance shows nonsensical numbers because it only sums expenses. Or admin filters by member and balance appears wrong because other members' transactions are excluded. This will be reported as a bug, debugged, and require redesign of the filter/balance architecture.
- **Evidence:** Step 3: `"Receive transactions, apply client-side filters"` vs Risk: `"Calculate balance on ALL data, then filter for display"`. These are contradictory instructions.
- **Suggested fix:** Decide now: running balance is always global (all transactions), and filters only hide/show rows while keeping the global balance column. Or running balance recalculates per filtered view. Pick one, spec it clearly, and adjust the implementation steps to match.

---

## Finding 5: CSV import (Phase 8) is spec'd as a CLI script but the data format is unknown

- **Severity:** High
- **Location:** Phase 8, "Implementation Steps" section
- **Flaw:** The import script assumes specific CSV column layouts (`[name, status, joined_at, note]`, `[member_name, month, amount, paid_at, note]`, etc.) but the actual Google Sheets export format is unknown. Phase 8 creates placeholder CSV files. The mapping logic (Vietnamese status strings to English, date format parsing) is guesswork.
- **Evidence:** `"/scripts/data/members.csv — exported member data (placeholder)"` (Phase 8 line 31). Placeholder means the format is not yet known. `"Parse multiple date formats with date-fns"` in Risk Assessment confirms format uncertainty.
- **Failure scenario:** Phase 8 is the last phase. Developer builds entire import script, then discovers the Google Sheets columns have different names, merged cells, or inline notes that break parsing. The 2h estimate evaporates. Real data might expose schema mismatches (member who paid for 2 months in one row, which the Contribution model's UNIQUE(member_id, month) cannot represent as a single record).
- **Suggested fix:** Get the actual CSV export from Google Sheets NOW, before implementation starts. Adjust the schema if the real data doesn't fit. Move CSV format analysis to Phase 0 / pre-work.

---

## Finding 6: 20h total estimate is unrealistic for Supabase + RLS + Auth + 4 pages + charts + CSV import

- **Severity:** High
- **Location:** plan.md, Phases table (effort column)
- **Flaw:** The plan estimates 20h for: project setup, Supabase provisioning, RLS policies, auth middleware, login page, 10+ reusable components, sidebar layout, 3 data-heavy CRUD pages, a matrix table with sticky columns, a dashboard with Recharts, a CSV import script, and full polish. This is a 40-60h project scope squeezed into a 20h estimate.
- **Failure scenario:** Phase 3 alone (sidebar + 10 components + login page) is estimated at 3h. Building a toast system, modal with portal, skeleton components, breadcrumb, responsive sidebar with hamburger toggle, and a login page with Supabase auth in 3 hours is not credible. When estimates slip, later phases get rushed, and the contribution matrix (the hardest piece) gets the worst of it.
- **Evidence:** Phase 3 = 3h for 12 files listed under "Create". Phase 6 = 3h for a spreadsheet-like matrix with sticky columns, which is notoriously tricky CSS. Phase 7 = 2h for a dashboard with Recharts (which requires SSR workarounds).
- **Suggested fix:** Either cut scope (drop auth, use a toast library, simplify components) or double the estimate. Honest estimate for current scope: 35-40h.

---

## Finding 7: Contribution matrix month generation has no upper bound or user control

- **Severity:** Medium
- **Location:** Phase 6, "Implementation Steps" step 2-3
- **Flaw:** Month columns are derived from contribution data range (min month to max month). But what if a contribution is accidentally recorded for a future month (e.g., 2027-12)? The matrix would generate columns for every month between earliest and that typo, creating dozens of empty columns. There is no mechanism to limit the range or let the user choose which months to display.
- **Failure scenario:** Admin creates a contribution with month "2027-01" by typo. Matrix now shows 20+ columns of empty cells. Admin cannot figure out how to fix this without deleting the record directly.
- **Evidence:** `"Derive month columns from contributions data (min month to max month)"` (Phase 6 step 2). No validation, no cap, no user override.
- **Suggested fix:** Add a reasonable month range limit (e.g., max 12 months displayed, with prev/next navigation). Or validate month input to be within current year +/- 1 month.

---

## Finding 8: No error handling strategy for server actions

- **Severity:** Medium
- **Location:** Phase 4 "Implementation Steps" step 1; Phase 5 step 1; Phase 6 step 1
- **Flaw:** Every phase defines server actions (createMember, updateMember, getTransactions, etc.) but none spec error handling. What happens when Supabase is unreachable? When RLS blocks a write because auth expired? When a UNIQUE constraint violation occurs on contribution insert? The plan says "Toast on CRUD success/error" but never defines what errors look like, how they propagate from server action to client, or how to distinguish "auth expired" from "network error" from "constraint violation."
- **Failure scenario:** Server action throws. Next.js server action error boundary catches it generically. User sees "Something went wrong" with no actionable message. Auth expiry looks identical to a network failure. UNIQUE violation on contribution shows same error as a database timeout.
- **Evidence:** Phase 4 step 1 lists 5 server actions with no error handling mentioned. Phase 6 step 1 same pattern. Toast system is built in Phase 3 but never wired to specific error types.
- **Suggested fix:** Define a server action response pattern (`{ success: boolean, data?, error?: string }`) in Phase 1 as a shared utility. Spec the 3-4 common error cases (auth expired, network, constraint violation, unknown) and how each surfaces to the user.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 5 |
| Medium | 2 |

**Core problem:** This plan takes a simple internal CRUD tool for 32 people and architects it like a production SaaS. Supabase + RLS + Auth + custom component library + CLI import scripts for a team that was happily using Google Sheets. The YAGNI violations compound: each one adds setup time, debugging surface, and integration risk. Strip it to SQLite + no auth + off-the-shelf components and the project becomes genuinely achievable in 20h.
