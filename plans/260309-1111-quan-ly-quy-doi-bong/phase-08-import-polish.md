# Phase 8: CSV Import + Polish

## Overview
- **Priority:** P2
- **Status:** done
- **Effort:** 2h
- Import existing Google Sheets data via CSV, final UI polish.

## Context
- Team has 9 months of existing data in Google Sheets
- Need one-time import script to seed real data
- Final pass for UI consistency, edge cases, accessibility

## Requirements

### Functional
- CSV import script for members + contributions + transactions
- Handle existing data format from Google Sheets
- Deduplication (skip if member/contribution already exists)

### Non-functional
- Script runs locally via `npx tsx scripts/import-csv.ts`
- Dry-run mode for preview
- Error reporting (which rows failed)

## Related Code Files

### Create
- `/scripts/import-csv.ts` — main import script
- `/scripts/data/members.csv` — exported member data (placeholder)
- `/scripts/data/contributions.csv` — exported contribution data (placeholder)
- `/scripts/data/transactions.csv` — exported transaction data (placeholder)

### Modify
- Various components for polish (minor fixes)

## Implementation Steps

### CSV Import

1. Create import script structure:
   ```ts
   // scripts/import-csv.ts
   // Uses SUPABASE_SERVICE_ROLE_KEY from env (required for bypassing RLS during import)
   import { createClient } from '@supabase/supabase-js'
   import { parse } from 'csv-parse/sync' // install csv-parse
   import { readFileSync } from 'fs'

   const supabase = createClient(
     process.env.SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY! // never expose this client-side
   )
   ```
   > **Security note:** `SUPABASE_SERVICE_ROLE_KEY` must be in `.env.local` (never committed). Add `.env.local` to `.gitignore`. Add `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here` placeholder to `.env.local.example`.
2. Import members:
   - Read CSV: columns [name, status, joined_at, note]
   - Map status: "Đang hoạt động"→"active", "Đã nghỉ"→"inactive", "Tạm nghỉ"→"paused"
   - Upsert by name (ON CONFLICT DO NOTHING or update)
3. Import contributions:
   - Read CSV: columns [member_name, month, amount, paid_at, note]
   - Lookup member_id by name — **must error if name not found or ambiguous** (name is UNIQUE in DB, so ambiguity = trimming/case mismatch; log warning and skip row, continue)
   - Insert contribution (skip if UNIQUE violation)
4. Import transactions:
   - Read CSV: columns [date, type, amount, category, description, member_name, note]
   - Map type: "Thu"→"income", "Chi"→"expense"
   - Lookup member_id by name (nullable) — log warning if name provided but not matched
   - Insert transaction
5. Add CLI flags:
   - `--dry-run` — parse and validate only, no DB writes; print what would be inserted
   - `--verbose` — log each row
6. Error handling: collect failed rows, print summary at end with counts: imported, skipped (duplicates), errors (name not found)

### Polish Tasks

7. Test all pages end-to-end with real data
8. Verify number formatting consistency (200.000 everywhere)
9. Verify date formatting (DD/MM/YYYY everywhere)
10. Check empty states display correctly
11. Test mobile responsiveness on all 4 pages
12. Ensure toast notifications work for all CRUD ops
13. Add favicon and page titles (Vietnamese)
14. Test admin login → CRUD → logout flow

## Todo List

- [x] Install csv-parse
- [x] Verify `.env.local` in `.gitignore` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local.example`
- [x] Create import script structure (service role client)
- [x] Implement member import
- [x] Implement contribution import (error on missing/ambiguous name)
- [x] Implement transaction import (warn on unmatched name)
- [x] Add --dry-run mode
- [x] Test import with sample CSV (verify name-match error reporting)
- [x] Polish: verify number/date formatting
- [x] Polish: test empty states
- [x] Polish: test mobile responsive
- [x] Polish: add favicon + page titles
- [x] Polish: test full admin flow
- [x] Final build verification

## Success Criteria

- Import script runs without errors on real CSV data
- All existing members/contributions/transactions imported
- No duplicate records after re-running import
- Dry-run mode shows preview without DB changes
- All 4 pages render correctly with real data
- Number/date formatting consistent across app
- Mobile layout works on all pages
- `npm run build` passes clean

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| CSV format mismatch | Medium | Provide sample CSV template, validate headers |
| Vietnamese diacritics in CSV | Medium | Use UTF-8 encoding explicitly |
| Member name matching for lookups | Medium | Trim whitespace, case-insensitive match |
| Google Sheets date format | Medium | Parse multiple date formats with date-fns |
