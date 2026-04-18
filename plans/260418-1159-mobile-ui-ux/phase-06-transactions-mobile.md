# Phase 06: Transactions Mobile

**Priority:** P2
**Status:** done
**Effort:** 2h
**Blocked by:** Phase 01, Phase 02, Phase 03

## Overview

Replace transaction table with card list on mobile. Each transaction = card with date, type icon, amount, description.

## Key Insights

- TransactionTable (119 LOC): 8 columns, progressive hiding on mobile
- Hidden: description (sm), member_name (md), running_balance (lg)
- Row background color indicates type (income green / expense red)
- TransactionPage (parent): handles filters, summary panel, modal state
- Data: `TransactionWithMember & { running_balance: number }`

## Requirements

### Functional
- Transaction cards: date, type indicator (color + icon), amount, description
- Card tap → expand for member name, running balance, actions
- Filter controls: type filter (all/income/expense), date range
- Summary panel: compact horizontal strip on mobile
- Admin: FAB "Thêm giao dịch" button

### Non-functional
- Income cards: left border green
- Expense cards: left border red
- Infinite scroll or pagination for long lists

## Related Code Files

### Reference
- `components/transactions/transaction-table.tsx` (119 LOC)
- `components/transactions/transaction-page.tsx` — parent with filters + modal state
- `components/transactions/transaction-form-modal.tsx` — form
- `components/transactions/summary-panel.tsx` — summary stats
- `app/quan-ly-quy/thu-chi/page.tsx` — data fetching

### Create
- `components/mobile/transaction-list.tsx` — card list view

### Modify
- `components/transactions/transaction-page.tsx` — conditional render mobile/desktop

## Implementation Steps

1. Create `components/mobile/transaction-list.tsx`
   ```tsx
   // Props: same as TransactionTable
   // - Compact summary strip: total income | total expense | balance
   // - Filter pills: Tất cả / Thu / Chi
   // - Card list:
   //   - Left border color: income=green, expense=red
   //   - Primary: date + description
   //   - Secondary: category + member name
   //   - Right: amount (color-coded, bold)
   //   - Expanded: running balance, edit/delete actions
   // - FAB for add
   ```

2. Update `components/transactions/transaction-page.tsx`
   - This is already a client component — can use `useIsMobile()`
   - Render TransactionList (mobile) or TransactionTable (desktop)
   - Share same filter state and modal handlers

3. Run `pnpm build`

## Todo List

- [ ] Create `components/mobile/transaction-list.tsx`
- [ ] Update TransactionPage for conditional render
- [ ] Verify filters work on mobile
- [ ] Verify form modal opens as bottom sheet
- [ ] Build passes

## Success Criteria

- All transaction data visible in card format
- Type visually clear (color coding)
- Filter controls touch-friendly
- Summary stats visible
