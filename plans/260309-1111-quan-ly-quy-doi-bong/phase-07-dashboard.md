# Phase 7: Dashboard with Charts (Tổng Quan)

## Overview
- **Priority:** P2
- **Status:** done
- **Effort:** 2h
- Summary dashboard with KPI cards, bar chart, recent transactions.

## Context
- Path: `/quan-ly-quy` (index page)
- Aggregates data from all 3 tables. Build last since it depends on complete data.

## Requirements

### Functional
- 4 summary cards: Tổng thu (green), Tổng chi (red), Còn lại (blue), Thành viên đang hoạt động (gray)
- Bar chart: Thu vs Chi by month (Recharts)
- Recent 10 transactions list with date, description, amount, type badge

### Non-functional
- Cards responsive: 2×2 on mobile, 4×1 on desktop
- Chart responsive
- Loading skeletons for cards + chart

## Related Code Files

### Create
- `/app/quan-ly-quy/page.tsx` — dashboard server component
- `/components/dashboard/summary-cards.tsx` — 4 KPI cards
- `/components/dashboard/monthly-chart.tsx` — Recharts bar chart
- `/components/dashboard/recent-transactions.tsx` — recent 10 list

## Architecture

```
page.tsx (Server) → aggregate queries
  ├── SummaryCards (income, expense, balance, active members)
  ├── MonthlyChart (income vs expense by month)
  └── RecentTransactions (latest 10)
```

## Implementation Steps

1. Create page.tsx with server-side data fetching:
   - Query total income: `SUM(amount) WHERE type='income'`
   - Query total expense: `SUM(amount) WHERE type='expense'`
   - Query active member count: `COUNT(*) WHERE status='active'`
   - Query monthly aggregates: `GROUP BY month, type`
   - Query recent 10 transactions: `ORDER BY date DESC LIMIT 10`
2. Create SummaryCards:
   - 4 cards in grid: `grid-cols-2 md:grid-cols-4`
   - Each card: icon, label, formatted amount, color accent
   - Colors: income green, expense red, balance blue, members gray
3. Create MonthlyChart:
   - Recharts `<BarChart>` with grouped bars
   - X-axis: months (formatted "T8/25")
   - Y-axis: amount in VNĐ (formatted with abbreviation: "200K")
   - Two bars per month: Thu (green) and Chi (red)
   - Tooltip shows full formatted amounts
   - Responsive container
4. Create RecentTransactions:
   - Simple list/table with 10 items
   - Each row: date, description, amount (green/red), type badge
   - "Xem tất cả" link → `/quan-ly-quy/thu-chi`

## Todo List

- [x] Create dashboard page with aggregate queries
- [x] Create SummaryCards component
- [x] Create MonthlyChart with Recharts
- [x] Create RecentTransactions list
- [x] Add loading skeletons (Suspense boundaries)
- [x] Test responsive layout
- [x] Verify totals match transaction ledger page

## Success Criteria

- All 4 summary cards show correct aggregated values
- Bar chart renders Thu vs Chi for each month
- Chart is responsive (resizes with container)
- Recent transactions match latest 10 from Thu Chi page
- Dashboard totals exactly match Thu Chi page totals
- Cards show loading skeletons during fetch

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Recharts SSR issues | Medium | Use dynamic import with `ssr: false` |
| Aggregate query performance | Low | Small dataset (<500 rows), no concern |
| Data inconsistency between pages | Medium | Both pages query same tables, no caching issues |
