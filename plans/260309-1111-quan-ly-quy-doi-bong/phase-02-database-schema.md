# Phase 2: Database Schema + RLS + Seed Data

## Overview
- **Priority:** P1 (blocking all data-driven phases)
- **Status:** done
- **Effort:** 2h
- Create Supabase tables, RLS policies, and seed script with real team data.

## Requirements

### Functional
- 3 tables: members, contributions, transactions
- RLS: public read, authenticated write
- Seed data: 31 members, sample contributions/transactions

### Non-functional
- Use `uuid` for primary keys (auto-generated)
- Use `timestamptz` for dates
- Foreign keys with RESTRICT (not CASCADE DELETE) to protect historical data; use soft-delete pattern for members (`status = 'deleted'`)

## Related Code Files

### Create
- `/supabase/migrations/001_create_tables.sql` — DDL for all tables
- `/supabase/migrations/002_rls_policies.sql` — RLS policies
- `/supabase/seed.sql` — seed data (members + sample transactions)
- `/scripts/import-csv.ts` — (placeholder, implemented in Phase 8)

## Implementation Steps

1. Create `members` table:
   ```sql
   CREATE TABLE members (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL UNIQUE, -- UNIQUE required for CSV name-based lookups
     status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','paused','deleted')),
     joined_at TIMESTAMPTZ DEFAULT now(),
     note TEXT,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );
   ```
   > **Soft-delete note:** Use `status = 'deleted'` instead of physical DELETE to preserve contribution/transaction history. All queries filter `WHERE status != 'deleted'` for display.
2. Create `contributions` table:
   ```sql
   CREATE TABLE contributions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT, -- RESTRICT preserves history
     month TEXT NOT NULL, -- 'YYYY-MM'
     amount INTEGER NOT NULL DEFAULT 200000,
     paid_at TIMESTAMPTZ DEFAULT now(),
     note TEXT,
     created_at TIMESTAMPTZ DEFAULT now(),
     UNIQUE(member_id, month)
   );
   ```
   > **Contribution-Transaction linkage:** When a contribution is created, the app must also auto-create a corresponding `Transaction` record with `type='income'`, `category='Quỹ hàng tháng'`, `amount` and `member_id` matching the contribution. See Phase 6 implementation steps.
3. Create `transactions` table:
   ```sql
   CREATE TABLE transactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     date TIMESTAMPTZ DEFAULT now(), -- nullable allowed for approximate/unknown dates
     type TEXT NOT NULL CHECK (type IN ('income','expense')),
     amount INTEGER NOT NULL CHECK (amount > 0),
     category TEXT NOT NULL,
     description TEXT NOT NULL DEFAULT '',
     member_id UUID REFERENCES members(id) ON DELETE SET NULL,
     contribution_id UUID REFERENCES contributions(id) ON DELETE SET NULL, -- links back to source contribution
     note TEXT,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```
4. Create indexes:
   - `contributions(member_id, month)` — unique already covers this
   - `transactions(date)` for sorting
   - `transactions(type)` for filtering
   - `members(status)` for filtering
5. Enable RLS on all tables
6. Create RLS policies:
   ```sql
   -- Public read
   CREATE POLICY "Public read" ON members FOR SELECT USING (true);
   CREATE POLICY "Public read" ON contributions FOR SELECT USING (true);
   CREATE POLICY "Public read" ON transactions FOR SELECT USING (true);
   -- Auth write — role check is safe only because self-signup is disabled (see Phase 1 Step 10)
   -- If self-signup cannot be confirmed disabled, replace auth.role() = 'authenticated'
   -- with auth.uid() = '<ADMIN_UUID>' for stricter single-admin enforcement.
   CREATE POLICY "Auth insert" ON members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   CREATE POLICY "Auth update" ON members FOR UPDATE USING (auth.role() = 'authenticated');
   CREATE POLICY "Auth delete" ON members FOR DELETE USING (auth.role() = 'authenticated');
   -- (same pattern for contributions and transactions)
   ```
7. Create seed data with 31 members (20 active, 11 inactive)
8. Add sample contributions and transactions for testing

## Todo List

- [x] Write CREATE TABLE statements (members with UNIQUE name, contributions with ON DELETE RESTRICT, transactions with contribution_id FK)
- [x] Add indexes
- [x] Enable RLS on all tables
- [x] Write RLS policies (public read, auth write; note: relies on self-signup being disabled)
- [x] Write seed SQL (31 members)
- [x] Add sample contributions (few months)
- [x] Add sample transactions
- [x] Run migrations in Supabase dashboard
- [x] Verify RLS works (anon can read, cannot write)
- [x] Confirm self-signup disabled before deploying write policies

## Success Criteria

- All 3 tables created with correct constraints
- `UNIQUE(member_id, month)` prevents duplicate contributions
- Anon user can SELECT from all tables
- Anon user CANNOT INSERT/UPDATE/DELETE
- Authenticated user can full CRUD
- Seed data loads without errors

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| RLS blocks server components | High | Use service role key for server-side reads if needed |
| UUID vs serial ID | Low | UUID chosen for security (no enumeration) |
| Month as TEXT vs DATE | Low | TEXT format `YYYY-MM` simpler for grouping/display |
