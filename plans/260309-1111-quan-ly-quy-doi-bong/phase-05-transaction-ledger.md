# Phase 5: Transaction Ledger Page (Thu Chi)

## Overview
- **Priority:** P1
- **Status:** done
- **Effort:** 3h
- Full income/expense ledger with running balance, filters, summary panel.

## Context
- Path: `/quan-ly-quy/thu-chi`
- Most data-dense page. Running balance calculation is the key complexity.

## Requirements

### Functional
- Table: STT, Ngày, Thu (VNĐ), Chi (VNĐ), Nội dung, Người, Số dư lũy kế
- Income rows: green text + green-tinted background
- Expense rows: red text + pink-tinted background
- Running balance (Số dư lũy kế): cumulative sum, auto-calculated
- Filters: date range, member dropdown, income/expense toggle, category
- "Thêm giao dịch" modal with form
- Summary panel (sticky on desktop): Tổng thu, Tổng chi, Còn lại, Số giao dịch
- Sort by date descending (newest first)

### Non-functional
- Running balance calculated correctly regardless of sort order
- Summary updates when filters change
- Loading skeleton, empty state, toast notifications

## Related Code Files

### Create
- `/app/quan-ly-quy/thu-chi/page.tsx` — server component
- `/components/transactions/transaction-table.tsx` — client table with filters
- `/components/transactions/transaction-form-modal.tsx` — add/edit transaction modal
- `/components/transactions/summary-panel.tsx` — sticky summary sidebar
- `/app/quan-ly-quy/thu-chi/actions.ts` — server actions

## Architecture

```
page.tsx (Server) → fetch transactions + members (for dropdown)
  └── TransactionPage (Client)
        ├── Filters (date range, member, type, category)
        ├── TransactionTable
        │   └── rows with running balance
        ├── SummaryPanel (sticky right)
        ├── TransactionFormModal
        └── ConfirmDialog (delete)
```

## Implementation Steps

1. Create server actions (each must call `await requireAdmin()` before any mutation):
   - `getTransactions()` — fetch all, ordered by date ASC (for running balance calc). Null dates sort last.
   - `createTransaction(data): Promise<ActionResult>` — validate with `transactionSchema`, then insert
   - `updateTransaction(id, data): Promise<ActionResult>` — validate with `transactionSchema`, then update
   - `deleteTransaction(id): Promise<ActionResult>` — delete
2. Create page.tsx:
   - Fetch transactions + members list (for dropdown)
   - Pass to client component
3. Create TransactionTable:
   - Receive transactions, apply client-side filters for display only
   - **Running balance rule:** Calculate running balance on ALL transactions sorted by date ASC (full history, ignoring active filters). Then apply filters to determine which rows to display. The "Số dư lũy kế" column always reflects the full historical balance up to that transaction, not just filtered subset.
   - Transactions with null date: display as "Không rõ ngày", sort after all dated transactions
   - Display in date DESC order but with correct running balance
   - Row styling based on type:
     - Income: `bg-income-bg text-income-text` (green tones)
     - Expense: `bg-expense-bg text-expense-text` (red tones)
   - Thu column: show amount only for income rows
   - Chi column: show amount only for expense rows
4. Create filters:
   - Date range: two date inputs (từ ngày, đến ngày)
   - Member: select dropdown from members list
   - Type toggle: Tất cả / Thu / Chi
   - Category: select dropdown (dynamic based on type filter)
5. Create SummaryPanel:
   - Computed from filtered transactions
   - Tổng thu, Tổng chi, Còn lại (thu - chi), Số giao dịch
   - Desktop: sticky right column. Mobile: top summary bar
6. Create TransactionFormModal:
   - React Hook Form with `transactionSchema` (zod resolver)
   - Date picker (default today; allow clearing for "approximate/unknown date")
   - Type: radio "Thu" / "Chi"
   - Amount: number input (show formatted preview)
   - Category: dropdown filtered by type
   - Description: text
   - Member: optional dropdown
   - Note: optional textarea
7. Wire up edit/delete with confirmation
8. **Edge cases:**
   - Transactions with null date: show "Không rõ ngày" in date column, sort to bottom
   - All mutating actions return `ActionResult<T>`; UI shows toast on success/failure

## Todo List

- [x] Create server actions
- [x] Create page with data fetching
- [x] Create TransactionTable with row coloring
- [x] Implement running balance calculation
- [x] Create filter controls
- [x] Create SummaryPanel
- [x] Create TransactionFormModal
- [x] Wire up edit/delete
- [x] Test running balance accuracy
- [x] Test filter combinations
- [x] Verify summary updates with filters

## Success Criteria

- Running balance matches manual calculation
- Filters correctly narrow displayed transactions
- Summary panel reflects filtered data
- Income/expense rows clearly distinguished by color
- Add transaction → appears in table, balance updates
- Category dropdown changes based on Thu/Chi selection
- "Số dư lũy kế" correct when sorted newest-first

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Running balance with filters | High | Calculate balance on ALL data, then filter for display |
| Large transaction count performance | Low | Pagination if >500 rows (unlikely for team use) |
| Date range filter edge cases | Medium | Use start-of-day / end-of-day boundaries |
