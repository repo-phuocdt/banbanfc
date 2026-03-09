# Plan Hostile Review: Quan Ly Quy Doi Bong

**Reviewer:** code-reviewer (Assumption Destroyer)
**Date:** 2026-03-09
**Scope:** plan.md + phase-01 through phase-08

---

## Finding 1: Running Balance Breaks Under Filtered Views

- **Severity:** Critical
- **Location:** Phase 5, section "Implementation Steps" step 3
- **Flaw:** The plan says "Calculate running balance: iterate sorted-by-date-ASC, cumulate" then "Display in date DESC order but with correct running balance." The Risk Assessment acknowledges this: "Calculate balance on ALL data, then filter for display." But the implementation steps contradict this -- step 3 says filters are applied client-side BEFORE the running balance description, and the running balance is calculated on the filtered data set. There is no concrete algorithm for preserving global running balance while showing a filtered subset.
- **Failure scenario:** User filters transactions to "Chi" (expense only). The running balance column now shows a monotonically decreasing number that does not match reality. The user sees "balance: -2,400,000" on the last row, panics, and thinks the fund is deeply negative. The risk assessment says "calculate on ALL data" but the implementation steps say "apply client-side filters" then "calculate running balance." Which is it? The implementer will follow the steps, not the risk table.
- **Evidence:** Step 3: "Receive transactions, apply client-side filters" then "Calculate running balance: iterate sorted-by-date-ASC, cumulate." Risk Assessment: "Calculate balance on ALL data, then filter for display."
- **Suggested fix:** Explicitly define the algorithm: (1) compute running balance on the FULL unfiltered dataset, (2) attach the cumulative balance to each transaction row, (3) THEN filter rows for display. The balance column always shows the global state at that point in time, regardless of filter. Document this in Implementation Steps, not buried in Risk.

---

## Finding 2: RLS Policy Uses Wrong Function for Role Check

- **Severity:** Critical
- **Location:** Phase 2, section "Implementation Steps" step 6
- **Flaw:** The RLS policies use `auth.role() = 'authenticated'`. In Supabase, `auth.role()` returns the Postgres role (`anon`, `authenticated`, `service_role`), but this function only works correctly when the request comes through PostgREST with a valid JWT. If the plan uses a server component with the anon key (as implied by "public read via anon role"), write operations from authenticated users will fail unless the client correctly passes the user's JWT. The plan never specifies WHICH Supabase client to use for mutations -- browser client (has JWT) vs server client (might use service role key, bypassing RLS entirely).
- **Failure scenario:** Server actions in phases 4-6 use `createServerClient()` from Phase 1. If that server client uses the `SUPABASE_SERVICE_ROLE_KEY`, it bypasses RLS entirely -- any request can write, even unauthenticated ones visiting the page. If it uses the anon key, authenticated writes fail because the server component doesn't forward the user's session token. Either way, the auth model is broken.
- **Evidence:** Phase 2 step 6: `auth.role() = 'authenticated'`. Phase 1: creates server client but never specifies which key it uses or how it forwards auth context. Plan.md Auth Model: "Admin write requires login (RLS INSERT/UPDATE/DELETE for authenticated role)."
- **Suggested fix:** Explicitly define: (1) browser client for mutations (has user JWT, RLS works), or (2) server client with cookie-forwarded session via `@supabase/ssr` cookies helper. Specify which key each client uses. Never use service role key for user-facing operations.

---

## Finding 3: Contribution-Transaction Data Consistency Gap

- **Severity:** High
- **Location:** Phase 5 + Phase 6 (cross-phase), plan.md "Data Models"
- **Flaw:** When a member pays their monthly contribution (recorded in `contributions` table via Phase 6), there is no corresponding entry created in the `transactions` table. The contribution matrix and the transaction ledger are completely disconnected data stores. Dashboard (Phase 7) queries transactions for "Tong thu" but contributions are not transactions.
- **Failure scenario:** Team captain records 20 members paying 200,000 each for March via the contribution matrix. Tong thu on the dashboard shows 0 because those payments are in `contributions`, not `transactions`. The captain must ALSO manually add 20 individual income transactions in the ledger -- or one bulk "4,000,000 Quy hang thang" entry. The plan never mentions this dual-entry requirement. The running balance on the ledger page won't reflect contribution income unless manually entered. Data will inevitably drift.
- **Evidence:** plan.md Data Models: `Contribution` and `Transaction` are separate. Phase 6 creates contributions without touching transactions. Phase 7 queries only `transactions` for totals. No phase describes syncing or auto-creating transaction records from contributions.
- **Suggested fix:** Either (a) auto-create a transaction record when a contribution is saved (with a link back to contribution_id for traceability), or (b) explicitly document that the captain must manually enter a summary transaction for monthly contributions, and add a UI affordance in the contribution matrix ("Them vao so thu chi" button after recording payments). Option (a) is strongly preferred.

---

## Finding 4: No Logout Implementation

- **Severity:** High
- **Location:** Phase 3, section "Implementation Steps" step 6
- **Flaw:** Phase 3 creates a login page with `signInWithPassword()` and mentions "Login/Logout button in sidebar footer." But there is no logout implementation anywhere. No `signOut()` call, no server action, no route handler. The sidebar mentions a logout button in requirements but implementation steps only cover login.
- **Failure scenario:** Admin logs in, performs CRUD operations, then wants to log out. There is no logout button wired up. The admin closes the tab, but the Supabase session persists in cookies. If someone else opens the browser, they have full admin access. On a shared computer (common in amateur team settings -- the captain's laptop at the field), this is a real security issue.
- **Evidence:** Phase 3 Requirements: "Login/logout button in sidebar footer." Phase 3 Implementation Steps step 6: only covers login. No step mentions `supabase.auth.signOut()`.
- **Suggested fix:** Add explicit implementation step: wire logout button in sidebar to call `supabase.auth.signOut()`, clear session, redirect to `/quan-ly-quy`. Add it to the todo list.

---

## Finding 5: CSV Import Uses Service Role Key Without Guard Rails

- **Severity:** High
- **Location:** Phase 8, section "Implementation Steps" step 1
- **Flaw:** The import script creates a Supabase client directly: `createClient(url, key)`. Since RLS blocks anon writes, this script MUST use the service role key to insert data. But the plan never mentions this. It also doesn't mention where the service role key comes from (env var? hardcoded? `.env.local`?), and there's no warning about not committing it.
- **Failure scenario:** Implementer tries to run the import script, gets 403 errors on every insert because they're using the anon key. They google it, find they need the service role key, hardcode it in the script, commit it to git. The service role key is now in version history, granting full DB access to anyone who clones the repo.
- **Evidence:** Phase 8 step 1 shows `createClient` import but no mention of which key. Phase 1 `.env.local.example` only lists `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- no service role key variable.
- **Suggested fix:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local.example` (Phase 1). In Phase 8, explicitly state: "Use service role key from env var, never hardcode. Add `scripts/` to `.gitignore` data directory." Add `.env.local` to `.gitignore` (should already be there via Next.js default but verify).

---

## Finding 6: Original Spec Edge Cases Completely Ignored

- **Severity:** High
- **Location:** All phases (omission). Source: `docs/prompt_quan_ly_thu_chi.md` "Edge Cases" section.
- **Flaw:** The original spec in `docs/prompt_quan_ly_thu_chi.md` lists 5 explicit edge cases. The plan addresses zero of them:
  1. Member pays more than standard (300,000 instead of 200,000) -- partially handled (amount field editable), but no UI indication of non-standard payment.
  2. Transaction not linked to a specific member -- handled (member_id nullable), but no plan text acknowledges it.
  3. Member pays multiple months at once ("Quy thang 12 + thang 1") -- NOT handled. The contribution matrix only allows one cell = one month. No bulk payment flow.
  4. Unknown exact date ("Khong nho") -- NOT handled. Date fields are required in the schema (`NOT NULL`).
  5. Running balance with different sort orders -- partially addressed in Phase 5 but contradictory (see Finding 1).
- **Failure scenario:** Captain tries to record that a member paid 400,000 covering December and January. The matrix has no way to do this in one action. Captain records 200k for Dec, then 200k for Jan separately. But what if the actual payment was 400k in one transaction? The transaction ledger shows one 400k income entry but the matrix shows two 200k cells. Data inconsistency (compounded by Finding 3).
- **Evidence:** `docs/prompt_quan_ly_thu_chi.md` lines 194-198 list edge cases. No plan phase references or addresses them.
- **Suggested fix:** Add an "Edge Cases" subsection to Phase 5 and Phase 6 addressing each item. For bulk payment: add "quick pay multiple months" feature or explicitly document it as out of scope with a workaround. For unknown dates: make `date` nullable or add a "date approximate" flag.

---

## Finding 7: No Error Handling Pattern Defined

- **Severity:** Medium
- **Location:** Phases 4-6, server actions
- **Flaw:** Every phase says "server actions for CRUD" and "toast on success/error." But no phase defines what happens on error. There is no try/catch pattern, no error type definition, no standard return shape from server actions (e.g., `{ success: boolean, error?: string }`). Each implementer session will invent its own error handling, leading to inconsistency.
- **Failure scenario:** Phase 4 implementer returns `{ error: string }` from server actions. Phase 5 implementer throws exceptions. Phase 6 implementer returns `null` on error. The client components each handle errors differently. Some show toasts, some silently fail. When the code reviewer arrives, there are three different error patterns across three pages.
- **Evidence:** Phase 4 step 1: "createMember(data) -- insert member." No return type, no error handling. Phase 5 step 1: same pattern. No shared utility or pattern defined in Phase 1 or Phase 3.
- **Suggested fix:** In Phase 1, define a standard server action result type: `type ActionResult<T> = { success: true; data: T } | { success: false; error: string }`. All server actions must return this shape. Add a `handleActionResult()` utility that shows toast on error.

---

## Finding 8: No Data Validation Beyond DB Constraints

- **Severity:** Medium
- **Location:** Phases 4-6, form modals
- **Flaw:** Form validation is limited to "name required" (Phase 4) and React Hook Form usage. There is no server-side validation in server actions. The DB constraints (CHECK, NOT NULL) will catch some issues, but the errors will be raw Postgres errors surfaced to the user ("new row violates check constraint").
- **Failure scenario:** User enters a negative amount (-200000) in the contribution form. The DB has `CHECK (amount > 0)` on transactions but NO such check on contributions. The contribution is saved with -200000. The member's "Tong da dong" shows a reduced amount. The matrix cell shows a negative green number. If the captain enters 0, the cell shows "0" in green, which is confusing. For transactions, the DB rejects it but the error message shown to the user is the raw Postgres constraint violation text.
- **Evidence:** Phase 2 schema: `contributions` table has no CHECK constraint on amount. `transactions` has `CHECK (amount > 0)`. Phase 4/6 form modals mention no amount validation. No server-side validation described in any server action.
- **Suggested fix:** Add `CHECK (amount > 0)` to contributions table. Define server-side validation in each server action (amount > 0, name non-empty, date valid, category in allowed list). Map constraint violations to user-friendly Vietnamese error messages.

---

## Finding 9: Month Column Generation Has No Upper Bound

- **Severity:** Medium
- **Location:** Phase 6, section "Implementation Steps" step 2
- **Flaw:** Month columns are derived from contribution data: "Derive month columns from contributions data (min month to max month)." If the seed data or import includes a typo month like "2030-01" or "0025-08", the matrix will generate hundreds of empty columns spanning years, breaking the layout.
- **Failure scenario:** During CSV import (Phase 8), a row has month "20250-08" (typo, extra zero). The matrix generates columns from "2025-08" to "20250-08" -- that's 183,600 months of empty columns. The browser tab freezes. Even without typos, if the team has been tracking since 2020, the matrix has 72+ columns with most cells empty for members who joined recently.
- **Evidence:** Phase 6 step 2: "Derive month columns from contributions data (min month to max month)." No validation, no cap, no guard against distant future/past months. Phase 8 import has no month format validation.
- **Suggested fix:** Validate month format strictly (regex `^\d{4}-(0[1-9]|1[0-2])$`). Cap the range: if max - min > 24 months, warn or paginate. Add month format validation in the CSV import script. Consider letting the user select a visible date range instead of showing all months.

---

## Summary

| # | Finding | Severity |
|---|---------|----------|
| 1 | Running balance algorithm contradictory | Critical |
| 2 | RLS auth model underspecified, likely broken | Critical |
| 3 | Contributions not synced to transactions | High |
| 4 | No logout implementation | High |
| 5 | CSV import key management missing | High |
| 6 | Original spec edge cases ignored | High |
| 7 | No standardized error handling pattern | Medium |
| 8 | No server-side validation, contributions missing CHECK | Medium |
| 9 | Month column generation unbounded | Medium |

2 Critical, 4 High, 3 Medium. The plan has structural data integrity issues (Findings 2, 3) that will cause real user-facing bugs in production, and a security gap (Finding 4) that matters in the shared-device context of an amateur football team.
