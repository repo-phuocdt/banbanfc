# Phase 6: Monthly Contribution Matrix (Đóng Tiền)

## Overview
- **Priority:** P1
- **Status:** done
- **Effort:** 3h
- Spreadsheet-like matrix view: members × months. Core feature of the app.

## Context
- Path: `/quan-ly-quy/dong-tien`
- Most complex UI component. Requires horizontal scroll with sticky columns.

## Requirements

### Functional
- Rows = members (active first, then inactive with muted style)
- Columns = months (generated from data range, e.g., 08/2025 → 04/2026)
- Paid cells: green bg with formatted amount
- Unpaid cells: clickable → popover/modal to record payment (amount pre-filled 200,000)
- Summary columns (rightmost): "Tổng đã đóng" (sum), "Số tháng" (count)
- Top controls: status filter, add new month column
- Edit/delete existing contribution by clicking paid cell

### Non-functional
- Sticky columns: STT + Họ tên when scrolling horizontally
- Responsive: horizontal scroll on mobile
- Loading skeleton for matrix

## Related Code Files

### Create
- `/app/quan-ly-quy/dong-tien/page.tsx` — server component
- `/components/contributions/contribution-matrix.tsx` — matrix client component
- `/components/contributions/payment-modal.tsx` — record/edit payment modal
- `/app/quan-ly-quy/dong-tien/actions.ts` — server actions

## Architecture

```
page.tsx (Server) → fetch members + contributions
  └── ContributionMatrix (Client)
        ├── Status filter
        ├── Matrix table (scrollable)
        │   ├── Sticky columns (STT, Name)
        │   ├── Month columns (dynamic)
        │   └── Summary columns (Total, Count)
        └── PaymentModal (add/edit/delete)
```

## Implementation Steps

1. Create server actions (each mutating action must call `await requireAdmin()` first; all return `ActionResult<T>`):
   - `getContributions()` — fetch all contributions
   - `getMembers()` — reuse from Phase 4
   - `createContribution(data): Promise<ActionResult>` — validate month format (YYYY-MM regex, must not exceed current month + 1), then in a Supabase transaction:
     1. Insert contribution record
     2. Auto-create linked Transaction record: `{ type: 'income', category: 'Quỹ hàng tháng', amount: data.amount, member_id: data.member_id, contribution_id: <new contribution id>, date: data.paid_at }`
   - `updateContribution(id, data): Promise<ActionResult>` — update amount/note; also update linked transaction amount if exists
   - `deleteContribution(id): Promise<ActionResult>` — delete contribution and linked transaction (via contribution_id FK)
2. Create page.tsx:
   - Fetch members + all contributions
   - Derive month columns from contributions data (min month to max month)
   - Pass to ContributionMatrix
3. Create ContributionMatrix:
   - Build matrix data structure: `Map<memberId, Map<month, Contribution>>`
   - Sort members: active first (alphabetical), then paused, then inactive
   - Generate month columns: array of "YYYY-MM" strings
   - Render table with:
     - Sticky first 2 cols using `sticky left-0` + `z-10`
     - Each cell: lookup contribution from matrix map
     - Paid cell: green bg, show amount, click to edit
     - Unpaid cell: light gray bg, click to add payment
   - Summary columns: sum of amounts, count of months paid
4. Create PaymentModal:
   - Mode: add or edit
   - Pre-fill amount with 200,000 (default)
   - Fields: month (YYYY-MM, validated), amount, note
   - Month validation: must match YYYY-MM, year >= 2020, month <= current month + 1. Show error "Tháng không hợp lệ" for out-of-range.
   - **Bulk payment note:** If a member pays multiple months at once (non-standard amount), create one contribution per month. The PaymentModal may optionally support "số tháng" (number of months) input to batch-create N contributions at amount/N each, or prompt operator to record manually.
   - Edit mode: show delete button
   - On save: createContribution or updateContribution (auto-creates/updates linked Transaction)
5. Add status filter (dropdown: Tất cả, Đang hoạt động, Đã nghỉ, Tạm nghỉ)
6. Style sticky columns:
   ```css
   .sticky-col { position: sticky; left: 0; z-index: 10; background: white; }
   .sticky-col-2 { position: sticky; left: 48px; z-index: 10; background: white; }
   ```
7. Month header format: "T8/2025" (T = tháng, abbreviated)

## Todo List

- [x] Create server actions for contributions CRUD (requireAdmin, ActionResult, auto-create Transaction)
- [x] Create page with data fetching
- [x] Build matrix data structure
- [x] Create matrix table with sticky columns
- [x] Create PaymentModal (add/edit/delete) with month validation (YYYY-MM, max current+1)
- [x] Implement paid/unpaid cell styling
- [x] Add status filter
- [x] Add summary columns (total, count)
- [x] Test sticky column scrolling
- [x] Test add/edit/delete contribution
- [x] Verify auto-created Transaction appears in Thu Chi page on contribution save
- [x] Test month range validation (reject future months beyond current+1)
- [x] Verify UNIQUE constraint prevents duplicates

## Success Criteria

- Matrix displays all members × all months correctly
- Clicking empty cell opens modal pre-filled with 200,000
- Paid cells show green bg with amount
- Sticky columns stay visible during horizontal scroll
- Summary columns show correct totals
- Active members sorted before inactive
- Inactive rows have muted styling
- UNIQUE(member_id, month) prevents double payment

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Sticky columns break on Safari | Medium | Test Safari, fallback to non-sticky on mobile |
| Many months = wide table | Medium | Horizontal scroll + sticky cols handles this |
| Performance with 31×9 cells | Low | Only 279 cells, no concern |
| Member pays different amount | Low | Amount field is editable, not locked to 200k |
