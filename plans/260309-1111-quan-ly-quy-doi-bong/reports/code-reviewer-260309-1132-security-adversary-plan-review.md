# Security Adversary Plan Review

**Reviewer:** code-reviewer (Security Adversary perspective)
**Date:** 2026-03-09
**Scope:** All 8 phases of "Quan Ly Quy Doi Bong" plan
**Findings:** 8

---

## Finding 1: RLS Policies Grant All Authenticated Users Full Write Access

- **Severity:** Critical
- **Location:** Phase 2, section "Implementation Steps", step 6
- **Flaw:** RLS policies check only `auth.role() = 'authenticated'`, not a specific admin user or role. Any user who signs up via Supabase Auth (self-service signup is ON by default) becomes `authenticated` and gets full INSERT/UPDATE/DELETE on all tables.
- **Failure scenario:** Attacker visits the app, signs up with any email (Supabase allows self-signup by default), and immediately has write access to all tables. They can delete all members, falsify contributions, drain the fund ledger. The plan says "Single admin account created via Supabase dashboard" but nothing prevents additional signups.
- **Evidence:** `CREATE POLICY "Auth insert" ON members FOR INSERT WITH CHECK (auth.role() = 'authenticated');` -- Phase 2 step 6. Plan.md: "Single admin account created via Supabase dashboard" with no mention of disabling signups or checking user identity.
- **Suggested fix:** Either (a) disable Supabase self-signup in project settings and document this as a required setup step, or (b) check against a specific admin user UUID/email in RLS policies: `auth.jwt()->>'email' = 'admin@team.com'`, or (c) create a custom `admins` table and check membership. Option (a) is simplest.

## Finding 2: Import Script Uses Service Role Key Without Access Controls

- **Severity:** High
- **Location:** Phase 8, section "Implementation Steps", step 1
- **Flaw:** The CSV import script creates a Supabase client directly. To bypass RLS for bulk inserts, it will need the service role key. The plan does not specify how this key is sourced, stored, or protected. The script lives in `/scripts/` which gets committed to the repo.
- **Failure scenario:** Developer hardcodes the service role key in the script or in a `.env` file that gets committed. The service role key bypasses all RLS -- anyone with it has unrestricted database access. Alternatively, if the script uses the anon key, it cannot write (RLS blocks it), and the import silently fails.
- **Evidence:** Phase 8 shows `createClient` import but no mention of which key to use, how to source it, or `.gitignore` protections. No `.env` file is listed in Phase 8 "Related Code Files."
- **Suggested fix:** Explicitly document: (1) use SUPABASE_SERVICE_ROLE_KEY from env var, (2) never commit it, (3) add `scripts/.env` to `.gitignore`, (4) add a safety check in the script that refuses to run if `--dry-run` is not passed on first invocation.

## Finding 3: No Server-Side Authorization Check in Server Actions

- **Severity:** Critical
- **Location:** Phase 4, section "Implementation Steps", step 1; Phase 5 step 1; Phase 6 step 1
- **Flaw:** Server actions (createMember, updateMember, deleteMember, etc.) are defined but the plan never specifies checking auth state before performing mutations. Server actions are publicly callable HTTP endpoints. RLS is the only defense, but if the server client uses the service role key (common pattern for server components), RLS is bypassed entirely.
- **Failure scenario:** Phase 2 risk table says "Use service role key for server-side reads if needed." If the server client uses service role key, server actions bypass RLS. An unauthenticated user can call the server action endpoint directly (e.g., via curl) and perform any mutation. Even with the anon key, the plan's own RLS flaw (Finding 1) means any authenticated user can mutate.
- **Evidence:** Phase 2 Risk Assessment: "RLS blocks server components | High | Use service role key for server-side reads if needed". Phase 4 step 1 lists actions with no auth check mentioned.
- **Suggested fix:** Every mutating server action must call `supabase.auth.getUser()` first and verify the user is the admin. Document this as a mandatory pattern in Phase 4 before the other pages copy it.

## Finding 4: NEXT_PUBLIC_ Anon Key Exposure Enables Direct API Abuse

- **Severity:** High
- **Location:** Phase 1, section "Implementation Steps", step 9; Plan.md "Auth Model"
- **Flaw:** The Supabase anon key is exposed client-side via `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Combined with Finding 1 (any authenticated user has write access), an attacker can use this key to call the Supabase REST API directly, bypassing the Next.js UI entirely.
- **Failure scenario:** Attacker extracts `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the page source. Signs up via `POST /auth/v1/signup`. Uses the returned JWT to `DELETE FROM members` via PostgREST API. The entire database is wiped without touching the app's UI.
- **Evidence:** Phase 1: `.env.local.example` lists `NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY`. This is standard Supabase practice, but only safe if RLS is bulletproof -- which it is not per Finding 1.
- **Suggested fix:** This is a compounding issue. Fix Finding 1 (disable self-signup) and this attack vector closes. Additionally, consider rate limiting on the Supabase project.

## Finding 5: No Input Validation or Sanitization on Server Actions

- **Severity:** High
- **Location:** Phase 4 steps 1,4; Phase 5 step 1; Phase 6 step 1; Phase 8 step 2-4
- **Flaw:** The plan specifies React Hook Form validation (name not empty) but never mentions server-side validation in server actions. Form data from `createMember(data)`, `createTransaction(data)` etc. is passed directly to Supabase insert calls.
- **Failure scenario:** Attacker bypasses the client form and calls the server action with: (a) negative amounts -- `amount: -5000000` -- corrupting the fund balance, (b) XSS payloads in `name`, `description`, or `note` fields that render unsanitized in the table, (c) SQL injection via crafted strings in category fields (mitigated by Supabase parameterized queries, but defense-in-depth is missing).
- **Evidence:** Phase 5 step 6: "Amount: number input (show formatted preview)" -- client-side only. Phase 2: `CHECK (amount > 0)` exists on transactions but not on contributions. No server-side validation schema (zod, yup) mentioned anywhere.
- **Suggested fix:** Add a validation layer (zod schema) to every server action. Validate types, ranges (amount > 0), string lengths, and sanitize HTML entities in text fields. Document this as a cross-cutting concern in Phase 4.

## Finding 6: No CSRF Protection on Server Actions

- **Severity:** Medium
- **Location:** Phase 4-6, all server actions
- **Flaw:** Next.js server actions use POST requests but the plan does not mention CSRF token validation. While Next.js 14 has some built-in CSRF mitigations (checking Origin header), these can be bypassed in certain configurations.
- **Failure scenario:** Admin is logged in. They visit a malicious site that contains a hidden form posting to the server action endpoint. The browser sends the admin's auth cookies, and the server action executes a mutation (e.g., deleting a member) without the admin's intent.
- **Evidence:** No mention of CSRF, SameSite cookie settings, or origin validation in any phase. The login page (Phase 3) sets auth via `supabase.auth.signInWithPassword()` which stores tokens in cookies.
- **Suggested fix:** Verify Next.js 14 server actions enforce Origin header checking by default for the deployed environment. Explicitly set `SameSite=Lax` on auth cookies. Document these assumptions.

## Finding 7: Running Balance Calculation is Client-Side Only -- Data Integrity Risk

- **Severity:** Medium
- **Location:** Phase 5, section "Implementation Steps", step 3
- **Flaw:** Running balance is calculated entirely client-side by iterating sorted transactions. There is no server-side balance tracking or verification. The "Tong thu - Tong chi = Con lai" on the dashboard (Phase 7) may show different numbers than the ledger if there are floating-point issues or if data is fetched at different moments.
- **Failure scenario:** Admin adds a transaction on the ledger page. They navigate to the dashboard. Due to caching or stale data, the dashboard shows a different balance than the ledger. Admin trusts the wrong number and makes financial decisions based on it. More critically, if a contribution is recorded in the matrix but no corresponding "income" transaction is created, the fund balance does not reflect the contribution -- money is tracked in two disconnected tables.
- **Evidence:** Phase 5: "Calculate running balance: iterate sorted-by-date-ASC, cumulate". Phase 7: "Query total income: SUM(amount) WHERE type='income'". Contributions table is separate from transactions table -- no automatic linkage.
- **Suggested fix:** Either (a) auto-create a transaction record when a contribution is recorded (Phase 6 should trigger a transaction insert), or (b) the dashboard should aggregate from BOTH tables and document clearly which is the source of truth for fund balance.

## Finding 8: Member Lookup by Name in Import Creates Collision Risk

- **Severity:** Medium
- **Location:** Phase 8, section "Implementation Steps", steps 2-4
- **Flaw:** The CSV import looks up `member_id` by name for contributions and transactions. The members table has no UNIQUE constraint on `name`. If two members share the same name (common in Vietnamese teams -- e.g., two "Nguyen Van A"), contributions will be assigned to the wrong member.
- **Failure scenario:** CSV contains contributions for "Nguyen Van Hieu". Two members have that name. The import assigns all contributions to whichever one the query returns first (non-deterministic without ORDER BY). One member gets credited double, the other gets nothing. Financial records are corrupted silently.
- **Evidence:** Phase 8 step 3: "Lookup member_id by name". Phase 4 Risk Assessment: "Duplicate member names | Low | Show warning toast, no hard constraint". Phase 2 schema: no UNIQUE on `members.name`.
- **Suggested fix:** Add a UNIQUE constraint on `members.name` (simplest for a 31-person team), or use a secondary identifier in the CSV (e.g., phone number, jersey number) for disambiguation. At minimum, the import script must error loudly if a name lookup returns multiple rows.

---

## Summary

| Severity | Count | Key Theme |
|----------|-------|-----------|
| Critical | 2 | Auth bypass via self-signup + missing server-side auth checks |
| High | 3 | Direct API abuse, no input validation, import key exposure |
| Medium | 3 | CSRF, data integrity gaps, name collision in import |

The two critical findings (1 and 3) compound: if self-signup is not disabled AND server actions use service role key, the database is wide open to any anonymous visitor. This must be resolved before implementation begins.
