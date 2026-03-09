# Plan Failure Analysis: Quan Ly Quy Doi Bong

**Reviewer:** code-reviewer (Failure Mode Analyst)
**Date:** 2026-03-09
**Scope:** All 8 phases + plan.md

---

## Finding 1: Running Balance Corruption When Filters Applied

- **Severity:** Critical
- **Location:** Phase 5, section "Implementation Steps" step 3 and Risk Assessment
- **Flaw:** The plan says "Calculate balance on ALL data, then filter for display" in the risk table, but the implementation steps say "iterate sorted-by-date-ASC, cumulate (income + expense -)". These are contradictory instructions. The implementation steps describe calculating running balance on the full dataset, but there is no specification for what the running balance column should show when filters are active. If you filter by a single member, does running balance show the global fund balance or that member's personal balance? Neither behavior is specified.
- **Failure scenario:** Developer implements running balance on filtered data. Admin filters to member "Nguyen Van A". Running balance shows 200,000 -> 400,000 -> 600,000 (only that member's contributions). Admin thinks the fund only has 600,000. Or developer implements global balance, and the running balance column shows numbers that have no visible relationship to the rows on screen (e.g., jumps from 2,000,000 to 2,200,000 to 5,800,000 because filtered-out transactions exist between them). Both are confusing and wrong.
- **Evidence:** Phase 5 step 3: "Calculate running balance: iterate sorted-by-date-ASC, cumulate" vs Risk table: "Calculate balance on ALL data, then filter for display"
- **Suggested fix:** Explicitly define: (1) running balance always reflects ALL transactions regardless of filter state, OR (2) running balance recalculates on filtered subset. Document the UX rationale. If option 1, add a visual indicator that balance includes hidden transactions.

## Finding 2: No Transaction Isolation for Contribution-to-Transaction Linkage

- **Severity:** Critical
- **Location:** Phase 2 (schema), Phase 5, Phase 6 -- cross-cutting
- **Flaw:** Contributions and transactions are two separate tables with no linkage. When a member pays their monthly 200,000 contribution, it gets recorded in the `contributions` table (Phase 6 matrix) but there is no corresponding `income` transaction in the `transactions` table. The dashboard (Phase 7) sums income from the `transactions` table. Contributions are invisible to the dashboard and the ledger page.
- **Failure scenario:** 31 members pay 200,000 each for 9 months = 55,800,000 VND in contributions. Dashboard shows "Tong thu: 0" because no transactions exist. The fund balance is wildly wrong. OR the admin manually double-enters every contribution as a transaction, creating a maintenance nightmare where the two tables drift out of sync.
- **Evidence:** Phase 7 step 1: "Query total income: SUM(amount) WHERE type='income'" queries only `transactions`. Phase 6 records payments into `contributions` table. No bridge between them.
- **Suggested fix:** Either (A) auto-create a transaction record when a contribution is recorded (with a `contribution_id` FK for traceability), or (B) dashboard aggregates from BOTH tables. Option A is cleaner. This is a fundamental data model flaw that will make the app produce incorrect financial summaries.

## Finding 3: CSV Import Uses Member Name as Lookup Key -- Collision and Failure Guaranteed

- **Severity:** High
- **Location:** Phase 8, "Implementation Steps" steps 2-4
- **Flaw:** Import script looks up `member_id` by name string matching. Vietnamese names have diacritics, whitespace variations, and duplicates are common ("Nguyen Van A" appears in any Vietnamese group). The plan acknowledges this in risk assessment but the mitigation ("Trim whitespace, case-insensitive match") is insufficient.
- **Failure scenario:** Google Sheets has "Nguyễn Văn A" but the CSV export loses diacritics or changes encoding, producing "Nguyen Van A". Lookup fails. All contributions for that member are orphaned. Alternatively, two members share the same name -- one gets the other's contributions. Financial data is silently corrupted with no error.
- **Evidence:** Phase 8 step 3: "Lookup member_id by name". Phase 4 risk assessment: "Duplicate member names -- Show warning toast, no hard constraint"
- **Suggested fix:** Add a `external_id` or `sheet_row_number` column to members table. Import by stable identifier, not display name. At minimum, require exact-match and abort on ambiguous lookups instead of silently picking one.

## Finding 4: No Auth Session Validation on Server Actions

- **Severity:** High
- **Location:** Phase 4 step 1, Phase 5 step 1, Phase 6 step 1 -- all server actions
- **Flaw:** Server actions for create/update/delete rely entirely on RLS for authorization. The plan never mentions checking `auth.getUser()` or `auth.getSession()` inside server actions. Server actions execute with the Supabase client created in the server context. If the server client is created with `SUPABASE_SERVICE_ROLE_KEY` (as hinted in Phase 2 risk mitigation: "Use service role key for server-side reads if needed"), RLS is bypassed entirely, and any anonymous user can invoke CRUD server actions.
- **Failure scenario:** Phase 2 risk mitigation suggests using service role key for server reads. Developer uses the same client for writes. RLS is bypassed. Anonymous visitor discovers server action endpoint, sends POST request, deletes all members. No auth check in application code. Data loss.
- **Evidence:** Phase 2 Risk: "Use service role key for server-side reads if needed". Phase 4 step 1: server actions list CRUD operations with no mention of auth verification. Phase 1: `server.ts` creates `createServerClient()` but no specification of which key it uses for mutations.
- **Suggested fix:** Every mutating server action must explicitly call `supabase.auth.getUser()` and reject if not authenticated, regardless of RLS. Never use service role key in client-facing code paths. Specify this as a cross-cutting requirement in Phase 1.

## Finding 5: Cascade Delete on Members Destroys Financial History Without Recovery

- **Severity:** High
- **Location:** Phase 2 schema, Phase 4 step 1
- **Flaw:** `contributions` table has `ON DELETE CASCADE` on member FK. Deleting a member permanently destroys all their contribution history. `transactions` table uses `ON DELETE SET NULL` which is better but still loses the member association. There is no soft-delete mechanism. The confirmation dialog warns the user, but there is no undo and no audit trail.
- **Failure scenario:** Admin accidentally deletes the wrong member (fat-finger on mobile, small touch targets). 9 months of contribution records vanish instantly. No backup, no undo, no recovery. The contribution matrix now shows incorrect totals for all historical months. Dashboard income totals drop. Financial records are permanently corrupted.
- **Evidence:** Phase 2 step 1: `REFERENCES members(id) ON DELETE CASCADE`. Phase 4 risk: "ConfirmDialog warns 'se xoa toan bo lich su dong tien'" -- a warning does not prevent mistakes.
- **Suggested fix:** Use soft delete (`deleted_at` timestamp) instead of hard delete. Or change to `ON DELETE RESTRICT` and require admin to manually reassign/archive contributions before removing a member. For a financial app, data destruction should be extremely difficult.

## Finding 6: No Optimistic Locking -- Concurrent Admin Edits Cause Silent Data Loss

- **Severity:** High
- **Location:** Phase 4, 5, 6 -- all update server actions
- **Flaw:** No `updated_at` check or version column on update operations. The plan has `updated_at` on `members` table but no mechanism to use it for conflict detection. If the plan anticipates only one admin, it should state that explicitly. The auth model says "Single admin account" but nothing prevents sharing credentials or multiple browser tabs.
- **Failure scenario:** Admin opens member edit in Tab A. Admin opens same member in Tab B. Tab A saves "status: inactive". Tab B saves "note: something" -- Tab B's save overwrites Tab A's status change back to "active" because it loaded the old data. The status change is silently lost. For financial records (transaction edits), this means amounts can be silently overwritten.
- **Evidence:** Phase 2: `members` has `updated_at` column. No phase mentions optimistic locking, version checks, or `WHERE updated_at = $old_value` in UPDATE statements.
- **Suggested fix:** Add `WHERE updated_at = :original_updated_at` to all UPDATE queries. If 0 rows affected, return conflict error and force reload. This is 5 lines of code per action and prevents silent data loss.

## Finding 7: No Data Backup or Migration Rollback Strategy

- **Severity:** Medium
- **Location:** Phase 2, Phase 8, plan.md -- missing entirely
- **Flaw:** The plan creates a production database schema, runs a one-time import of 9 months of real financial data, and has zero mention of backups, migration rollback, or data recovery. Supabase free tier has limited backup options. There is no `down` migration to undo schema changes.
- **Failure scenario:** CSV import script has a bug that corrupts the `amount` field (e.g., imports "200.000" as 200 instead of 200000 due to locale-dependent number parsing). All 9 months of contribution data is wrong. No backup exists. The original Google Sheets may have been modified or deleted since export. Data is unrecoverable.
- **Evidence:** No mention of "backup", "rollback", "migration down", or "pg_dump" anywhere in the 8 phase files or plan.md.
- **Suggested fix:** Add pre-import `pg_dump` step. Add `down` migration scripts. For the import specifically, wrap the entire import in a transaction so it's atomic -- either all rows succeed or none do.

## Finding 8: Month Column Generation Creates Gaps or Missing Data Silently

- **Severity:** Medium
- **Location:** Phase 6, "Implementation Steps" step 2-3
- **Flaw:** Month columns are "derived from contributions data (min month to max month)." If no contribution exists for a given month (e.g., team took a break in December), that month column will not appear in the matrix. There is no mechanism to define "expected months" independent of actual data. The plan mentions "add new month column" in top controls but gives no specification for how this works.
- **Failure scenario:** Team has contributions for months 08, 09, 10, 11, 01, 02, 03 (skipped December). Matrix shows no December column. Admin doesn't notice. New member joins in January, admin can never record that they were supposed to pay in December because the column doesn't exist. Or, admin clicks "add month" but there's no spec for what month it adds, whether it persists, or what happens if they add a month that already has data.
- **Evidence:** Phase 6 step 2: "Derive month columns from contributions data (min month to max month)". Step 5: "add new month column" with no further detail.
- **Suggested fix:** Generate month columns as continuous range from min to max (filling gaps). Define the "add month" interaction explicitly: does it extend the range forward? Does it add arbitrary months? Store the expected month range in a config table or derive it from a start date + end date.

---

## Unresolved Questions

1. Are contributions supposed to appear as income transactions in the ledger? This ambiguity (Finding 2) is architecturally fundamental and must be resolved before implementation begins.
2. What Supabase client key do server actions use for mutations -- anon key or service role key? This determines whether RLS actually protects anything.
3. Is the "single admin account" a hard constraint or could multiple people share the login? This affects whether concurrent edit protection matters.
